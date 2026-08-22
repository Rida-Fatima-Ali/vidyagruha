import { Inbox } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { formatDueLabel } from "@/utils/date";
import type { SubmissionReview } from "@/types/faculty";

export interface SubmissionAlertsProps {
  submissions: SubmissionReview[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function SubmissionAlerts({
  submissions,
  loading,
  error,
  onRetry,
}: SubmissionAlertsProps) {
  return (
    <Panel
      title="Submissions to review"
      description="Work submitted, waiting on your grading"
      flush
    >
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : submissions.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="Nothing to review"
          description="Submissions you need to grade will appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {submissions.map((item) => {
            const reviewed = item.total - item.pending;
            const percent =
              item.total === 0 ? 0 : Math.round((reviewed / item.total) * 100);

            return (
              <li key={item.id} className="px-5 py-4">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info ring-1 ring-inset ring-border/60">
                    <Inbox className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.assignmentTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.subject}
                      <span className="tabular ml-1.5">{item.code}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-info transition-[width] duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">
                    {reviewed}/{item.total} reviewed
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {item.pending > 0 ? (
                      <>
                        <span className="font-medium text-foreground">
                          {item.pending} pending
                        </span>{" "}
                        · due {formatDueLabel(item.dueDate)}
                      </>
                    ) : (
                      "All reviewed"
                    )}
                  </p>
                  <Button
                    variant={item.pending > 0 ? "default" : "outline"}
                    size="sm"
                  >
                    Review
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
