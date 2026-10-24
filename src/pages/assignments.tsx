import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  CalendarDays,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { assignmentService } from "@/services";
import type { Assignment, AssignmentStatus } from "@/types/domain";
import { PageHeading, EmptyState, StatusBadge } from "@/components/blocksubmit/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentsPage({ role }: { role: "professor" | "student" }) {
  const [items, setItems] = useState<Assignment[] | null>(null);
  const [open, setOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    assignmentService.list().then(setItems);
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const deadlineVal = String(form.get("deadline") || "");

    if (!title || title.length < 3) {
      setCreateError("Assignment title must be at least 3 characters.");
      setIsCreating(false);
      return;
    }
    if (!description || description.length < 5) {
      setCreateError("Assignment description must be at least 5 characters.");
      setIsCreating(false);
      return;
    }
    const parsedDeadline = new Date(deadlineVal);
    if (isNaN(parsedDeadline.getTime()) || parsedDeadline.getTime() <= Date.now()) {
      setCreateError("Deadline must be a valid future date and time.");
      setIsCreating(false);
      return;
    }

    try {
      const item = await assignmentService.create({
        title,
        description,
        deadline: parsedDeadline.toISOString(),
      });
      setItems((v) => (v ? [item, ...v] : [item]));
      setOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow={role === "professor" ? "COURSEWORK MANAGEMENT" : "ASSIGNMENT BROWSER"}
        title="Assignments"
        description={
          role === "professor"
            ? "Create coursework, monitor deadlines, and open submission records."
            : "Review active coursework and submit your documents securely."
        }
        action={
          role === "professor" ? (
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) setCreateError("");
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus />
                  Create assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={create}>
                  <DialogHeader>
                    <DialogTitle>Create assignment</DialogTitle>
                    <DialogDescription>
                      Publish a new assignment for student submissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="my-6 space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        className="mt-2"
                        required
                      />
                    </div>
                    {createError && (
                      <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {createError}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create assignment"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />
      {items === null ? (
        <Skeleton className="h-96" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          detail="Assignments will appear here when available."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((a) => {
            const isExpired = new Date(a.deadline).getTime() <= Date.now();
            const displayStatus =
              a.status === "ACTIVE" && isExpired ? "CLOSED" : a.status;

            return (
              <article key={a.id} className="panel rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                      displayStatus === "ACTIVE"
                        ? "border-success/25 bg-success/10 text-success"
                        : displayStatus === "ARCHIVED"
                          ? "border-muted bg-muted text-muted-foreground"
                          : "border-destructive/25 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {displayStatus}
                  </span>
                </div>
                <p className="mt-5 text-xs font-bold text-primary">{a.code}</p>
                <h2 className="mt-1 text-lg font-semibold">{a.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {a.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Due {format(new Date(a.deadline), "MMM d, yyyy · h:mm a")}
                  </span>
                  {role === "professor" ? (
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {a.submissionCount} submissions
                    </span>
                  ) : a.submissionStatus !== "NOT_SUBMITTED" && a.submissionStatus ? (
                    <StatusBadge status={a.submissionStatus} />
                  ) : (
                    <span>Not submitted</span>
                  )}
                </div>
                <Button asChild variant="outline" className="mt-5 w-full">
                  {role === "professor" ? (
                    <Link to="/professor/assignments/$id" params={{ id: a.id }}>
                      View assignment
                    </Link>
                  ) : (
                    <Link to="/student/assignments/$id" params={{ id: a.id }}>
                      View assignment
                    </Link>
                  )}
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AssignmentDetailPage({
  role,
  id,
}: {
  role: "professor" | "student";
  id: string;
}) {
  const navigate = useNavigate();
  const [item, setItem] = useState<Assignment | null | undefined>(undefined);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStatus, setEditStatus] = useState<AssignmentStatus>("ACTIVE");
  const [editError, setEditError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Delete/Archive dialog state
  const [manageOpen, setManageOpen] = useState(false);
  const [manageError, setManageError] = useState("");
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    assignmentService.list().then((v) => {
      const found = v.find((x) => x.id === id) ?? null;
      setItem(found);
      if (found) {
        setEditTitle(found.title);
        setEditDescription(found.description);
        setEditDeadline(
          found.deadline ? new Date(found.deadline).toISOString().slice(0, 16) : ""
        );
        setEditStatus(found.status);
      }
    });
  }, [id]);

  if (item === undefined) return <Skeleton className="h-96" />;
  if (!item)
    return <EmptyState title="Assignment not found" detail="This assignment is unavailable." />;

  const isExpired = new Date(item.deadline).getTime() <= Date.now();
  const effectiveStatus = item.status === "ACTIVE" && isExpired ? "CLOSED" : item.status;
  const isSubmitted =
    role === "student" &&
    Boolean(item.submissionStatus && item.submissionStatus !== "NOT_SUBMITTED");

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setEditError("");
    setIsEditing(true);

    if (editTitle.trim().length < 3) {
      setEditError("Title must be at least 3 characters.");
      setIsEditing(false);
      return;
    }
    if (editDescription.trim().length < 5) {
      setEditError("Description must be at least 5 characters.");
      setIsEditing(false);
      return;
    }
    const parsedDate = new Date(editDeadline);
    if (isNaN(parsedDate.getTime())) {
      setEditError("Invalid deadline date.");
      setIsEditing(false);
      return;
    }

    try {
      const updated = await assignmentService.update(item.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        deadline: parsedDate.toISOString(),
        status: editStatus,
      });
      setItem(updated);
      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update assignment.");
    } finally {
      setIsEditing(false);
    }
  }

  async function handleDeleteOrArchive() {
    if (!item) return;
    setManageError("");
    setIsManaging(true);

    try {
      if (item.submissionCount === 0) {
        // Safe to permanently delete
        await assignmentService.delete(item.id);
        setManageOpen(false);
        navigate({ to: "/professor/assignments" as any });
      } else {
        // Has submissions: archive instead
        const updated = await assignmentService.update(item.id, {
          status: "ARCHIVED",
        });
        setItem(updated);
        setManageOpen(false);
      }
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setIsManaging(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={item.code}
        title={item.title}
        description={item.description}
        action={
          role === "student" ? (
            isSubmitted ? (
              <Button asChild variant="outline">
                {item.submissionId ? (
                  <Link to="/student/submissions/$id" params={{ id: item.submissionId }}>
                    View submission
                  </Link>
                ) : (
                  <Link to="/student/submissions">View submission</Link>
                )}
              </Button>
            ) : effectiveStatus === "ACTIVE" ? (
              <Button asChild>
                <Link to="/student/submit/$assignmentId" params={{ assignmentId: item.id }}>
                  Submit document
                </Link>
              </Button>
            ) : (
              <span className="rounded-full border border-destructive/25 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
                Submissions closed
              </span>
            )
          ) : role === "professor" ? (
            <div className="flex flex-wrap items-center gap-3">
              {/* Edit Assignment Dialog */}
              <Dialog
                open={editOpen}
                onOpenChange={(v) => {
                  setEditOpen(v);
                  if (v && item) {
                    setEditTitle(item.title);
                    setEditDescription(item.description);
                    setEditDeadline(
                      item.deadline ? new Date(item.deadline).toISOString().slice(0, 16) : ""
                    );
                    setEditStatus(item.status);
                    setEditError("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pencil className="size-4" />
                    Edit assignment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleEdit}>
                    <DialogHeader>
                      <DialogTitle>Edit assignment</DialogTitle>
                      <DialogDescription>
                        Update coursework details or extend the submission deadline.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="my-6 space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="mt-2"
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-deadline">Deadline</Label>
                        <Input
                          id="edit-deadline"
                          type="datetime-local"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="mt-2"
                          required
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Extending a closed assignment&apos;s deadline into the future will
                          reactivate submissions.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="edit-status">Status</Label>
                        <select
                          id="edit-status"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as AssignmentStatus)}
                          className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="ACTIVE">ACTIVE (Accept submissions if not expired)</option>
                          <option value="CLOSED">CLOSED (Submissions halted)</option>
                          <option value="ARCHIVED">ARCHIVED (Safely closed, proofs preserved)</option>
                        </select>
                      </div>
                      {editError && (
                        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                          {editError}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isEditing}>
                        {isEditing ? "Saving changes..." : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Delete / Archive Dialog */}
              <Dialog
                open={manageOpen}
                onOpenChange={(v) => {
                  setManageOpen(v);
                  setManageError("");
                }}
              >
                <DialogTrigger asChild>
                  {item.submissionCount === 0 ? (
                    <Button variant="destructive">
                      <Trash2 className="size-4" />
                      Delete assignment
                    </Button>
                  ) : (
                    <Button variant="secondary">
                      <Archive className="size-4" />
                      Archive assignment
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {item.submissionCount === 0
                        ? "Permanently delete assignment?"
                        : "Archive assignment?"}
                    </DialogTitle>
                    <DialogDescription>
                      {item.submissionCount === 0
                        ? "This assignment has 0 submissions. Deleting it will permanently remove the assignment record."
                        : `This assignment has ${item.submissionCount} submissions. Permanent deletion is blocked to protect academic records and blockchain integrity proofs. Archiving closes new submissions while preserving all submission records and proof history.`}
                    </DialogDescription>
                  </DialogHeader>
                  {manageError && (
                    <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {manageError}
                    </p>
                  )}
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setManageOpen(false)}
                      disabled={isManaging}
                    >
                      Cancel
                    </Button>
                    {item.submissionCount === 0 ? (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteOrArchive}
                        disabled={isManaging}
                      >
                        {isManaging ? "Deleting..." : "Permanently delete"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleDeleteOrArchive}
                        disabled={isManaging || item.status === "ARCHIVED"}
                      >
                        {isManaging
                          ? "Archiving..."
                          : item.status === "ARCHIVED"
                            ? "Already archived"
                            : "Confirm archive"}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : undefined
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="panel rounded-lg p-6">
          <h2 className="font-semibold">Submission requirements</h2>
          <div className="mt-5 space-y-3">
            {item.requirements.map((r) => (
              <div className="flex gap-3 text-sm" key={r}>
                <FileText className="size-4 shrink-0 text-primary" />
                {r}
              </div>
            ))}
          </div>
        </section>
        <aside className="panel rounded-lg p-6">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-bold text-muted-foreground">DEADLINE</dt>
              <dd className="mt-1 text-sm">
                {format(new Date(item.deadline), "MMMM d, yyyy · h:mm a")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">STATUS</dt>
              <dd className="mt-1 text-sm">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    effectiveStatus === "ACTIVE"
                      ? "border-success/25 bg-success/10 text-success"
                      : effectiveStatus === "ARCHIVED"
                        ? "border-muted bg-muted text-muted-foreground"
                        : "border-destructive/25 bg-destructive/10 text-destructive"
                  }`}
                >
                  {effectiveStatus}
                </span>
              </dd>
            </div>
            {role === "student" && isSubmitted && (
              <div>
                <dt className="text-xs font-bold text-muted-foreground">YOUR SUBMISSION</dt>
                <dd className="mt-1">
                  <StatusBadge status={item.submissionStatus as any} />
                </dd>
              </div>
            )}
            {role === "professor" && (
              <div>
                <dt className="text-xs font-bold text-muted-foreground">SUBMISSIONS</dt>
                <dd className="mt-1 text-sm">{item.submissionCount}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
