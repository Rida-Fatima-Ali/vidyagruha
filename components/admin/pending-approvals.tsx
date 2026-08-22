import { LoaderCircle, UserCheck, UserCog, UserPlus, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/utils/date";
import type { ApprovalType, PendingApproval } from "@/types/admin";

const TYPE_CONFIG: Record<
  ApprovalType,
  { label: string; icon: LucideIcon }
> = {
  "student-enrollment": { label: "Enrollment", icon: UserPlus },
  "faculty-joining": { label: "Joining", icon: UserPlus },
  "student-change": { label: "Student change", icon: UserCog },
  "faculty-change": { label: "Faculty change", icon: UserCog },
};

export interface PendingApprovalsProps {
  approvals: PendingApproval[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  limit?: number;
  onApprove?: (approval: PendingApproval) => void;
  onDefer?: (approval: PendingApproval) => void;
  busy?: boolean;
}

export function PendingApprovals({
  approvals,
  loading,
  error,
  onRetry,
  limit,
  onApprove,
  onDefer,
  busy,
}: PendingApprovalsProps) {
  const visible = approvals.slice(0, limit);

  return (
    <Panel
      title="Pending approvals"
      description="Requests waiting on your review"
      flush
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="All caught up"
          description="New requests from the admissions office and departments will appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((approval) => {
            const config = TYPE_CONFIG[approval.type];
            const Icon = config.icon;

            return (
              <li key={approval.id} className="px-5 py-4">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-inset ring-border/60">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-medium">{approval.subject}</p>
                      <span className="text-xs text-muted-foreground">
                        {config.label} · {approval.requestedBy}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {approval.detail}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Requested {formatRelativeTime(approval.requestedAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 pl-[46px]">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={busy}
                    onClick={() => onApprove?.(approval)}
                  >
                    {busy ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => onDefer?.(approval)}
                  >
                    Defer
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
