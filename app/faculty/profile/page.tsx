import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { User } from "lucide-react";

export default function FacultyProfilePage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Profile"
        description="Manage your professional details and preferences."
        icon={User}
        planned={[
          "Department, designation and contact details",
          "Notification preferences for duties and events",
          "Office hours and doubt-session visibility",
          "Secure account and recovery settings",
        ]}
        backHref="/faculty/dashboard"
      />
    </PageTransition>
  );
}
