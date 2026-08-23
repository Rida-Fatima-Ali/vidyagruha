import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { RoomRadar } from "@/components/admin/room-radar";
import { RoomsView } from "@/components/admin/rooms-view";

export default function AdminRoomsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CampusOne · Administration"
          title="Rooms"
          description="Capacity, weekly utilization and a live clash radar across blocks."
        />
        <RoomRadar />
        <RoomsView />
      </div>
    </PageTransition>
  );
}
