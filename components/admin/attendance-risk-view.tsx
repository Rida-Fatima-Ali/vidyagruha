"use client";

import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";
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
import { useAdminRisk } from "@/hooks/use-admin";

function riskTone(percent: number): ProgressTone {
  if (percent >= 90) return "success";
  if (percent >= 75) return "warning";
  return "destructive";
}

export function AttendanceRiskView() {
  const { data, loading, error, refresh } = useAdminRisk();
  const subjects = useMemo(() => data?.subjects ?? [], [data]);
  const students = useMemo(() => data?.students ?? [], [data]);

  if (error) {
    return <ErrorState description={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Subjects at risk"
        description="Subjects where students are trending below the attendance threshold"
        flush
      >
        {loading ? (
          <ListSkeleton rows={6} />
        ) : subjects.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No subject risk" description="Every subject is above its attendance threshold." />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeader>Subject</TableHeader>
                <TableHeader>Faculty</TableHeader>
                <TableHeader className="w-[26%] min-w-40">Class attendance</TableHeader>
                <TableHeader className="text-right">Threshold</TableHeader>
                <TableHeader className="text-right">At risk</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((row) => (
                <TableRow key={row.code}>
                  <TableCell>
                    <span className="block text-sm font-medium">{row.subject}</span>
                    <span className="tabular block text-xs text-muted-foreground">{row.code}</span>
                  </TableCell>
                  <TableCell className="text-sm">{row.facultyName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={row.classPercent} tone={riskTone(row.classPercent)} className="flex-1" />
                      <span className="tabular w-12 text-right text-sm font-medium">{row.classPercent.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-right text-sm text-muted-foreground">{row.threshold}%</TableCell>
                  <TableCell className="text-right">
                    {row.atRiskCount > 0 ? (
                      <span className="tabular inline-flex items-center gap-1 text-sm font-medium text-destructive">
                        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        {row.atRiskCount} / {row.totalStudents}
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

      <Panel
        title="At-risk students"
        description="Students below threshold, with missing coursework counted"
        flush
      >
        {loading ? (
          <ListSkeleton rows={6} />
        ) : students.length === 0 ? (
          <div className="p-5">
            <EmptyState title="All clear" description="No students are below the attendance threshold right now." />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeader>Student</TableHeader>
                <TableHeader>Subject</TableHeader>
                <TableHeader>Faculty</TableHeader>
                <TableHeader className="w-[24%] min-w-36">Attendance</TableHeader>
                <TableHeader className="text-right">Threshold</TableHeader>
                <TableHeader className="text-right">Assignments missed</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((row) => (
                <TableRow key={`${row.student.id}-${row.code}`}>
                  <TableCell>
                    <span className="block text-sm font-medium">{row.student.name}</span>
                    <span className="tabular block text-xs text-muted-foreground">
                      {row.student.rollNo} · {row.student.group}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block text-sm">{row.subject}</span>
                    <span className="tabular block text-xs text-muted-foreground">{row.code}</span>
                  </TableCell>
                  <TableCell className="text-sm">{row.facultyName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={row.percent} tone={riskTone(row.percent)} className="flex-1" />
                      <span className="tabular w-12 text-right text-sm font-medium text-destructive">{row.percent.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-right text-sm text-muted-foreground">{row.threshold}%</TableCell>
                  <TableCell className="text-right">
                    {row.missingAssignments > 0 ? (
                      <Badge variant="warning">{row.missingAssignments} missed</Badge>
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
    </div>
  );
}
