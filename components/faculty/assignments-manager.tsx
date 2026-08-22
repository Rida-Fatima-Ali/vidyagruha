"use client";

import { useState } from "react";
import { CalendarClock, CirclePlus, FileText, Inbox, Layers } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignmentDialog } from "@/components/faculty/assignment-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  useAssignmentStats,
  useCreateAssignment,
  useFacultyAssignments,
  useFacultyMaterials,
} from "@/hooks/use-faculty";
import { DEMO_NOW } from "@/constants/demo";
import { formatDueLabel, formatTime } from "@/utils/date";
import type { FacultyAssignment } from "@/types/faculty";

function assignmentStatus(assignment: FacultyAssignment): {
  label: string;
  variant: "info" | "secondary" | "destructive" | "warning";
} {
  if (new Date(assignment.dueDate) < DEMO_NOW) {
    return { label: "Closed", variant: "secondary" };
  }
  const withinThreeDays =
    new Date(assignment.dueDate).getTime() - DEMO_NOW.getTime() <= 3 * 86_400_000;
  if (withinThreeDays) {
    return { label: "Due soon", variant: "warning" };
  }
  return { label: "Active", variant: "info" };
}

export function AssignmentsManager() {
  const { user } = useAuth();
  const { data: assignments, loading, error, refresh } = useFacultyAssignments(user);
  const stats = useAssignmentStats(user);
  const materials = useFacultyMaterials(user);
  const createManager = useCreateAssignment(user);
  const [dialogOpen, setDialogOpen] = useState(false);

  const subjects = [...new Set((assignments ?? []).map((a) => a.code))].map((code) => ({
    code,
    subject: assignments?.find((a) => a.code === code)?.subject ?? code,
  }));

  return (
    <>
      <StatTiles
        className="[&_span]:dark:bg-white/[0.03]"
        items={[
          {
            id: "total",
            label: "Assignments",
            value: stats.data?.total ?? 0,
            icon: Layers,
          },
          {
            id: "active",
            label: "Active now",
            value: stats.data?.active ?? 0,
            icon: FileText,
            tone: "info",
          },
          {
            id: "due",
            label: "Due in 3 days",
            value: stats.data?.dueSoon ?? 0,
            icon: CalendarClock,
            tone: "warning",
          },
          {
            id: "pending",
            label: "Awaiting submission",
            value: stats.data?.pendingSubmissions ?? 0,
            icon: Inbox,
            tone: "destructive",
          },
        ]}
      />

      <Panel
        title="Assignments"
        description="Everything you've published to your class, newest first"
        flush
        action={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <CirclePlus className="h-4 w-4" aria-hidden="true" />
            New assignment
          </Button>
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
        ) : !assignments || assignments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<FileText className="h-5 w-5" aria-hidden="true" />}
              title="No assignments yet"
              description="Publish your first assignment to share it with the class."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {assignments.map((assignment) => {
              const status = assignmentStatus(assignment);
              return (
                <li
                  key={assignment.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{assignment.title}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {assignment.subject}
                      </span>
                      <span className="tabular">{assignment.code}</span>
                      <span
                        aria-hidden="true"
                        className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                      />
                      <span>Due {formatDueLabel(assignment.dueDate)}</span>
                      <span className="tabular">
                        {formatTime(assignment.dueDate)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                      />
                      <span>{assignment.maxMarks} marks</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:ml-2">
                    <Link
                      href={`/faculty/submissions?assignment=${assignment.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-primary ring-1 ring-inset ring-primary/40 transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-none"
                    >
                      Review
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <AssignmentDialog
        open={dialogOpen}
        subjects={subjects}
        materials={materials.data ?? []}
        busy={createManager.busy}
        error={createManager.error}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (input) => {
          const ok = await createManager.create(input);
          if (ok) void refresh();
          return ok;
        }}
      />
    </>
  );
}
