import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { CoverBoard } from "@/components/faculty/cover-board";

export default function FacultyCoverRequestsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Cover requests"
          title="Cover marketplace"
          description="Post a lecture you can't take. Every department colleague who is free at that hour can accept it in one tap — and the student timetable updates with them."
        />
        <CoverBoard />
      </div>
    </PageTransition>
  );
}
