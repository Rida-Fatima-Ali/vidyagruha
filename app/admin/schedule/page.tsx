import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminScheduleOverview } from "@/components/admin/schedule-overview";
import { DEMO_TODAY } from "@/constants/demo";

export default function AdminSchedulePage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Schedule"
          description="The effective institution timetable — base periods plus every schedule change, with live conflict detection."
          actions={<Badge variant="secondary">Demo day · {DEMO_TODAY}</Badge>}
        />
        <AdminScheduleOverview />
      </div>
    </PageTransition>
  );
}
