/**
 * Local Cryptographic Integrity Testing Service (Professor Only)
 *
 * Implements client-side SHA-256 fingerprinting using the Web Crypto API.
 * This read-only testing tool compares a locally selected PDF against the
 * trusted hash stored for an existing student submission.
 *
 * Zero-Side-Effect Guarantee:
 * - No file is uploaded or persisted to the server.
 * - No database records are created or modified.
 * - No transactions are submitted to the blockchain.
 * - The original submission's trusted hash remains immutable.
 */

export type IntegrityTestResultStatus = "MATCH" | "MISMATCH" | "UNABLE TO VERIFY";

export interface IntegrityTestResult {
  status: IntegrityTestResultStatus;
  calculatedHash: string;
  trustedHash: string | null;
  fileName: string;
  fileSize: number;
  message: string;
  testedAt: string;
  blockchainStatus?: string;
}

export interface FileLike {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

/**
 * Normalizes a cryptographic hash string (trims whitespace, converts to lowercase).
 */
export function normalizeHash(hash: string | null | undefined): string {
  return hash ? hash.trim().toLowerCase() : "";
}

/**
 * Validates whether an ArrayBuffer begins with the standard PDF magic bytes: `%PDF-` (0x25, 0x50, 0x44, 0x46, 0x2D).
 */
export function validatePdfBytes(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 5) {
    return false;
  }
  const bytes = new Uint8Array(buffer, 0, 5);
  return (
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d    // -
  );
}

/**
 * Validates a candidate file for integrity testing.
 * Rejects non-PDF extensions and files failing magic byte inspection.
 */
export async function validatePdfFile(file: FileLike | null | undefined): Promise<{
  isValid: boolean;
  error?: string;
  buffer?: ArrayBuffer;
}> {
  if (!file) {
    return {
      isValid: false,
      error: "No file selected. Please select a local PDF file to test.",
    };
  }

  if (typeof file.name !== "string" || !file.name.toLowerCase().endsWith(".pdf")) {
    return {
      isValid: false,
      error: "Invalid file type: Selected file must have a .pdf extension.",
    };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (err) {
    return {
      isValid: false,
      error: `Failed to read file: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!validatePdfBytes(buffer)) {
    return {
      isValid: false,
      error: "Invalid file type: File is not a valid PDF document (missing %PDF- header).",
    };
  }

  return {
    isValid: true,
    buffer,
  };
}

/**
 * Calculates SHA-256 hexadecimal hash using the standard Web Crypto API.
 */
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const digestBuffer = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  const byteArray = Array.from(new Uint8Array(digestBuffer));
  return byteArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface RunIntegrityTestOptions {
  file: FileLike | null | undefined;
  trustedHash: string | null | undefined;
  userRole?: string | null | undefined;
  blockchainProofStatus?: string | null | undefined;
}

/**
 * Executes a safe, read-only local integrity test.
 * Compares the SHA-256 hash of a local PDF against the submission's trusted original hash.
 */
export async function runLocalIntegrityTest(
  options: RunIntegrityTestOptions
): Promise<IntegrityTestResult> {
  const { file, trustedHash, userRole, blockchainProofStatus } = options;

  // 1. Enforce professor-only authorization
  if (userRole && userRole !== "professor") {
    throw new Error("Access denied: Only authenticated professors can run integrity tests.");
  }

  // 2. Validate file presence and PDF format
  const validation = await validatePdfFile(file);
  if (!validation.isValid || !validation.buffer) {
    throw new Error(validation.error || "File validation failed.");
  }

  // 3. Compute SHA-256 of the local PDF
  const calculatedHash = await computeSha256(validation.buffer);
  const normalizedCalculated = normalizeHash(calculatedHash);
  const normalizedTrusted = normalizeHash(trustedHash);

  const blockchainStatus = blockchainProofStatus || "NOT_CHECKED";

  // 4. Missing trusted hash handling
  // CRITICAL SECURITY RULE: Never substitute calculated hash as the expected hash.
  if (!normalizedTrusted) {
    return {
      status: "UNABLE TO VERIFY",
      calculatedHash: normalizedCalculated,
      trustedHash: null,
      fileName: file!.name,
      fileSize: file!.size,
      message:
        "Unable to verify: The selected submission does not have an original trusted hash recorded.",
      testedAt: new Date().toISOString(),
      blockchainStatus,
    };
  }

  // 5. Compare hashes
  if (normalizedCalculated === normalizedTrusted) {
    return {
      status: "MATCH",
      calculatedHash: normalizedCalculated,
      trustedHash: normalizedTrusted,
      fileName: file!.name,
      fileSize: file!.size,
      message:
        "Cryptographic match confirmed: The local PDF's SHA-256 hash exactly matches the trusted hash of the selected submission.",
      testedAt: new Date().toISOString(),
      blockchainStatus,
    };
  }

  return {
    status: "MISMATCH",
    calculatedHash: normalizedCalculated,
    trustedHash: normalizedTrusted,
    fileName: file!.name,
    fileSize: file!.size,
    message:
      "Cryptographic mismatch detected: The local PDF's SHA-256 hash differs from the trusted submission hash. The document content differs.",
    testedAt: new Date().toISOString(),
    blockchainStatus,
  };
}
