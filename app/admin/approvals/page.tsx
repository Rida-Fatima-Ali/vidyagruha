import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { ApprovalsView } from "@/components/admin/approvals-view";

export default function AdminApprovalsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Approvals"
          description="Review enrollment, joining and change requests from the admissions office and departments."
        />
        <ApprovalsView />
      </div>
    </PageTransition>
  );
}
