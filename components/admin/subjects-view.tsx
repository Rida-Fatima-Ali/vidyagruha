"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
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
import { useAdminSubjects } from "@/hooks/use-admin";
import type { AdminSubject } from "@/types/admin";

const TYPE_LABEL: Record<AdminSubject["type"], string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
};

function attendanceTone(rate: number): ProgressTone {
  if (rate >= 90) return "success";
  if (rate >= 75) return "warning";
  return "destructive";
}

export function SubjectsView() {
  const { data, loading, error, refresh } = useAdminSubjects();
  const subjects = useMemo(() => data ?? [], [data]);

  return (
    <Panel
      title="Subjects"
      description="Course master list with faculty ownership and attendance standing"
      flush
    >
      {loading ? (
        <ListSkeleton rows={7} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : subjects.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
            title="No subjects configured"
            description="Subjects appear here once the course structure is set up."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Code</TableHeader>
              <TableHeader>Subject</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Faculty</TableHeader>
              <TableHeader>Room</TableHeader>
              <TableHeader className="text-right">Sessions / wk</TableHeader>
              <TableHeader className="w-[22%] min-w-36">Attendance</TableHeader>
              <TableHeader className="text-right">At risk</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.code}>
                <TableCell className="tabular text-sm text-muted-foreground">
                  {subject.code}
                </TableCell>
                <TableCell>
                  <span className="block text-sm font-medium">{subject.name}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={subject.type === "lab" ? "info" : "secondary"}>
                    {TYPE_LABEL[subject.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{subject.facultyName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {subject.defaultRoom}
                </TableCell>
                <TableCell className="tabular text-right text-sm">
                  {subject.weeklySessions}
                </TableCell>
                <TableCell>
                  {subject.attendanceRate == null ? (
                    <span className="text-xs text-muted-foreground">No records yet</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Progress
                        value={subject.attendanceRate}
                        tone={attendanceTone(subject.attendanceRate)}
                        className="flex-1"
                      />
                      <span className="tabular w-12 text-right text-sm font-medium">
                        {subject.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="tabular text-right text-sm">
                  {subject.belowThreshold > 0 ? (
                    <span className="font-medium text-destructive">
                      {subject.belowThreshold}
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
  );
}
