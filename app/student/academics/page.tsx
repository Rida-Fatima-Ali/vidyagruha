import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { BookOpen } from "lucide-react";

export default function StudentAcademicsPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Academics"
        description="Your semester results, credits and overall academic progress."
        icon={BookOpen}
        planned={[
          "Semester-wise results with subject-wise marks and credits",
          "SGPA and CGPA tracked over your full programme",
          "Eligibility status for the current semester exams",
          "Backlog status and improvement exam information",
        ]}
        backHref="/student/dashboard"
      />
    </PageTransition>
  );
}
