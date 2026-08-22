import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { AttendanceRiskView } from "@/components/admin/attendance-risk-view";

export default function AdminRiskPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Attendance risk"
          description="Students and subjects trending below the attendance threshold, with missing coursework counted."
        />
        <AttendanceRiskView />
      </div>
    </PageTransition>
  );
}
