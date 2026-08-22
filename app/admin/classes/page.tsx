import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { ClassesView } from "@/components/admin/classes-view";

export default function AdminClassesPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Classes"
          description="Division roll strength, advisors and attendance standing."
        />
        <ClassesView />
      </div>
    </PageTransition>
  );
}
