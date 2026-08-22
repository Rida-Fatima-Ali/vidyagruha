"use client";

import { useMemo } from "react";
import { CheckCheck, Clock, LoaderCircle, UserCheck, UserCog, UserPlus, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useAdminApprovalManager, useAdminApprovals } from "@/hooks/use-admin";
import { formatRelativeTime } from "@/utils/date";
import type { ApprovalType, PendingApproval } from "@/types/admin";

const TYPE_CONFIG: Record<ApprovalType, { label: string; icon: LucideIcon }> = {
  "student-enrollment": { label: "Enrollment", icon: UserPlus },
  "faculty-joining": { label: "Joining", icon: UserPlus },
  "student-change": { label: "Student change", icon: UserCog },
  "faculty-change": { label: "Faculty change", icon: UserCog },
};

export function ApprovalsView() {
  const { pending, resolved, loading, error, refresh } = useAdminApprovals();
  const manager = useAdminApprovalManager();

  const pendingList = useMemo(() => pending, [pending]);
  const resolvedList = useMemo(() => resolved, [resolved]);

  async function handleDecide(approval: PendingApproval, decision: "approved" | "deferred") {
    const ok = await manager.decide(approval.id, decision);
    if (ok) void refresh();
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Pending approvals"
        description="Requests waiting on your review"
        flush
        action={
          pendingList.length > 0 ? (
            <Badge variant="warning">{pendingList.length} waiting</Badge>
          ) : null
        }
      >
        {loading ? (
          <ListSkeleton rows={5} />
        ) : error ? (
          <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
        ) : pendingList.length === 0 ? (
          <div className="p-5">
            <EmptyState title="All caught up" description="New requests from the admissions office and departments will appear here." />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pendingList.map((approval) => {
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
                      disabled={manager.busy}
                      onClick={() => void handleDecide(approval, "approved")}
                    >
                      {manager.busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={manager.busy}
                      onClick={() => void handleDecide(approval, "deferred")}
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

      <Panel title="Decisions" description="Recently resolved requests" flush>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : resolvedList.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              title="No decisions yet"
              description="Requests you approve or defer will land here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {resolvedList.map((approval) => {
              const config = TYPE_CONFIG[approval.type];
              const Icon = config.icon;
              return (
                <li key={approval.id} className="flex items-start gap-3.5 px-5 py-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-inset ring-border/60">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <span className="truncate">{approval.subject}</span>
                      <Badge variant={approval.decision === "approved" ? "success" : "warning"}>
                        {approval.decision === "approved" ? "Approved" : "Deferred"}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {config.label} · {approval.detail}
                    </p>
                    {approval.decidedAt ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                        <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Decided {formatRelativeTime(approval.decidedAt)}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
