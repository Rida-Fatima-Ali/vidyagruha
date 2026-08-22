"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Send,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { formatDueLabel, formatShortDate } from "@/utils/date";
import { DEMO_NOW } from "@/constants/demo";
import type {
  AssignmentStatus,
  StudentAssignment,
} from "@/types/student";

const STATUS_CONFIG: Record<
  AssignmentStatus,
  { label: string; icon: LucideIcon; chipClass: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    chipClass: "bg-warning/10 text-warning ring-inset ring-warning/25",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    chipClass: "bg-info/10 text-info ring-inset ring-info/25",
  },
  late: {
    label: "Overdue",
    icon: AlertCircle,
    chipClass: "bg-destructive/10 text-destructive ring-inset ring-destructive/25",
  },
  graded: {
    label: "Graded",
    icon: Award,
    chipClass: "bg-success/10 text-success ring-inset ring-success/25",
  },
};

const SORT_ORDER: Record<AssignmentStatus, number> = {
  late: 0,
  pending: 1,
  submitted: 2,
  graded: 3,
};

function sortAssignments(assignments: StudentAssignment[]): StudentAssignment[] {
  return [...assignments].sort((a, b) => {
    const orderDiff = SORT_ORDER[a.status] - SORT_ORDER[b.status];
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

/** Human distance to the deadline, resolved against the demo clock. */
function urgency(assignment: StudentAssignment): {
  label: string;
  tone: "destructive" | "warning" | "muted";
} | null {
  if (assignment.status !== "pending" && assignment.status !== "late") return null;
  const diffMs = new Date(assignment.dueDate).getTime() - DEMO_NOW.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 0 || assignment.status === "late")
    return { label: `Overdue ${Math.abs(days)}d`, tone: "destructive" };
  if (days === 0) return { label: "Due today", tone: "destructive" };
  if (days === 1) return { label: "Due tomorrow", tone: "warning" };
  if (days <= 3) return { label: `${days} days left`, tone: "warning" };
  return { label: `Due ${formatShortDate(assignment.dueDate)}`, tone: "muted" };
}

export interface AssignmentsListProps {
  assignments: StudentAssignment[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onSubmit?: (assignmentId: string) => void;
  submittingId?: string | null;
  /** When set, only assignments matching the status are rendered. */
  statusFilter?: AssignmentStatus;
  limit?: number;
  showViewAll?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AssignmentsList({
  assignments,
  loading,
  error,
  onRetry,
  onSubmit,
  submittingId,
  statusFilter,
  limit,
  showViewAll = true,
  emptyTitle = "No assignments to show",
  emptyDescription = "New assignments from your faculty will appear here with their due dates.",
}: AssignmentsListProps) {
  const reduceMotion = useReducedMotion();
  const filtered = statusFilter
    ? assignments.filter((assignment) => assignment.status === statusFilter)
    : assignments;
  const visible = sortAssignments(filtered).slice(0, limit);

  return (
    <Panel
      title="Assignments"
      description={statusFilter ? undefined : "Pending and recent work"}
      flush
      action={
        showViewAll ? (
          <Link
            href="/student/assignments"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((assignment, index) => {
            const config = STATUS_CONFIG[assignment.status];
            const Icon = config.icon;
            const urgent = urgency(assignment);
            const actionable =
              onSubmit != null &&
              (assignment.status === "pending" || assignment.status === "late");

            return (
              <motion.li
                key={assignment.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.32,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "group relative flex items-start gap-3.5 px-5 py-3.5 transition-colors duration-200",
                  "hover:bg-surface-2/50",
                  assignment.status === "late" &&
                    "before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-destructive/70 before:content-['']",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/60",
                    config.chipClass,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {assignment.subject}
                      <span className="meta ml-1.5 text-muted-foreground">{assignment.code}</span>
                    {assignment.priority === "high" ? (
                      <span className="kicker ml-2 text-primary">High priority</span>
                    ) : null}
                  </p>
                  {urgent ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1 w-1 rounded-full",
                          urgent.tone === "destructive" && "bg-destructive",
                          urgent.tone === "warning" && "bg-warning",
                          urgent.tone === "muted" && "bg-muted-foreground/60",
                        )}
                      />
                      <span
                        className={cn(
                          urgent.tone === "destructive" && "font-medium text-destructive",
                          urgent.tone === "warning" && "font-medium text-warning",
                          urgent.tone === "muted" && "text-muted-foreground",
                        )}
                      >
                        {urgent.label}
                      </span>
                      {assignment.status === "pending" ? (
                        <span className="text-muted-foreground">
                          · {formatDueLabel(assignment.dueDate)}
                        </span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {assignment.status === "graded" && assignment.grade
                        ? `Submitted ${formatShortDate(assignment.submittedAt ?? assignment.dueDate)} · Grade ${assignment.grade}`
                        : `Submitted ${formatShortDate(assignment.submittedAt ?? assignment.dueDate)}`}
                    </p>
                  )}
                </div>

                {/* Action zone */}
                <div className="flex shrink-0 items-center gap-2">
                  {actionable ? (
                    <Button
                      variant={assignment.status === "late" ? "destructive" : "default"}
                      size="sm"
                      disabled={submittingId === assignment.id}
                      onClick={() => onSubmit?.(assignment.id)}
                    >
                      <Send className="h-3 w-3" aria-hidden="true" />
                      {submittingId === assignment.id ? "Submitting…" : "Submit"}
                    </Button>
                  ) : (
                    <ArrowUpRight
                      className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                      config.chipClass,
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
