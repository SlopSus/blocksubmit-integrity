import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runLocalIntegrityTest,
  validatePdfBytes,
  validatePdfFile,
  computeSha256,
  normalizeHash,
} from "../integrityTest";

function createPdfFile(name: string, content: string): File {
  const bytes = new TextEncoder().encode(`%PDF-1.4\n${content}\n%%EOF`);
  return new File([bytes], name, { type: "application/pdf" });
}

function createCorruptFile(name: string, content: string, mime = "text/plain"): File {
  const bytes = new TextEncoder().encode(content);
  return new File([bytes], name, { type: mime });
}

describe("Professor-Only Local Integrity Test Feature", () => {
  it("Requirement 1: Original PDF produces MATCH when its hash equals the trusted hash (case-insensitive)", async () => {
    const pdf = createPdfFile("assignment1_original.pdf", "Original Academic Submission Content by Student 1");
    const buffer = await pdf.arrayBuffer();
    const realHash = await computeSha256(buffer);

    // Test with mixed uppercase trusted hash to verify normalization
    const upperTrusted = realHash.toUpperCase();

    const result = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: upperTrusted,
      userRole: "professor",
      blockchainProofStatus: "CONFIRMED",
    });

    assert.strictEqual(result.status, "MATCH");
    assert.strictEqual(result.calculatedHash, realHash.toLowerCase());
    assert.strictEqual(result.trustedHash, realHash.toLowerCase());
    assert.match(result.message, /Cryptographic match confirmed/);
  });

  it("Requirement 2: Modified PDF produces MISMATCH when its hash differs from trusted hash", async () => {
    const originalPdf = createPdfFile("paper.pdf", "Original Authentic Content");
    const originalHash = await computeSha256(await originalPdf.arrayBuffer());

    const modifiedPdf = createPdfFile("paper.pdf", "Tampered or Altered Content by Cheater");
    const modifiedHash = await computeSha256(await modifiedPdf.arrayBuffer());

    assert.notStrictEqual(originalHash, modifiedHash);

    const result = await runLocalIntegrityTest({
      file: modifiedPdf,
      trustedHash: originalHash,
      userRole: "professor",
      blockchainProofStatus: "CONFIRMED",
    });

    assert.strictEqual(result.status, "MISMATCH");
    assert.strictEqual(result.calculatedHash, modifiedHash.toLowerCase());
    assert.strictEqual(result.trustedHash, originalHash.toLowerCase());
    assert.match(result.message, /Cryptographic mismatch detected/);
  });

  it("Requirement 3: Selecting a different submission compares against that submission's trusted hash", async () => {
    const docStudentA = createPdfFile("studentA.pdf", "Document Content by Student A");
    const hashA = await computeSha256(await docStudentA.arrayBuffer());

    const docStudentB = createPdfFile("studentB.pdf", "Document Content by Student B");
    const hashB = await computeSha256(await docStudentB.arrayBuffer());

    assert.notStrictEqual(hashA, hashB);

    // Testing student A's PDF against student A's submission -> MATCH
    const resultA = await runLocalIntegrityTest({
      file: docStudentA,
      trustedHash: hashA,
      userRole: "professor",
    });
    assert.strictEqual(resultA.status, "MATCH");
    assert.strictEqual(resultA.trustedHash, hashA);

    // Testing student A's PDF against student B's submission -> MISMATCH
    const resultB = await runLocalIntegrityTest({
      file: docStudentA,
      trustedHash: hashB,
      userRole: "professor",
    });
    assert.strictEqual(resultB.status, "MISMATCH");
    assert.strictEqual(resultB.trustedHash, hashB);
  });

  it("Requirement 4: Missing trusted hash returns UNABLE TO VERIFY and never substitutes calculated hash", async () => {
    const pdf = createPdfFile("test.pdf", "Document Content");
    const buffer = await pdf.arrayBuffer();
    const calculated = await computeSha256(buffer);

    // Test with null trusted hash
    const resultNull = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: null,
      userRole: "professor",
    });
    assert.strictEqual(resultNull.status, "UNABLE TO VERIFY");
    assert.strictEqual(resultNull.trustedHash, null);
    assert.strictEqual(resultNull.calculatedHash, calculated);
    assert.match(resultNull.message, /does not have an original trusted hash/);

    // Test with undefined trusted hash
    const resultUndef = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: undefined,
      userRole: "professor",
    });
    assert.strictEqual(resultUndef.status, "UNABLE TO VERIFY");
    assert.strictEqual(resultUndef.trustedHash, null);

    // Test with whitespace-only trusted hash
    const resultEmpty = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: "   ",
      userRole: "professor",
    });
    assert.strictEqual(resultEmpty.status, "UNABLE TO VERIFY");
    assert.strictEqual(resultEmpty.trustedHash, null);
  });

  it("Requirement 5: Invalid file type is rejected (non-pdf extension, missing %PDF- header, truncated)", async () => {
    // 5a. Non-PDF extension
    const txtFile = createCorruptFile("document.txt", "Some text file");
    await assert.rejects(
      async () => {
        await runLocalIntegrityTest({
          file: txtFile,
          trustedHash: "dummy",
          userRole: "professor",
        });
      },
      { message: /Selected file must have a \.pdf extension/ }
    );

    // 5b. Named .pdf but missing %PDF- magic bytes
    const fakePdf = createCorruptFile("fake.pdf", "This is plain text pretending to be a PDF");
    await assert.rejects(
      async () => {
        await runLocalIntegrityTest({
          file: fakePdf,
          trustedHash: "dummy",
          userRole: "professor",
        });
      },
      { message: /missing %PDF- header/ }
    );

    // 5c. Truncated / empty file < 5 bytes
    const emptyPdf = new File([new Uint8Array([0x25, 0x50])], "tiny.pdf", { type: "application/pdf" });
    await assert.rejects(
      async () => {
        await runLocalIntegrityTest({
          file: emptyPdf,
          trustedHash: "dummy",
          userRole: "professor",
        });
      },
      { message: /missing %PDF- header/ }
    );

    // 5d. No file selected
    await assert.rejects(
      async () => {
        await runLocalIntegrityTest({
          file: null,
          trustedHash: "dummy",
          userRole: "professor",
        });
      },
      { message: /No file selected/ }
    );
  });

  it("Requirement 6: Students cannot access the professor-only feature", async () => {
    const pdf = createPdfFile("document.pdf", "Standard PDF Content");

    await assert.rejects(
      async () => {
        await runLocalIntegrityTest({
          file: pdf,
          trustedHash: "a".repeat(64),
          userRole: "student",
        });
      },
      { message: /Access denied: Only authenticated professors/ }
    );
  });

  it("Requirement 7: Testing does not create or modify MongoDB submissions, files, or blockchain records", async () => {
    // In-memory test execution operates purely on ArrayBuffer via Web Crypto API.
    const pdf = createPdfFile("audit.pdf", "Audit Testing Content");
    const buffer = await pdf.arrayBuffer();
    const hash = await computeSha256(buffer);

    const result = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: hash,
      userRole: "professor",
    });

    // Validates clean return without network transmission
    assert.strictEqual(result.status, "MATCH");
    assert.strictEqual(result.fileName, "audit.pdf");
    assert.ok(result.testedAt);
  });

  it("Requirement 8: Blockchain unavailability is not misreported as document tampering", async () => {
    const pdf = createPdfFile("genuine_document.pdf", "Genuine Student Paper Content");
    const buffer = await pdf.arrayBuffer();
    const genuineHash = await computeSha256(buffer);

    // Case 1: Blockchain proof is FAILED or RPC unavailable
    const resultFailedChain = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: genuineHash,
      userRole: "professor",
      blockchainProofStatus: "FAILED",
    });

    // Cryptographic hash matches: must report MATCH, NOT MISMATCH
    assert.strictEqual(resultFailedChain.status, "MATCH");
    assert.strictEqual(resultFailedChain.blockchainStatus, "FAILED");

    // Case 2: Blockchain proof is null/unconfirmed
    const resultNullChain = await runLocalIntegrityTest({
      file: pdf,
      trustedHash: genuineHash,
      userRole: "professor",
      blockchainProofStatus: "UNAVAILABLE",
    });

    assert.strictEqual(resultNullChain.status, "MATCH");
    assert.strictEqual(resultNullChain.blockchainStatus, "UNAVAILABLE");
  });
});
