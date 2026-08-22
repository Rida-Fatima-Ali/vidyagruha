"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { formatTodayLabel } from "@/utils/date";
import { DEMO_NOW } from "@/constants/demo";
import type { FacultyClassSlot } from "@/types/faculty";

const TYPE_LABEL: Record<FacultyClassSlot["type"], string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
};

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function slotStatus(slot: FacultyClassSlot): "done" | "now" | "upcoming" {
  const now = DEMO_NOW.getHours() * 60 + DEMO_NOW.getMinutes();
  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  if (now >= end) return "done";
  if (now >= start) return "now";
  return "upcoming";
}

export interface ClassQueueProps {
  classes: FacultyClassSlot[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onMarkAttendance?: (slot: FacultyClassSlot) => void;
}

export function ClassQueue({ classes, loading, error, onRetry, onMarkAttendance }: ClassQueueProps) {
  const reduceMotion = useReducedMotion();
  const sorted = [...classes].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const nextPendingId = sorted.find(
    (slot) => !slot.attendanceMarked && slotStatus(slot) !== "done",
  )?.id;

  return (
    <Panel
      title="Your teaching day"
      description={formatTodayLabel()}
      flush
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : sorted.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="No classes today"
          description="Your teaching timetable is clear for today."
        />
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((slot, index) => {
            const status = slotStatus(slot);
            const isLive = status === "now" && !slot.attendanceMarked;
            const isNext = slot.id === nextPendingId && status === "upcoming";

            return (
              <motion.li
                key={slot.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "relative flex flex-col gap-3 px-5 py-4 transition-colors duration-200 sm:flex-row sm:items-center sm:gap-4",
                  isLive &&
                    "before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-primary before:content-['']",
                  isLive && "bg-primary/[0.04]",
                  status === "done" && "opacity-60",
                )}
              >
                <div className="w-11 shrink-0 text-right sm:static">
                  <p className={cn("meta text-sm font-medium", isLive && "text-primary")}>
                    {slot.start}
                  </p>
                  <p className="meta text-xs text-muted-foreground">{slot.end}</p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span className="truncate">{slot.subject}</span>
                    {isLive ? <span className="kicker text-primary">Now</span> : null}
                    <span className="meta shrink-0 text-muted-foreground">
                      {slot.code}
                    </span>
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{slot.group}</span>
                    <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                    <span className="meta">{slot.room}</span>
                    <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                    <span>{TYPE_LABEL[slot.type]}</span>
                    <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                    <span className="tabular">{slot.students} students</span>
                  </p>
                </div>

                {slot.attendanceMarked ? (
                  <Badge variant="success" className="shrink-0 gap-1 sm:ml-2">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Attendance marked
                  </Badge>
                ) : (
                  <Button
                    variant={isLive ? "accent" : "default"}
                    size="sm"
                    className={cn("shrink-0 sm:ml-2", !isLive && !isNext && "opacity-80")}
                    onClick={() => onMarkAttendance?.(slot)}
                  >
                    Mark attendance
                  </Button>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
