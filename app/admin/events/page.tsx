import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { EventsManager } from "@/components/admin/events-manager";

export default function AdminEventsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Events"
          description="Campus events, registrations and deadlines at a glance."
        />
        <EventsManager />
      </div>
    </PageTransition>
  );
}
