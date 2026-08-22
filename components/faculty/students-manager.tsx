"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardX, TrendingDown, Users } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-faculty";
import { cn } from "@/utils/cn";

type GroupFilter = "all" | "cmpn-a" | "cmpn-b";

export function StudentsManager() {
  const { user } = useAuth();
  const { data: view, loading, error, refresh } = useStudents(user);
  const [group, setGroup] = useState<GroupFilter>("all");

  const rows = useMemo(() => {
    const source = view?.rows ?? [];
    if (group === "all") return source;
    return source.filter((row) => row.group === group);
  }, [view, group]);

  return (
    <>
      <StatTiles
        items={[
          {
            id: "students",
            label: "Students",
            value: rows.length,
            icon: Users,
          },
          {
            id: "risk",
            label: "Need attention",
            value: view?.atRiskCount ?? 0,
            icon: AlertTriangle,
            tone: "destructive",
          },
          {
            id: "below",
            label: "Attendance below 75%",
            value: view?.below75Count ?? 0,
            icon: TrendingDown,
            tone: "warning",
          },
          {
            id: "missing",
            label: "Missing assignments",
            value: view?.missingAssignmentsCount ?? 0,
            icon: ClipboardX,
            tone: "info",
          },
        ]}
      />

      <Panel
        title="Students"
        description="Attendance and submission flags across the subjects you teach"
        flush
        action={
          <SegmentedControl<GroupFilter>
            options={[
              { value: "all", label: "All" },
              { value: "cmpn-a", label: "CMPN-A" },
              { value: "cmpn-b", label: "CMPN-B" },
            ]}
            value={group}
            onChange={setGroup}
            ariaLabel="Filter students by group"
          />
        }
      >
        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            className="m-5"
            description={error}
            onRetry={() => void refresh()}
          />
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Users className="h-5 w-5" aria-hidden="true" />}
              title="No flags to show"
              description="Students stay on this list while attendance is below 75% or assignments are missing."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li
                key={`${row.studentId}-${row.code}`}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={row.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="truncate text-sm font-medium">{row.name}</p>
                      <span className="tabular text-xs text-muted-foreground">
                        {row.rollNo}
                      </span>
                      <Badge variant="outline">{row.group}</Badge>
                      {row.belowThreshold ? (
                        <Badge variant="destructive">Below threshold</Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.subject} · {row.code}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 sm:ml-2">
                  <div className="w-28">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Attendance</span>
                      <span
                        className={cn(
                          "tabular font-semibold",
                          row.attendance < 75
                            ? "text-destructive"
                            : "text-warning",
                        )}
                      >
                        {row.attendance}%
                      </span>
                    </div>
                    <Progress
                      value={row.attendance}
                      tone={
                        row.attendance < 75 ? "destructive" : "warning"
                      }
                      className="mt-1.5 h-1.5"
                    />
                  </div>

                  {row.missingAssignments > 0 ? (
                    <Badge variant="warning">
                      {row.missingAssignments} assignment
                      {row.missingAssignments === 1 ? "" : "s"} missing
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
