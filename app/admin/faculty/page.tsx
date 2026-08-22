import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { FacultyManager } from "@/components/admin/faculty-manager";

export default function AdminFacultyPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Faculty"
          description="Instructors and their subject ownership, derived from the canonical course mapping."
        />
        <FacultyManager />
      </div>
    </PageTransition>
  );
}
