import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { PenLine } from "lucide-react";

export default function StudentQuizzesPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Quizzes"
        description="Timed topic quizzes set by your faculty, with instant results."
        icon={PenLine}
        planned={[
          "Timed quizzes per subject with automatic submission",
          "Instant scores and question-wise review",
          "Leaderboards within your class and division",
          "Quiz reminders so you never miss an open window",
        ]}
        backHref="/student/dashboard"
      />
    </PageTransition>
  );
}
