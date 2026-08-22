import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn";
import type { DepartmentStat } from "@/types/admin";

function attendanceTone(rate: number): ProgressTone {
  if (rate >= 90) return "success";
  if (rate >= 85) return "warning";
  return "destructive";
}

export interface DepartmentPerformanceProps {
  departments: DepartmentStat[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function DepartmentPerformance({
  departments,
  loading,
  error,
  onRetry,
}: DepartmentPerformanceProps) {
  return (
    <Panel
      title="Departments & attendance"
      description="Today's attendance across departments"
      flush
    >
      {loading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : departments.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="No department data"
          description="Attendance data will appear here once classes are marked."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Department</TableHeader>
              <TableHeader className="text-right">Students</TableHeader>
              <TableHeader className="text-right">Faculty</TableHeader>
              <TableHeader className="w-[38%] min-w-40">Attendance</TableHeader>
              <TableHeader className="text-right">Trend</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>
                  <span className="block text-sm font-medium">{department.name}</span>
                  <span className="tabular block text-xs text-muted-foreground">
                    {department.code}
                  </span>
                </TableCell>
                <TableCell className="tabular text-right text-sm">
                  {department.students.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="tabular text-right text-sm">
                  {department.faculty}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={department.attendanceRate}
                      tone={attendanceTone(department.attendanceRate)}
                      className="flex-1"
                    />
                    <span className="tabular w-12 text-right text-sm font-medium">
                      {department.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "tabular inline-flex items-center gap-0.5 text-xs font-medium",
                      department.trend >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {department.trend >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {department.trend >= 0 ? "+" : ""}
                    {department.trend.toFixed(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
