import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { DepartmentsView } from "@/components/admin/departments-view";

export default function AdminDepartmentsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Departments"
          description="Department structure, staffing and today's attendance across the institution."
        />
        <DepartmentsView />
      </div>
    </PageTransition>
  );
}
