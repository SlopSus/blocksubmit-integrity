import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, FileText, Search, X } from "lucide-react";
import { format } from "date-fns";
import { submissionService } from "@/services";
import type { IntegrityStatus, Submission } from "@/types/domain";
import {
  EmptyState,
  HashComparison,
  Info,
  PageHeading,
  ProofPanel,
  StatusBadge,
} from "@/components/blocksubmit/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SubmissionsPage({ role }: { role: "professor" | "student" }) {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | IntegrityStatus>("ALL");

  useEffect(() => {
    submissionService.list(role).then(setItems);
  }, [role]);

  const visible = useMemo(
    () =>
      items?.filter(
        (s) =>
          (filter === "ALL" || s.status === filter) &&
          `${s.assignmentTitle} ${s.documentName} ${s.student.name}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ) ?? [],
    [items, filter, query]
  );

  const gridCols =
    role === "professor"
      ? "md:grid-cols-[1.1fr_1.4fr_1.2fr_.8fr_.8fr_auto]"
      : "md:grid-cols-[1.5fr_1.5fr_.8fr_.8fr_auto]";

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow={role === "student" ? "DOCUMENT HISTORY" : "SUBMISSION REGISTER"}
        title={role === "student" ? "My submissions" : "Submissions"}
        description={
          role === "student"
            ? "Review document records and their integrity status."
            : "Inspect every student document and prioritize records needing verification."
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            placeholder="Search assignment or document"
          />
        </div>
        <div className="flex gap-1 rounded-md border bg-surface p-1">
          {(["ALL", "PENDING", "VERIFIED", "TAMPERED"] as const).map((v) => (
            <Button
              key={v}
              variant={filter === v ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>
      {items === null ? (
        <Skeleton className="h-96" />
      ) : visible.length === 0 ? (
        <EmptyState title="No submissions found" detail="Try another search or status filter." />
      ) : (
        <section className="panel overflow-hidden rounded-lg">
          <div
            className={cn(
              "hidden gap-4 border-b px-5 py-3 text-[11px] font-bold text-muted-foreground md:grid",
              gridCols
            )}
          >
            <span>{role === "professor" ? "STUDENT" : "ASSIGNMENT"}</span>
            {role === "professor" && <span>ASSIGNMENT</span>}
            <span>DOCUMENT</span>
            <span>SUBMITTED</span>
            <span>STATUS</span>
            <span>ACTION</span>
          </div>
          <div className="divide-y">
            {visible.map((s) => (
              <div key={s.id} className={cn("grid gap-3 p-5 md:items-center", gridCols)}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {role === "professor" ? s.student.name : s.assignmentTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {role === "professor" ? s.student.email : s.student.name}
                  </p>
                </div>
                {role === "professor" && <p className="truncate text-sm">{s.assignmentTitle}</p>}
                <p className="truncate text-sm text-muted-foreground">{s.documentName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(s.submittedAt), "MMM d, h:mm a")}
                </p>
                <StatusBadge status={s.status} />
                <Button asChild variant="ghost" size="sm">
                  <Link
                    to={
                      role === "student"
                        ? "/student/submissions/$id"
                        : "/professor/submissions/$id"
                    }
                    params={{ id: s.id }}
                  >
                    Details
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function SubmissionDetailPage({ role, id }: { role: "professor" | "student"; id: string }) {
  const [item, setItem] = useState<Submission | null | undefined>(undefined);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    submissionService.list(role).then((v) => setItem(v.find((x) => x.id === id) ?? null));
  }, [id, role]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function viewDocument(openInNewTab = false) {
    if (!item) return;
    setDocLoading(true);
    setDocError("");
    try {
      const blob = await submissionService.getDocumentBlob(item.id);
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
    if (!item) return;
    setDocLoading(true);
    setDocError("");
    try {
      const blob = await submissionService.getDocumentBlob(item.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.documentName || "document.pdf";
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

  if (item === undefined) return <Skeleton className="h-96" />;
  if (!item) return <EmptyState title="Submission not found" detail="This submission is unavailable." />;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="SUBMISSION RECORD"
        title={item.documentName}
        description={`Submitted for ${item.assignmentTitle}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {role === "professor" && (
              <Button asChild>
                <Link to="/professor/verification" search={{ id: item.id }}>
                  Verify document
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => viewDocument(false)}
              disabled={docLoading}
            >
              <FileText className="size-4" />
              {docLoading ? "Loading PDF…" : "View Document"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadDocument}
              disabled={docLoading}
              title="Download original PDF"
            >
              <Download className="size-4" />
            </Button>
          </div>
        }
      />

      {docError && <p className="text-sm text-destructive">{docError}</p>}

      {previewUrl && (
        <section className="panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{item.documentName}</h3>
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
            title={`PDF Preview - ${item.documentName}`}
          />
        </section>
      )}

      <section className="panel rounded-lg p-5">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center">
          <span className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary">
            <FileText />
          </span>
          <div className="flex-1">
            <h2 className="font-semibold">{item.documentName}</h2>
            <p className="text-sm text-muted-foreground">
              {(item.fileSize / 1e6).toFixed(2)} MB · PDF document
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <dl className="mt-5 grid gap-5 sm:grid-cols-3">
          <Info label="Student" value={item.student.name} />
          <Info label="Assignment" value={item.assignmentTitle} />
          <Info label="Submitted" value={format(new Date(item.submittedAt), "MMM d, yyyy · h:mm a")} />
        </dl>
      </section>
      <HashComparison submission={item} />
      <ProofPanel proof={item.proof} />
    </div>
  );
}
