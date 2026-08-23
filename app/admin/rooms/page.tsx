import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { RoomsView } from "@/components/admin/rooms-view";

export default function AdminRoomsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="VidyaGruha · Administration"
          title="Rooms"
          description="Capacity and weekly utilization across blocks."
        />
        <RoomsView />
      </div>
    </PageTransition>
  );
}
