import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { MessagesSquare } from "lucide-react";

export default function StudentDoubtsPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Doubts"
        description="Ask questions about your subjects and get answers from faculty and classmates."
        icon={MessagesSquare}
        planned={[
          "Ask subject-specific questions attached to lectures and materials",
          "Faculty-marked answers with verified badges",
          "Peer answers you can upvote within your class",
          "Replies appear as notifications, so you never miss an answer",
        ]}
        backHref="/student/dashboard"
      />
    </PageTransition>
  );
}
