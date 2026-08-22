import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { Sparkles } from "lucide-react";

export default function FacultyEventsPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Events"
        description="Keep up with campus events and deadlines."
        icon={Sparkles}
        planned={[
          "Campus event calendar relevant to your department",
          "Registration deadlines for seminars and workshops",
          "Nominate students for opportunities",
          "Get notified about events in your teaching weeks",
        ]}
        backHref="/faculty/dashboard"
      />
    </PageTransition>
  );
}
