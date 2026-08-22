import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { MessagesSquare } from "lucide-react";

export default function FacultyDoubtsPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Doubts"
        description="Answer student doubts and host sessions."
        icon={MessagesSquare}
        planned={[
          "Subject question feed with student context",
          "Verified answers with faculty badges",
          "Host doubt-clearing sessions within the timeline",
          "Track common doubts to improve lecture materials",
        ]}
        backHref="/faculty/dashboard"
      />
    </PageTransition>
  );
}
