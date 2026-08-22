"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { cn } from "@/utils/cn";
import { formatTodayLabel } from "@/utils/date";
import { DEMO_NOW } from "@/constants/demo";
import type { ScheduleChangeKind } from "@/types/schedule";
import type { ScheduleSlot } from "@/types/student";

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

type SlotStatus = "done" | "now" | "upcoming";

function statusOf(slot: ScheduleSlot): SlotStatus {
  const now = DEMO_NOW.getHours() * 60 + DEMO_NOW.getMinutes();
  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  if (now >= end) return "done";
  if (now >= start) return "now";
  return "upcoming";
}

/** Elapsed fraction of a running lecture — drives the live progress bar. */
function liveProgress(slot: ScheduleSlot): number {
  const now = DEMO_NOW.getHours() * 60 + DEMO_NOW.getMinutes();
  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

const ADJUSTMENT_TONE: Record<ScheduleChangeKind, string> = {
  cancelled: "text-destructive",
  rescheduled: "text-warning",
  swapped: "text-warning",
  room_changed: "text-warning",
  faculty_changed: "text-warning",
  extra: "text-info",
};

const TYPE_LABEL: Record<ScheduleSlot["type"], string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
};

export interface ScheduleListProps {
  slots: ScheduleSlot[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  showViewAll?: boolean;
}

export function ScheduleList({
  slots,
  loading,
  error,
  onRetry,
  showViewAll = true,
}: ScheduleListProps) {
  const reduceMotion = useReducedMotion();
  const sorted = [...slots].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const nextSlotId = sorted.find(
    (slot) => slot.adjustment?.kind !== "cancelled" && statusOf(slot) !== "done",
  )?.id;

  return (
    <Panel
      title="Today's timeline"
      description={formatTodayLabel()}
      flush
      action={
        showViewAll ? (
          <Link
            href="/student/calendar"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            View calendar
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : sorted.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="No classes today"
          description="Your timetable is clear for today. Enjoy the break."
        />
      ) : (
        <ul className="px-5 py-2">
          {sorted.map((slot, index) => {
            const cancelled = slot.adjustment?.kind === "cancelled";
            const status = statusOf(slot);
            const rowStatus = cancelled ? "done" : status;
            const isNext = slot.id === nextSlotId && !cancelled;
            const isLive = rowStatus === "now";

            return (
              <motion.li
                key={slot.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.05, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group grid grid-cols-[3rem_1.25rem_1fr] items-stretch gap-3 py-2"
              >
                {/* Time column */}
                <div
                  className={cn(
                    "flex flex-col justify-center text-right transition-opacity duration-300",
                    rowStatus === "done" ? "opacity-40" : "opacity-100",
                  )}
                >
                  <p className="tabular text-sm font-medium">{slot.start}</p>
                  <p className="tabular text-xs text-muted-foreground">{slot.end}</p>
                </div>

                {/* Timeline rail */}
                <div className="relative flex justify-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 left-1/2 w-px -translate-x-1/2",
                      isLive ? "bg-primary/50" : "bg-border",
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300",
                      isLive
                        ? "h-3 w-3 bg-primary ring-4 ring-primary/15"
                        : isNext
                          ? "h-2.5 w-2.5 bg-foreground/70 ring-4 ring-border"
                          : "h-2 w-2 bg-muted-foreground/30",
                    )}
                  />
                </div>

                {/* Lecture surface */}
                <div
                  className={cn(
                    "flex min-w-0 items-center rounded-xl p-3 transition-colors duration-200",
                    isLive &&
                      "-m-1 border border-primary/25 bg-surface p-4 shadow-card backdrop-blur-sm",
                    !isLive && isNext && "bg-surface-2",
                    !isLive && !isNext && "hover:bg-surface-2/60",
                    rowStatus === "done" && "opacity-55 saturate-[0.6]",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <span
                          className={cn(
                            "truncate",
                            cancelled
                              ? "text-muted-foreground line-through decoration-muted-foreground/60"
                              : "",
                          )}
                        >
                          {slot.subject}
                        </span>
                        {isLive ? (
                          <span className="kicker shrink-0 text-primary">Live</span>
                        ) : null}
                        <span className="meta shrink-0 text-muted-foreground">
                          {slot.code}
                        </span>
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{slot.faculty}</span>
                        <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                        <span className="meta">{slot.room}</span>
                        <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                        <span>{TYPE_LABEL[slot.type]}</span>
                      </p>
                      {slot.adjustment && !cancelled ? (
                        <p
                          className={cn(
                            "mt-0.5 flex items-center gap-1.5 text-xs font-medium",
                            ADJUSTMENT_TONE[slot.adjustment.kind],
                          )}
                        >
                          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
                          {slot.adjustment.note}
                        </p>
                      ) : null}
                    </div>

                    {/* Right side: live progress or status */}
                    <div className="flex shrink-0 items-center gap-3 sm:w-32 sm:flex-col sm:items-end sm:gap-1.5">
                      {isLive ? (
                        <>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3 sm:w-28">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.round(liveProgress(slot) * 100)}%` }}
                              role="progressbar"
                              aria-label={`${slot.subject} progress`}
                              aria-valuenow={Math.round(liveProgress(slot) * 100)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                          <span className="tabular text-[11px] font-medium text-primary">
                            ends {slot.end}
                          </span>
                        </>
                      ) : cancelled ? (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive ring-1 ring-inset ring-destructive/25">
                          Cancelled
                        </span>
                      ) : rowStatus === "done" ? (
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          Completed
                        </span>
                      ) : isNext ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-inset ring-primary/25">
                          Up next
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
