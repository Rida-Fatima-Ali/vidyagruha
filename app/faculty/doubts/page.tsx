import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { DoubtBoard } from "@/components/doubts/doubt-board";

export default function FacultyDoubtsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Doubts"
          title="Doubts"
          description="Answer student questions and mark one answer as verified — that badge turns a thread into the department's reference answer."
        />
        <DoubtBoard role="faculty" />
      </div>
    </PageTransition>
  );
}
