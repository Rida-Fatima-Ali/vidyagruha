"use client";

import { useMemo } from "react";
import { DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminRooms } from "@/hooks/use-admin";
import type { RoomKind } from "@/types/admin";

const KIND_LABEL: Record<RoomKind, string> = {
  classroom: "Classroom",
  lab: "Lab",
  seminar: "Seminar",
};

function utilizationTone(percent: number): ProgressTone {
  if (percent >= 75) return "warning";
  if (percent >= 40) return "success";
  return "default";
}

export function RoomsView() {
  const { data, loading, error, refresh } = useAdminRooms();
  const rooms = useMemo(() => data ?? [], [data]);

  return (
    <Panel
      title="Rooms"
      description="Capacity and weekly utilization across blocks"
      flush
    >
      {loading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : rooms.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<DoorOpen className="h-5 w-5" aria-hidden="true" />}
            title="No rooms configured"
            description="Rooms appear here once the timetable is set up."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Room</TableHeader>
              <TableHeader>Block</TableHeader>
              <TableHeader>Kind</TableHeader>
              <TableHeader className="text-right">Capacity</TableHeader>
              <TableHeader className="text-right">Sessions / wk</TableHeader>
              <TableHeader className="w-[30%] min-w-40">Utilization</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>
                  <span className="block text-sm font-medium">{room.name}</span>
                </TableCell>
                <TableCell className="text-sm">{room.block}</TableCell>
                <TableCell>
                  <Badge variant={room.kind === "lab" ? "info" : room.kind === "seminar" ? "warning" : "secondary"}>
                    {KIND_LABEL[room.kind]}
                  </Badge>
                </TableCell>
                <TableCell className="tabular text-right text-sm">{room.capacity}</TableCell>
                <TableCell className="tabular text-right text-sm">{room.sessionsPerWeek}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress value={room.utilizationPercent} tone={utilizationTone(room.utilizationPercent)} className="flex-1" />
                    <span className="tabular w-12 text-right text-sm font-medium">{room.utilizationPercent}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
