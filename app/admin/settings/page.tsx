import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Settings"
        description="Security, permissions and institution preferences."
        icon={Settings}
        planned={[
          "Role-based access controls and permission policies",
          "Authentication and session security settings",
          "Notification routing for institution-wide messages",
          "Data export and retention policies",
        ]}
        backHref="/admin/dashboard"
      />
    </PageTransition>
  );
}
