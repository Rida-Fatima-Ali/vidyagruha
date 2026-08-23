"use client";

import { useMemo, useState } from "react";
import { PageTransition } from "@/components/common/page-transition";
import { StudentHero } from "@/components/student/student-hero";
import { QuickActions } from "@/components/student/quick-actions";
import { ScheduleList } from "@/components/student/schedule-list";
import { AssignmentsList } from "@/components/student/assignments-list";
import { AttendanceSummary } from "@/components/student/attendance-summary";
import { NoticesList } from "@/components/student/notices-list";
import { EventsList } from "@/components/student/events-list";
import { useStudentDashboard } from "@/hooks/use-student";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { studentService } from "@/services/api/student";
import { DEMO_NOW } from "@/constants/demo";
import { formatTodayLabel } from "@/utils/date";

function computeGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useStudentDashboard();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [timeState] = useState(() => ({
    greeting: computeGreeting(DEMO_NOW),
    todayLabel: formatTodayLabel(),
  }));

  async function handleSubmit(assignmentId: string) {
    setSubmittingId(assignmentId);
    try {
      await studentService.submitAssignment(assignmentId);
      toast({ title: "Assignment submitted", tone: "success" });
      await refresh();
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", tone: "destructive" });
    } finally {
      setSubmittingId(null);
    }
  }

  const summary = useMemo(() => {
    if (!data) {
      return "Loading your day…";
    }
    const parts: string[] = [];
    const classes = data.schedule.length;
    const pending = data.assignments.filter(
      (assignment) => assignment.status === "pending" || assignment.status === "late",
    ).length;
    const warnings = data.attendance.filter(
      (subject) => subject.status !== "good",
    ).length;

    if (classes > 0) {
      parts.push(`${classes} class${classes === 1 ? "" : "es"} today`);
    }
    if (pending > 0) {
      parts.push(`${pending} pending assignment${pending === 1 ? "" : "s"}`);
    }
    if (warnings > 0) {
      parts.push(
        `${warnings} subject${warnings === 1 ? "" : "s"} below the attendance threshold`,
      );
    }
    if (parts.length === 0) {
      return "Your day looks clear. Check your calendar for what's next.";
    }
    return `Your day at a glance: ${parts.join(", ")}.`;
  }, [data]);

  const displayName = user?.displayName || user?.name || "there";
  const firstName = displayName.split(" ")[0] || "there";

  return (
    <PageTransition>
      <div className="space-y-10">
        <StudentHero
          eyebrow={`${timeState.todayLabel} · Second Year`}
          title={`${timeState.greeting}, ${firstName}`}
          summary={summary}
          schedule={data?.schedule ?? []}
          attendance={data?.attendance ?? []}
          assignments={data?.assignments ?? []}
          loading={loading}
        />

        <QuickActions />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ScheduleList
              slots={data?.schedule ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
            />
            <AssignmentsList
              assignments={data?.assignments ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
              onSubmit={handleSubmit}
              submittingId={submittingId}
              limit={4}
            />
          </div>

          <div className="space-y-6">
            <AttendanceSummary
              subjects={data?.attendance ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
            />
            <NoticesList
              notices={data?.notices ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
              limit={3}
            />
            <EventsList
              events={data?.events ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
              limit={3}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
