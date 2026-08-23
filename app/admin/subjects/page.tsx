import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { SubjectsView } from "@/components/admin/subjects-view";

export default function AdminSubjectsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="VidyaGruha · Administration"
          title="Subjects"
          description="Course master list with faculty ownership, rooms and attendance standing."
        />
        <SubjectsView />
      </div>
    </PageTransition>
  );
}
