import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { User } from "lucide-react";

export default function StudentProfilePage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Profile"
        description="Manage your personal details, privacy and notification preferences."
        icon={User}
        planned={[
          "Your academic record and personal details in one place",
          "Notification preferences for notices, events and grades",
          "Privacy controls for what classmates can see",
          "Secure password and account recovery settings",
        ]}
        backHref="/student/dashboard"
      />
    </PageTransition>
  );
}
