"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useAdminApprovalManager, useAdminApprovals } from "@/hooks/use-admin";
import { useToast } from "@/components/ui/toast";
import { formatRelativeTime } from "@/utils/date";
import type { ApprovalType, PendingApproval } from "@/types/admin";
import type { RegistrationRequest } from "@/services/database";

const TYPE_CONFIG: Record<ApprovalType, { label: string; icon: LucideIcon }> = {
  "student-enrollment": { label: "Enrollment", icon: UserPlus },
  "faculty-joining": { label: "Joining", icon: UserPlus },
  "student-change": { label: "Student change", icon: UserCog },
  "faculty-change": { label: "Faculty change", icon: UserCog },
};

export function ApprovalsView() {
  const { pending, resolved, loading, error, refresh } = useAdminApprovals();
  const manager = useAdminApprovalManager();
  const { toast } = useToast();

  // Registration requests state
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqBusyId, setReqBusyId] = useState<string | null>(null);

  async function loadRegistrationRequests() {
    try {
      setReqLoading(true);
      const res = await fetch("/api/admin/approvals");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch {
      // ignore
    } finally {
      setReqLoading(false);
    }
  }

  useEffect(() => {
    void loadRegistrationRequests();
  }, []);

  async function handleRequestAction(requestId: string, action: "approve" | "reject") {
    setReqBusyId(requestId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: action === "approve" ? "Account Approved" : "Request Rejected",
          description:
            action === "approve"
              ? "The user can now log in with their @somaiya.edu credentials."
              : "The registration request has been rejected.",
          tone: action === "approve" ? "success" : "default",
        });
        await loadRegistrationRequests();
      } else {
        toast({
          title: "Action Failed",
          description: data.error || "Could not complete action.",
          tone: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please try again.",
        tone: "destructive",
      });
    } finally {
      setReqBusyId(null);
    }
  }

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests]
  );
  const resolvedRequests = useMemo(
    () => requests.filter((r) => r.status !== "pending"),
    [requests]
  );

  async function handleDecide(approval: PendingApproval, decision: "approved" | "deferred") {
    const ok = await manager.decide(approval.id, decision);
    if (ok) void refresh();
  }

  return (
    <div className="space-y-8">
      {/* ── 1. User Registration Requests Panel ───────────────────────────── */}
      <Panel
        title="New User Registration Requests"
        description="Student and faculty sign-up requests awaiting administrator verification"
        flush
        action={
          pendingRequests.length > 0 ? (
            <Badge variant="warning">{pendingRequests.length} pending</Badge>
          ) : (
            <Badge variant="secondary">0 pending</Badge>
          )
        }
      >
        {reqLoading ? (
          <ListSkeleton rows={3} />
        ) : pendingRequests.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6 text-success" />}
              title="No Pending Registration Requests"
              description="All prospective student and faculty sign-up requests have been reviewed."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Applicant Name</th>
                  <th className="px-5 py-3">Somaiya Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {req.displayName}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {req.email}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={req.role === "faculty" ? "default" : "secondary"}>
                        {req.role === "faculty" ? "Faculty" : "Student"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {formatRelativeTime(req.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        Pending
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={reqBusyId === req.id}
                          onClick={() => handleRequestAction(req.id, "approve")}
                          className="h-8 gap-1 text-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={reqBusyId === req.id}
                          onClick={() => handleRequestAction(req.id, "reject")}
                          className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ── 2. Standard Institutional Approvals ────────────────────────────── */}
      <Panel
        title="Department & Enrollment Approvals"
        description="Course enrollments, division changes, and faculty leave authorizations"
        flush
        action={
          pending.length > 0 ? (
            <Badge variant="warning">{pending.length} waiting</Badge>
          ) : null
        }
      >
        {loading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
        ) : pending.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="All caught up"
              description="New requests from the admissions office and departments will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pending.map((approval) => {
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
                      {manager.busy ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
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

      {/* ── 3. Recent Decision History ────────────────────────────────────── */}
      <Panel title="Recent Decision History" description="Recently resolved registrations and institutional changes" flush>
        {resolvedRequests.length === 0 && resolved.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              title="No decisions yet"
              description="Requests you approve or reject will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {resolvedRequests.map((req) => (
              <li key={req.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p className="font-semibold text-foreground">
                    {req.displayName} ({req.email})
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {req.role} Registration · Reviewed by {req.reviewedBy || "System Administrator"}
                  </p>
                </div>
                <Badge variant={req.status === "approved" ? "success" : "destructive"}>
                  {req.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
