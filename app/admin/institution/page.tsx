import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { Building2 } from "lucide-react";

export default function AdminInstitutionPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Institution"
        description="Configure programmes, years and academic terms."
        icon={Building2}
        planned={[
          "Manage programmes, years and semester structures",
          "Define academic years and term calendars",
          "Set exam and result cycles for the institution",
          "Institution profile, logo and contact details",
        ]}
        backHref="/admin/dashboard"
      />
    </PageTransition>
  );
}
