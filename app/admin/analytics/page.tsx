import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { AnalyticsView } from "@/components/admin/analytics-view";

export default function AdminAnalyticsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="VidyaGruha · Administration"
          title="Analytics"
          description="Academic volume, schedule changes and attendance across subjects."
        />
        <AnalyticsView />
      </div>
    </PageTransition>
  );
}
