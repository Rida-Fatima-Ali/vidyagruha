"use client";

import { useMemo } from "react";
import { Ban, ClipboardCheck, Clock3, DoorOpen, FileStack, GitCompareArrows, GraduationCap, Plus, RefreshCcw, TriangleAlert, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import { StatTiles, type StatTileItem } from "@/components/dashboard/stat-tiles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAnalytics } from "@/hooks/use-admin";

function attendanceTone(rate: number): ProgressTone {
  if (rate >= 90) return "success";
  if (rate >= 75) return "warning";
  return "destructive";
}

export function AnalyticsView() {
  const { data, loading, error, refresh } = useAdminAnalytics();
  const attendance = useMemo(() => data?.attendanceBySubject ?? [], [data]);

  const academicTiles: StatTileItem[] = [
    {
      id: "open",
      label: "Open assignments",
      value: data?.academic.openAssignments ?? 0,
      tone: "primary",
      icon: ClipboardCheck,
    },
    {
      id: "due",
      label: "Due within 3 days",
      value: data?.academic.dueSoon ?? 0,
      tone: "warning",
      icon: Clock3,
    },
    {
      id: "pending",
      label: "Pending submissions",
      value: data?.academic.pendingSubmissions ?? 0,
      tone: "info",
      icon: UsersRound,
    },
    {
      id: "grade",
      label: "Average grade",
      value: data?.academic.avgGrade ?? 0,
      detail: "across graded submissions",
      tone: "success",
      icon: GraduationCap,
    },
    {
      id: "materials",
      label: "Materials published",
      value: data?.academic.materials ?? 0,
      tone: "neutral",
      icon: FileStack,
    },
  ];

  const scheduleTiles: StatTileItem[] = [
    { id: "changes", label: "Changes this week", value: data?.schedule.changesThisWeek ?? 0, tone: "warning", icon: RefreshCcw },
    { id: "cancelled", label: "Cancellations", value: data?.schedule.cancellations ?? 0, tone: "destructive", icon: Ban },
    { id: "extras", label: "Extra lectures", value: data?.schedule.extras ?? 0, tone: "info", icon: Plus },
    { id: "rescheduled", label: "Reschedules", value: data?.schedule.reschedules ?? 0, tone: "warning", icon: GitCompareArrows },
    { id: "rooms", label: "Room changes", value: data?.schedule.roomChanges ?? 0, tone: "neutral", icon: DoorOpen },
    { id: "faculty", label: "Faculty changes", value: data?.schedule.facultyChanges ?? 0, tone: "neutral", icon: UsersRound },
  ];

  return (
    <div className="space-y-6">
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState description={error} onRetry={() => void refresh()} />
      ) : (
        <>
          <Panel title="Academic overview" description="Coursework volume and completion" flush>
            <div className="p-5">
              <StatTiles items={academicTiles} />
            </div>
          </Panel>

          <Panel
            title="Schedule changes"
            description="Deviations applied in the current week"
            flush
            action={
              data && data.schedule.conflicts > 0 ? (
                <Badge variant="destructive">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  {data.schedule.conflicts} conflict{data.schedule.conflicts === 1 ? "" : "s"}
                </Badge>
              ) : null
            }
          >
            <div className="p-5">
              <StatTiles items={scheduleTiles} />
            </div>
          </Panel>

          <Panel
            title="Attendance by subject"
            description="Class-level average attendance and students below threshold"
            flush
          >
            {attendance.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No attendance data" description="Attendance will appear once classes are marked." />
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow className="hover:bg-transparent">
                    <TableHeader>Subject</TableHeader>
                    <TableHeader>Faculty</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader className="text-right">Sessions</TableHeader>
                    <TableHeader className="w-[26%] min-w-40">Attendance</TableHeader>
                    <TableHeader className="text-right">Below threshold</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell>
                        <span className="block text-sm font-medium">{row.subject}</span>
                        <span className="tabular block text-xs text-muted-foreground">{row.code}</span>
                      </TableCell>
                      <TableCell className="text-sm">{row.facultyName}</TableCell>
                      <TableCell>
                        <Badge variant={row.type === "lab" ? "info" : "secondary"}>
                          {row.type === "lab" ? "Lab" : row.type === "tutorial" ? "Tutorial" : "Lecture"}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular text-right text-sm">{row.sessions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={row.percent} tone={attendanceTone(row.percent)} className="flex-1" />
                          <span className="tabular w-12 text-right text-sm font-medium">{row.percent.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular text-right text-sm">
                        {row.belowThreshold > 0 ? (
                          <span className="font-medium text-destructive">
                            {row.belowThreshold} / {row.total}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
