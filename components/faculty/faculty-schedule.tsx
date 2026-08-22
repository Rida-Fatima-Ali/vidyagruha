"use client";

import { useMemo, useState } from "react";
import { Presentation, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { Panel } from "@/components/common/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManageLectureDialog } from "@/components/faculty/manage-lecture-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useFacultyLectures } from "@/hooks/use-faculty";
import { DEMO_WEEK_START } from "@/constants/demo";
import { formatDayLabel, weekDates } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { FacultyLectureOverview } from "@/types/faculty";
import type { ScheduleChangeKind } from "@/types/schedule";

const TYPE_LABEL: Record<FacultyLectureOverview["type"], string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
};

const STATUS_META: Record<
  ScheduleChangeKind,
  { label: string; variant: "warning" | "destructive" | "info" }
> = {
  cancelled: { label: "Cancelled", variant: "destructive" },
  rescheduled: { label: "Rescheduled", variant: "warning" },
  swapped: { label: "Swapped", variant: "warning" },
  room_changed: { label: "Room changed", variant: "warning" },
  faculty_changed: { label: "Faculty changed", variant: "warning" },
  extra: { label: "Additional", variant: "info" },
};

function StatusBadge({ lecture }: { lecture: FacultyLectureOverview }) {
  if (lecture.status === "normal") return null;
  const meta = STATUS_META[lecture.status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function FacultySchedule() {
  const { user } = useAuth();
  const { lectures, loading, error, refresh } = useFacultyLectures(user, DEMO_WEEK_START);
  const [selected, setSelected] = useState<FacultyLectureOverview | null>(null);

  const days = useMemo(() => weekDates(DEMO_WEEK_START, 7), []);
  const byDay = useMemo(() => {
    const grouped = new Map<string, FacultyLectureOverview[]>();
    for (const lecture of lectures) {
      const list = grouped.get(lecture.date) ?? [];
      list.push(lecture);
      grouped.set(lecture.date, list);
    }
    return grouped;
  }, [lectures]);

  return (
    <>
      <Panel
        title="Your lectures"
        description={`${formatDayLabel(days[0])} – ${formatDayLabel(days[days.length - 1])} · changes appear in students' timetables instantly`}
        flush
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void refresh()}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
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
        ) : lectures.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Presentation className="h-5 w-5" aria-hidden="true" />}
              title="No lectures this week"
              description="Lectures you are assigned to will appear here."
            />
          </div>
        ) : (
          days.map((day) => {
            const dayLectures = byDay.get(day) ?? [];
            if (dayLectures.length === 0) return null;
            return (
              <section key={day} className="border-t border-border/80 first:border-t-0">
                <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {formatDayLabel(day)}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {dayLectures.length}{" "}
                    {dayLectures.length === 1 ? "lecture" : "lectures"}
                  </span>
                </header>
                <ul className="divide-y divide-border">
                  {dayLectures.map((lecture) => {
                    const cancelled = lecture.status === "cancelled";
                    return (
                      <li
                        key={lecture.id}
                        className={cn(
                          "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4",
                          cancelled && "opacity-70",
                        )}
                      >
                        <div className="w-16 shrink-0">
                          <p className="tabular text-sm font-medium">
                            {lecture.start}
                          </p>
                          <p className="tabular text-xs text-muted-foreground">
                            {lecture.end}
                          </p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            <span
                              className={cn(
                                "truncate",
                                cancelled && "line-through",
                              )}
                            >
                              {lecture.subject}
                            </span>
                            <span className="tabular shrink-0 text-xs text-muted-foreground">
                              {lecture.code}
                            </span>
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{lecture.room}</span>
                            <span
                              aria-hidden="true"
                              className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                            />
                            <span>{TYPE_LABEL[lecture.type]}</span>
                            <span
                              aria-hidden="true"
                              className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                            />
                            <span>{lecture.group}</span>
                            {lecture.faculty ? (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                                />
                                <span>{lecture.faculty}</span>
                              </>
                            ) : null}
                          </p>
                          {lecture.adjustment && !cancelled ? (
                            <p className="mt-1 text-xs font-medium text-warning">
                              {lecture.adjustment.note}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:ml-2">
                          <StatusBadge lecture={lecture} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelected(lecture)}
                          >
                            Manage
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </Panel>

      {selected ? (
        <ManageLectureDialog
          key={selected.id}
          lecture={selected}
          weekStart={DEMO_WEEK_START}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            void refresh();
          }}
        />
      ) : null}
    </>
  );
}
