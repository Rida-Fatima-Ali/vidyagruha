import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { NoticesManager } from "@/components/admin/notices-manager";

export default function AdminNoticesPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Notices"
          description="Publish, schedule and archive notices for the whole campus or targeted audiences."
        />
        <NoticesManager />
      </div>
    </PageTransition>
  );
}
