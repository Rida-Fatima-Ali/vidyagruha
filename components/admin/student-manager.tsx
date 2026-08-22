"use client";

import { useMemo, useState } from "react";
import { Search, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminStudents } from "@/hooks/use-admin";
import { GROUP_SLUGS, groupLabel } from "@/mocks/roster";
import { cn } from "@/utils/cn";

type GroupFilter = "all" | (typeof GROUP_SLUGS)[number];

function attendanceTone(percent: number): ProgressTone {
  if (percent >= 90) return "success";
  if (percent >= 75) return "warning";
  return "destructive";
}

export function StudentManager() {
  const [group, setGroup] = useState<GroupFilter>("all");
  const [search, setSearch] = useState("");
  const { data, loading, error, refresh } = useAdminStudents(group === "all" ? "" : group);

  const students = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter(
      (student) =>
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query),
    );
  }, [students, search]);

  return (
    <Panel
      title="Students"
      description="Attendance and coursework standing per student, live from the shared records"
      flush
      action={
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<GroupFilter>
            ariaLabel="Filter by division"
            value={group}
            onChange={setGroup}
            options={[
              { value: "all", label: "All divisions" },
              ...GROUP_SLUGS.map((slug) => ({ value: slug, label: groupLabel(slug) })),
            ]}
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or roll no…"
            aria-label="Search students"
            className="h-8 w-52"
          />
        </div>
      }
    >
      {loading ? (
        <ListSkeleton rows={8} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Search className="h-5 w-5" aria-hidden="true" />}
            title="No students found"
            description="Try a different division or search term."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Roll no</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Division</TableHeader>
              <TableHeader className="w-[30%] min-w-40">Attendance</TableHeader>
              <TableHeader>Risk</TableHeader>
              <TableHeader className="text-right">Assignments missed</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="tabular text-sm text-muted-foreground">
                  {student.rollNo}
                </TableCell>
                <TableCell>
                  <span className="block text-sm font-medium">{student.name}</span>
                </TableCell>
                <TableCell className="text-sm">{student.group}</TableCell>
                <TableCell>
                  {student.attendancePercent == null ? (
                    <span className="text-xs text-muted-foreground">No records yet</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Progress
                        value={student.attendancePercent}
                        tone={attendanceTone(student.attendancePercent)}
                        className="flex-1"
                      />
                      <span
                        className={cn(
                          "tabular w-12 text-right text-sm font-medium",
                          student.belowThreshold ? "text-destructive" : "",
                        )}
                      >
                        {student.attendancePercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {student.belowThreshold ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                      <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      Below threshold
                    </span>
                  ) : (
                    <Badge variant="outline">On track</Badge>
                  )}
                </TableCell>
                <TableCell className="tabular text-right text-sm">
                  {student.missingAssignments > 0 ? (
                    <span className="font-medium text-destructive">
                      {student.missingAssignments}
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
