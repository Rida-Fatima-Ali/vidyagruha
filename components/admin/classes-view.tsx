"use client";

import { useMemo } from "react";
import { School } from "lucide-react";
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
import { useAdminClasses } from "@/hooks/use-admin";

function attendanceTone(rate: number): ProgressTone {
  if (rate >= 90) return "success";
  if (rate >= 75) return "warning";
  return "destructive";
}

export function ClassesView() {
  const { data, loading, error, refresh } = useAdminClasses();
  const classes = useMemo(() => data ?? [], [data]);

  return (
    <Panel
      title="Classes"
      description="Division roll strength and attendance standing"
      flush
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : classes.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<School className="h-5 w-5" aria-hidden="true" />}
            title="No classes configured"
            description="Class records will appear here."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Class</TableHeader>
              <TableHeader>Programme</TableHeader>
              <TableHeader>Strength</TableHeader>
              <TableHeader>Class advisor</TableHeader>
              <TableHeader className="w-[28%] min-w-40">Attendance</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classRow) => (
              <TableRow key={classRow.id}>
                <TableCell>
                  <span className="block text-sm font-medium">{classRow.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {classRow.year} · {classRow.semester}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{classRow.programme}</TableCell>
                <TableCell className="tabular text-sm">{classRow.strength}</TableCell>
                <TableCell className="text-sm">{classRow.advisor}</TableCell>
                <TableCell>
                  {classRow.attendanceRate == null ? (
                    <span className="text-xs text-muted-foreground">No records yet</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Progress
                        value={classRow.attendanceRate}
                        tone={attendanceTone(classRow.attendanceRate)}
                        className="flex-1"
                      />
                      <span className="tabular w-12 text-right text-sm font-medium">
                        {classRow.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
