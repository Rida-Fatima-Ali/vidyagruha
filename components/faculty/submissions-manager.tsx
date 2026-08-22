"use client";

import { useMemo, useState } from "react";
import { CheckCheck, ClipboardCheck, Clock4, FileX } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  useFacultyAssignments,
  useGradeSubmission,
  useSubmissions,
} from "@/hooks/use-faculty";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { FacultySubmission, SubmissionState } from "@/types/faculty";

const STATE_META: Record<SubmissionState, { label: string; variant: "success" | "warning" | "destructive" }> = {
  submitted: { label: "Submitted", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  missing: { label: "Missing", variant: "destructive" },
};

export interface SubmissionsManagerProps {
  /** Assignment id taken from the URL query, when present. */
  initialAssignmentId?: string | null;
}

export function SubmissionsManager({ initialAssignmentId }: SubmissionsManagerProps) {
  const { user } = useAuth();
  const { data: assignments, loading: assignmentsLoading } = useFacultyAssignments(user);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAssignmentId && assignments?.some((a) => a.id === initialAssignmentId)
      ? initialAssignmentId
      : null,
  );
  const effectiveId =
    selectedId ?? assignments?.find((a) => new Date(a.dueDate) >= new Date())?.id ?? assignments?.[0]?.id ?? null;
  const { data: view, loading, error, refresh } = useSubmissions(user, effectiveId);
  const grader = useGradeSubmission(user);

  const sorted = useMemo(() => {
    const list = view?.submissions ?? [];
    const order: Record<SubmissionState, number> = { pending: 0, submitted: 1, missing: 2 };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [view]);

  if (assignmentsLoading) {
    return <ListSkeleton rows={6} />;
  }

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
        title="Nothing to review yet"
        description="Publish an assignment and submissions will appear here for grading."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Choose an assignment"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {assignments.map((assignment) => {
          const isActive = assignment.id === effectiveId;
          return (
            <button
              key={assignment.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedId(assignment.id)}
              className={cn(
                "flex min-w-0 shrink-0 cursor-pointer flex-col items-start gap-0.5 rounded-xl border px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none",
                isActive
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="max-w-[16rem] truncate text-sm font-medium">
                {assignment.title}
              </span>
              <span className="tabular text-[11px] opacity-70">
                {assignment.subject} · {assignment.code}
              </span>
            </button>
          );
        })}
      </div>

      {view ? (
        <SubmissionSummary
          submitted={view.stats.submitted}
          pending={view.stats.pending}
          missing={view.stats.missing}
          graded={view.stats.graded}
          avgGrade={view.stats.avgGrade}
          maxMarks={view.assignment.maxMarks}
        />
      ) : null}

      <Panel
        title={view?.assignment.title ?? "Submissions"}
        description={view ? `${view.assignment.subject} · ${view.assignment.code} · ${view.assignment.maxMarks} marks` : "Choose an assignment above"}
        flush
      >
        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            className="m-5"
            description={error}
            onRetry={() => void refresh()}
          />
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<FileX className="h-5 w-5" aria-hidden="true" />}
              title="No submissions"
              description="Students haven't submitted for this assignment yet."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((submission) => (
              <li
                key={submission.id}
                className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={submission.studentName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {submission.studentName}
                      </p>
                      <span className="tabular text-xs text-muted-foreground">
                        {submission.rollNo}
                      </span>
                      <Badge variant={STATE_META[submission.status].variant}>
                        {STATE_META[submission.status].label}
                      </Badge>
                    </div>
                    {submission.submittedAt ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Submitted {formatRelativeTime(submission.submittedAt)}
                      </p>
                    ) : null}
                    {submission.feedback ? (
                      <p className="mt-0.5 text-xs italic text-muted-foreground">
                        “{submission.feedback}”
                      </p>
                    ) : null}
                  </div>
                </div>

                <GradeField
                  key={`${submission.id}-${submission.grade ?? "none"}`}
                  submission={submission}
                  maxMarks={view?.assignment.maxMarks ?? 10}
                  busy={grader.busy}
                  onGraded={async (value, feedback) => {
                    const ok = await grader.grade(submission.id, value, feedback);
                    if (ok) void refresh();
                    return ok;
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function SubmissionSummary({
  submitted,
  pending,
  missing,
  graded,
  avgGrade,
  maxMarks,
}: {
  submitted: number;
  pending: number;
  missing: number;
  graded: number;
  avgGrade: number | null;
  maxMarks: number;
}) {
  const tiles = [
    { label: "Submitted", value: submitted, icon: CheckCheck, tone: "text-success" },
    { label: "Pending", value: pending, icon: Clock4, tone: "text-warning" },
    { label: "Missing", value: missing, icon: FileX, tone: "text-destructive" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card"
        >
          <tile.icon className={cn("h-4 w-4 shrink-0", tile.tone)} aria-hidden="true" />
          <div>
            <p className="tabular font-heading text-lg font-bold leading-none">
              {tile.value}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              {tile.label}
            </p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
        <ClipboardCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="tabular font-heading text-lg font-bold leading-none">
            {avgGrade === null ? "—" : avgGrade}
            {avgGrade !== null ? (
              <span className="text-xs font-medium text-muted-foreground">
                /{maxMarks}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            {graded} graded · Avg
          </p>
        </div>
      </div>
    </div>
  );
}

function GradeField({
  submission,
  maxMarks,
  busy,
  onGraded,
}: {
  submission: FacultySubmission;
  maxMarks: number;
  busy: boolean;
  onGraded: (value: number, feedback?: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(
    typeof submission.grade === "number" ? String(submission.grade) : "",
  );
  const [saving, setSaving] = useState(false);
  const hasGrade = typeof submission.grade === "number";
  const changed = value !== String(submission.grade ?? "");

  async function save(): Promise<void> {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return;
    setSaving(true);
    const ok = await onGraded(Math.min(numeric, maxMarks));
    setSaving(false);
    if (!ok) setValue(submission.grade !== undefined ? String(submission.grade) : "");
  }

  return (
    <div className="flex shrink-0 items-center gap-2 sm:ml-2">
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          max={maxMarks}
          value={value}
          disabled={busy}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void save();
          }}
          aria-label={`Grade for ${submission.studentName}`}
          className={cn(
            "h-8 w-20 text-right tabular",
            hasGrade && !changed && "text-success",
          )}
        />
        <span className="text-xs text-muted-foreground">/{maxMarks}</span>
      </div>
      {changed ? (
        <Button
          variant="default"
          size="sm"
          disabled={busy || saving || value === ""}
          onClick={() => void save()}
        >
          {busy || saving ? "Saving…" : "Save"}
        </Button>
      ) : hasGrade ? (
        <Badge variant="success">Graded</Badge>
      ) : null}
    </div>
  );
}
