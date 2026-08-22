"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { AttendanceWorkbench } from "@/components/faculty/attendance-workbench";
import { AttendanceAnalytics } from "@/components/faculty/attendance-analytics";
import { useAuth } from "@/hooks/use-auth";
import {
  useAttendanceAnalytics,
  useFacultySessions,
  useSessionAttendance,
} from "@/hooks/use-faculty";
import { DEMO_TODAY } from "@/constants/demo";
import { groupLabel } from "@/mocks/roster";

export default function FacultyAttendancePage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Attendance"
          title="Mark attendance"
          description="Every run you save here is instantly reflected in the students' attendance view and the class analytics."
        />
        <Suspense fallback={<ListSkeleton rows={6} />}>
          <AttendancePageContent />
        </Suspense>
      </div>
    </PageTransition>
  );
}

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("session");
  const { user } = useAuth();
  const { sessions, loading: sessionsLoading, error: sessionsError, refresh: refreshSessions } =
    useFacultySessions(user, DEMO_TODAY);

  const effectiveId =
    (preselected && sessions.some((session) => session.id === preselected)
      ? preselected
      : null) ?? sessions[0]?.id ?? null;
  const session = sessions.find((s) => s.id === effectiveId) ?? null;

  const analytics = useAttendanceAnalytics(
    user,
    session?.code ?? null,
    session?.groupSlug ?? "cmpn-a",
  );
  const saved = useSessionAttendance(user, effectiveId);

  async function handleSaved() {
    await Promise.all([refreshSessions(), analytics.refresh(), saved.refresh()]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        {session ? (
          <AttendanceWorkbench
            key={session.id}
            session={session}
            saved={saved.session}
            rows={analytics.data?.rows ?? []}
            loading={sessionsLoading || saved.loading || analytics.loading}
            error={sessionsError || saved.error || analytics.error}
            onRetry={() => {
              void refreshSessions();
              void analytics.refresh();
              void saved.refresh();
            }}
            onSaved={() => void handleSaved()}
          />
        ) : (
          <div className="card-surface rounded-xl border border-border shadow-card">
            <div className="p-6">
              <p className="text-sm font-medium">No sessions today</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sessions from your teaching timetable appear here. Check the
                Manage lectures page if you expected a class today.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <AttendanceAnalytics
          snapshot={analytics.data?.snapshot ?? null}
          trend={analytics.data?.trend ?? []}
          loading={sessionsLoading || analytics.loading}
          error={analytics.error}
          onRetry={() => void analytics.refresh()}
        />
        <p className="mt-3 px-1 text-xs text-muted-foreground">
          Analytics for {session ? `${session.subject} · ${groupLabel(session.groupSlug)}` : "the selected session"}.
        </p>
      </div>
    </div>
  );
}
