import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { submissionService, verificationService, runLocalIntegrityTest, type IntegrityTestResult } from "@/services";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types/domain";
import {
  EmptyState,
  HashComparison,
  PageHeading,
  ProofPanel,
  StatusBadge,
} from "@/components/blocksubmit/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function VerificationPage({ targetId }: { targetId?: string | undefined }) {
  const { user } = useAuth();
  const isProfessor = user?.role === "professor";

  const [items, setItems] = useState<Submission[] | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [busy, setBusy] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [testFile, setTestFile] = useState<File | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testError, setTestError] = useState("");
  const [testResult, setTestResult] = useState<IntegrityTestResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    submissionService.list("professor").then((v) => {
      setItems(v);
      if (targetId) {
        const found = v.find(
          (x) =>
            x.id === targetId ||
            (x as any)._id === targetId ||
            (x as any).submissionId === targetId
        );
        // Only select if found; do not accidentally verify a different submission
        setSelected(found ?? null);
      } else {
        setSelected(v[0] ?? null);
      }
    });
  }, [targetId]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleSelect(id: string) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setDocError("");
    setVerifyError("");
    setTestError("");
    setTestResult(null);
    setSelected(items?.find((x) => x.id === id) ?? null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setTestFile(file);
    setTestError("");
    setTestResult(null);
  }

  function handleClearTestFile() {
    setTestFile(null);
    setTestError("");
    setTestResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function executeIntegrityTest() {
    if (!isProfessor) {
      setTestError("Access denied: Only authenticated professors can run integrity tests.");
      return;
    }
    if (!selected) {
      setTestError("Please select a student submission to test against.");
      return;
    }
    if (!testFile) {
      setTestError("No file selected: Please select a local PDF file to test.");
      return;
    }

    setTestBusy(true);
    setTestError("");
    try {
      const res = await runLocalIntegrityTest({
        file: testFile,
        trustedHash: selected.trustedHash,
        userRole: user?.role,
        blockchainProofStatus: selected.proof?.status ?? "NOT_RECORDED",
      });
      setTestResult(res);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Failed to run integrity test.");
      setTestResult(null);
    } finally {
      setTestBusy(false);
    }
  }

  async function verify() {
    if (!selected) return;
    setBusy(true);
    setVerifyError("");
    try {
      const updated = await verificationService.verify(selected.id);
      setSelected(updated);
      setItems((v) => (v ? v.map((x) => (x.id === selected.id ? updated : x)) : null));
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function viewDocument(openInNewTab = false) {
    if (!selected) return;
    setDocLoading(true);
    setDocError("");
    try {
      const blob = await submissionService.getDocumentBlob(selected.id);
      const url = URL.createObjectURL(blob);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
      if (openInNewTab) {
        window.open(url, "_blank");
      }
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Failed to load document.");
    } finally {
      setDocLoading(false);
    }
  }

  async function downloadDocument() {
    if (!selected) return;
    setDocLoading(true);
    setDocError("");
    try {
      const blob = await submissionService.getDocumentBlob(selected.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selected.documentName || "document.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Failed to download document.");
    } finally {
      setDocLoading(false);
    }
  }

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="CRYPTOGRAPHIC ASSURANCE"
        title="Document integrity verification"
        description="Compare the current PDF fingerprint with the trusted hash recorded at submission."
      />
      <section className="panel rounded-lg p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selected?.id ?? ""} onValueChange={handleSelect}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={items && items.length > 0 ? "Select a submission" : "No submissions available"} />
            </SelectTrigger>
            <SelectContent>
              {items?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.student.name} — {s.documentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button onClick={verify} disabled={!selected || busy}>
              <Search className="size-4" />
              {busy ? "Verifying…" : "Verify document"}
            </Button>
            <Button
              variant="outline"
              onClick={() => viewDocument(false)}
              disabled={!selected || docLoading || busy}
            >
              <FileText className="size-4" />
              {docLoading ? "Loading PDF…" : "View Document"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadDocument}
              disabled={!selected || docLoading || busy}
              title="Download original PDF"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
        {docError && <p className="mt-3 text-sm text-destructive">{docError}</p>}
        {verifyError && <p className="mt-3 text-sm text-destructive">{verifyError}</p>}
      </section>

      {previewUrl && selected && (
        <section className="panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{selected.documentName}</h3>
                <p className="text-xs text-muted-foreground">Original submitted PDF</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(previewUrl, "_blank")}>
                <ExternalLink className="size-3.5" />
                New tab
              </Button>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                <X className="size-3.5" />
                Close preview
              </Button>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="h-[600px] w-full rounded-md border bg-background"
            title={`PDF Preview - ${selected.documentName}`}
          />
        </section>
      )}

      {items === null ? (
        <Skeleton className="h-96" />
      ) : items.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="No submissions available to verify"
            detail="Student document submissions will appear here once submitted. You can monitor coursework submissions in the register."
          />
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/professor/submissions">View submissions register</Link>
            </Button>
          </div>
        </div>
      ) : !selected ? (
        <div className="space-y-4">
          <EmptyState
            title="No submission selected"
            detail={
              targetId
                ? `The requested submission ("${targetId}") was not found in the submissions register. Please choose an available submission from the selector above.`
                : "Choose a student document from the selector above to inspect its cryptographic integrity."
            }
          />
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/professor/submissions">Return to submissions register</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section
            className={
              selected.status === "VERIFIED"
                ? "rounded-lg border border-success/25 bg-success/10 p-7"
                : selected.status === "TAMPERED"
                  ? "rounded-lg border border-destructive/25 bg-destructive/10 p-7"
                  : "rounded-lg border border-warning/25 bg-warning/10 p-7"
            }
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span
                className={
                  selected.status === "VERIFIED"
                    ? "grid size-14 place-items-center rounded-full bg-success/15 text-success"
                    : selected.status === "TAMPERED"
                      ? "grid size-14 place-items-center rounded-full bg-destructive/15 text-destructive"
                      : "grid size-14 place-items-center rounded-full bg-warning/15 text-warning"
                }
              >
                {selected.status === "VERIFIED" ? (
                  <CheckCircle2 />
                ) : selected.status === "TAMPERED" ? (
                  <AlertTriangle />
                ) : (
                  <ShieldCheck />
                )}
              </span>
              <div>
                <StatusBadge status={selected.status} />
                <h2 className="mt-3 text-xl font-semibold">
                  {selected.status === "VERIFIED"
                    ? "DOCUMENT INTEGRITY CONFIRMED"
                    : selected.status === "TAMPERED"
                      ? "DOCUMENT INTEGRITY COMPROMISED"
                      : "VERIFICATION PENDING"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.status === "VERIFIED"
                    ? "Current document hash matches the trusted submission hash."
                    : selected.status === "TAMPERED"
                      ? "Current document hash does not match the trusted submission hash."
                      : "The backend has not returned a verification result yet."}
                </p>
              </div>
            </div>
          </section>
          <HashComparison submission={selected} />
          <ProofPanel proof={selected.proof} />

          {isProfessor && (
            <section
              className="panel rounded-lg p-6 space-y-5 border border-primary/20"
              aria-label="Test Integrity (Professor Only)"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
                      Test Integrity (Professor Only)
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      Local document comparison test
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a local PDF from your computer to verify whether its SHA-256 fingerprint matches the original
                  trusted hash for this submission. This is a read-only client-side audit powered by the Web Crypto API.
                  It never uploads files, alters MongoDB submissions, or submits blockchain transactions.
                </p>
              </div>

              {/* Target Submission Context */}
              <div className="rounded-md border bg-muted/40 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-foreground">Target Submission: </span>
                  <span className="font-medium text-foreground">
                    {selected.student.name} — {selected.documentName}
                  </span>
                  <span className="text-muted-foreground ml-2">(ID: {selected.id})</span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground break-all">
                  {selected.trustedHash ? (
                    <span>Trusted: {selected.trustedHash.slice(0, 10)}…{selected.trustedHash.slice(-8)}</span>
                  ) : (
                    <span className="text-amber-500 font-semibold">No trusted hash recorded</span>
                  )}
                </div>
              </div>

              {/* File Picker & Test Trigger */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="professor-pdf-picker"
                    disabled={testBusy}
                  />
                  <label
                    htmlFor="professor-pdf-picker"
                    className={cn(
                      "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground",
                      testBusy && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <span className="truncate text-muted-foreground">
                      {testFile ? (
                        <span className="text-foreground font-medium">
                          {testFile.name} ({(testFile.size / 1024).toFixed(1)} KB)
                        </span>
                      ) : (
                        "Select local PDF to compare with trusted hash…"
                      )}
                    </span>
                    <Upload className="size-4 shrink-0 text-muted-foreground ml-2" />
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={executeIntegrityTest}
                    disabled={testBusy}
                    className="shrink-0"
                  >
                    {testBusy ? (
                      <>
                        <RefreshCw className="size-4 animate-spin mr-1" />
                        Testing…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4 mr-1" />
                        Test Integrity
                      </>
                    )}
                  </Button>
                  {testFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearTestFile}
                      disabled={testBusy}
                      title="Clear selected file"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Error / Validation Prompt */}
              {testError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Integrity Test Notice</p>
                    <p>{testError}</p>
                  </div>
                </div>
              )}

              {/* Test Result Display */}
              {testResult && (
                <div
                  className={cn(
                    "rounded-lg border p-4 space-y-4",
                    testResult.status === "MATCH"
                      ? "border-success/30 bg-success/10"
                      : testResult.status === "MISMATCH"
                        ? "border-destructive/30 bg-destructive/10"
                        : "border-warning/30 bg-warning/10"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-border/50">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-full",
                          testResult.status === "MATCH"
                            ? "bg-success/20 text-success"
                            : testResult.status === "MISMATCH"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-warning/20 text-warning"
                        )}
                      >
                        {testResult.status === "MATCH" ? (
                          <CheckCircle2 className="size-5" />
                        ) : testResult.status === "MISMATCH" ? (
                          <AlertTriangle className="size-5" />
                        ) : (
                          <Info className="size-5" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider",
                              testResult.status === "MATCH"
                                ? "border-success/30 bg-success/20 text-success"
                                : testResult.status === "MISMATCH"
                                  ? "border-destructive/30 bg-destructive/20 text-destructive"
                                  : "border-warning/30 bg-warning/20 text-warning"
                            )}
                          >
                            {testResult.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            File: {testResult.fileName}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-foreground font-medium">
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Blockchain Record Status:
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {testResult.blockchainStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-md border bg-background/60 p-3">
                      <p className="font-semibold text-muted-foreground text-[10px] uppercase">
                        Selected Local PDF SHA-256
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-foreground break-all">
                        {testResult.calculatedHash}
                      </p>
                    </div>
                    <div className="rounded-md border bg-background/60 p-3">
                      <p className="font-semibold text-muted-foreground text-[10px] uppercase">
                        Original Submission Trusted Hash
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-foreground break-all">
                        {testResult.trustedHash ?? "Not recorded (Missing from submission record)"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
