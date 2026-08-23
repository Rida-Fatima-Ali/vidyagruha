import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { DoubtBoard } from "@/components/doubts/doubt-board";

export default function StudentDoubtsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student · Doubts"
          title="Doubts"
          description="Ask once, upvote what helped, and trust the answer your faculty verified. Every thread stays searchable for the batches after you."
        />
        <DoubtBoard role="student" />
      </div>
    </PageTransition>
  );
}
