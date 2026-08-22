import { PageTransition } from "@/components/common/page-transition";
import { ModuleComingSoon } from "@/components/common/module-coming-soon";
import { MapPin } from "lucide-react";

export default function StudentCampusPage() {
  return (
    <PageTransition>
      <ModuleComingSoon
        title="Campus"
        description="Explore the campus map, facilities and daily services."
        icon={MapPin}
        planned={[
          "Interactive campus map with building and lab locations",
          "Facility hours for the library, labs and sports complex",
          "Mess menu and café availability for the week",
          "Lost-and-found and campus help-desk contacts",
        ]}
        backHref="/student/dashboard"
      />
    </PageTransition>
  );
}
