import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { Bell } from "lucide-react";

export default function FacultyNoticesPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Notices"
        description="Post notices to your classes and department."
        icon={Bell}
        planned={[
          "Post notices to a class, division or the whole department",
          "Attach files and set a priority level",
          "Pin important notices at the top of the feed",
          "Read receipts so you know who has seen it",
        ]}
        backHref="/faculty/dashboard"
      />
    </PageTransition>
  );
}
