import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { submissionService, verificationService } from "@/services";
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
  const [items, setItems] = useState<Submission[] | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [busy, setBusy] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    setSelected(items?.find((x) => x.id === id) ?? null);
  }

  async function verify() {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await verificationService.verify(selected.id);
      setSelected(updated);
      setItems((v) => (v ? v.map((x) => (x.id === selected.id ? updated : x)) : null));
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
        </>
      )}
    </div>
  );
}
