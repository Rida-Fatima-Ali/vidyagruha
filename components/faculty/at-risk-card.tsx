"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { AtRiskStudent } from "@/types/attendance";

export interface AtRiskCardProps {
  atRisk: AtRiskStudent[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/** Compact digest of students who need attention, linking to the roster page. */
export function AtRiskCard({ atRisk, loading, error, onRetry }: AtRiskCardProps) {
  const visible = atRisk.slice(0, 4);

  return (
    <Panel
      title="Students needing attention"
      description="Attendance below threshold or overdue work"
      action={
        <Link
          href="/faculty/students"
          className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      }
      flush
    >
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
          title="All clear"
          description="No students are below the attendance threshold right now."
        />
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((row) => (
            <li key={`${row.code}-${row.student.id}`} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={row.student.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="truncate text-sm font-medium">
                      {row.student.name}
                    </p>
                    <span className="tabular text-xs text-muted-foreground">
                      {row.student.rollNo}
                    </span>
                    {row.missingAssignments > 0 ? (
                      <Badge variant="warning">
                        {row.missingAssignments} submission
                        {row.missingAssignments === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Progress
                      value={row.percent}
                      tone="destructive"
                      threshold={row.threshold}
                      className="h-1"
                    />
                    <span className="tabular shrink-0 text-xs font-medium text-destructive">
                      {row.percent}%
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border/90 p-3">
        <Link
          href="/faculty/students"
          className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-2/60 active:translate-y-[1px] active:bg-surface-2"
        >
          Open class roster &amp; risk view
        </Link>
      </div>
    </Panel>
  );
}
