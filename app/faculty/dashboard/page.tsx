"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  FolderOpen,
  Inbox,
  MessagesSquare,
  PenLine,
  Presentation,
  Sparkles,
  TrendingDown,
  Users,
} from "lucide-react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { StatTiles, type StatTileItem } from "@/components/dashboard/stat-tiles";
import { Announcement } from "@/components/dashboard/announcement";
import { ModuleGrid, type ModuleGridItem } from "@/components/dashboard/module-grid";
import { ClassQueue } from "@/components/faculty/class-queue";
import { SubmissionAlerts } from "@/components/faculty/submission-alerts";
import { CurrentLecture } from "@/components/faculty/current-lecture";
import { AtRiskCard } from "@/components/faculty/at-risk-card";
import { useFacultyDashboard, useFacultySessions } from "@/hooks/use-faculty";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_NOW, DEMO_TODAY } from "@/constants/demo";

const FACULTY_MODULES: ModuleGridItem[] = [
  { title: "Classes", description: "Your divisions, rosters and room slots.", icon: Presentation, href: "/faculty/classes" },
  { title: "Attendance", description: "Mark and review attendance for your classes.", icon: CalendarCheck, href: "/faculty/attendance" },
  { title: "Assignments", description: "Create and manage class assignments.", icon: ClipboardList, href: "/faculty/assignments" },
  { title: "Submissions", description: "Review submitted, late and missing work.", icon: Inbox, href: "/faculty/submissions" },
  { title: "Materials", description: "Upload notes, slides and question papers.", icon: FolderOpen, href: "/faculty/materials" },
  { title: "Students", description: "Roster and students who need attention.", icon: Users, href: "/faculty/students" },
  { title: "Quizzes", description: "Create quizzes and view student performance.", icon: PenLine, href: "/faculty/quizzes" },
  { title: "Notices", description: "Post notices to your classes and department.", icon: Sparkles, href: "/faculty/notices" },
  { title: "Events", description: "Keep up with campus events and deadlines.", icon: Sparkles, href: "/faculty/events" },
  { title: "Doubts", description: "Answer student doubts and host sessions.", icon: MessagesSquare, href: "/faculty/doubts" },
];

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error, refresh } = useFacultyDashboard();
  const { sessions, loading: sessionsLoading } = useFacultySessions(user, DEMO_TODAY);

  const focus = sessions[0] ?? null;
  const batchCount = focus
    ? sessions.filter((session) => session.code === focus.code).length
    : 0;

  const tiles: StatTileItem[] = useMemo(
    () => [
      {
        id: "classes",
        label: "Classes today",
        value: data?.stats.classesToday ?? 0,
        detail: `${sessions.filter((session) => session.marked).length} attendance runs recorded`,
        tone: "primary",
        icon: Presentation,
      },
      {
        id: "students",
        label: "Students today",
        value: data?.stats.studentsToday ?? 0,
        detail: "across CMPN-A and CMPN-B",
        tone: "info",
        icon: Users,
      },
      {
        id: "review",
        label: "To review",
        value: data?.stats.pendingReview ?? 0,
        detail: `${data?.stats.openAssignments ?? 0} assignments open`,
        tone: "warning",
        icon: Inbox,
      },
      {
        id: "atrisk",
        label: "Below 75%",
        value: data?.stats.atRiskAttendance ?? 0,
        detail: `${data?.stats.missingAssignments ?? 0} missing submissions`,
        tone: "destructive",
        icon: TrendingDown,
      },
    ],
    [data, sessions],
  );

  const firstName = user?.name.replace(/^Prof\.\s*/i, "").split(" ")[0] ?? "there";
  const hour = DEMO_NOW.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Computer Engineering"
          title={`${greeting}, ${firstName}`}
          description={
            data
              ? `${data.stats.classesToday} classes today · ${data.stats.pendingReview} submissions to review.`
              : "Loading your teaching day…"
          }
          actions={<Badge variant="secondary">Dept. of Computer Engineering</Badge>}
        />

        <CurrentLecture
          session={focus}
          batchCount={batchCount}
          now={DEMO_NOW}
          loading={sessionsLoading || loading}
          onMarkAttendance={() =>
            router.push(focus ? `/faculty/attendance?session=${focus.id}` : "/faculty/attendance")
          }
          onViewSchedule={() => router.push("/faculty/classes")}
        />

        <StatTiles items={tiles} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ClassQueue
              classes={data?.classes ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
              onMarkAttendance={(slot) =>
                router.push(`/faculty/attendance?session=${slot.id}`)
              }
            />
            <SubmissionAlerts
              submissions={data?.submissions ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
            />
          </div>

          <div className="space-y-6">
            <AtRiskCard
              atRisk={data?.atRisk ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
            />
            <Announcement />
          </div>
        </div>

        <ModuleGrid
          title="Teaching tools"
          description="Everything you use to run your classes lives here."
          modules={FACULTY_MODULES}
        />
      </div>
    </PageTransition>
  );
}
