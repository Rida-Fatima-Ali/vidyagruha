import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { StudentManager } from "@/components/admin/student-manager";

export default function AdminStudentsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="VidyaGruha · Administration"
          title="Students"
          description="Attendance and coursework standing for every student, live from the shared records."
        />
        <StudentManager />
      </div>
    </PageTransition>
  );
}
