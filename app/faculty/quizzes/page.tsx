import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { PenLine } from "lucide-react";

export default function FacultyQuizzesPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Quizzes"
        description="Create quizzes and view student performance."
        icon={PenLine}
        planned={[
          "Build timed quizzes with auto-marked questions",
          "Schedule open windows for specific divisions",
          "Review performance with question-level analytics",
          "Reuse question banks across quizzes",
        ]}
        backHref="/faculty/dashboard"
      />
    </PageTransition>
  );
}
