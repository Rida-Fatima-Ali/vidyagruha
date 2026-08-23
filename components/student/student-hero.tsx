"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";
import { DEMO_NOW } from "@/constants/demo";
import type { ScheduleChangeKind } from "@/types/schedule";
import type {
  ScheduleSlot,
  StudentAssignment,
  SubjectAttendance,
} from "@/types/student";

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function slotStatus(slot: ScheduleSlot): "done" | "now" | "upcoming" {
  const now = DEMO_NOW.getHours() * 60 + DEMO_NOW.getMinutes();
  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  if (now >= end) return "done";
  if (now >= start) return "now";
  return "upcoming";
}

const ADJUSTMENT_TONE: Record<ScheduleChangeKind, string> = {
  cancelled: "text-destructive",
  rescheduled: "text-warning",
  swapped: "text-warning",
  room_changed: "text-warning",
  faculty_changed: "text-warning",
  extra: "text-info",
};

function overallPercent(subjects: SubjectAttendance[]): number {
  const attended = subjects.reduce((sum, subject) => sum + subject.attended, 0);
  const total = subjects.reduce((sum, subject) => sum + subject.total, 0);
  return total > 0 ? (attended / total) * 100 : 0;
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - DEMO_NOW.getTime()) / 86_400_000);
}

export interface StudentHeroProps {
  eyebrow?: string;
  title: string;
  summary?: string;
  schedule: ScheduleSlot[];
  attendance: SubjectAttendance[];
  assignments: StudentAssignment[];
  loading?: boolean;
}

/**
 * The opening statement of VidyaGruha — editorial, not dashboard.
 *
 * Content sits directly on the page (no container), organized by
 * typography and hairlines: a serif greeting, the day's date, the next
 * class as a reading block on the left; attendance and workload as two
 * quiet figures down the right.
 */
export function StudentHero({
  eyebrow,
  title,
  summary,
  schedule,
  attendance,
  assignments,
  loading,
}: StudentHeroProps) {
  const reduceMotion = useReducedMotion();

  const nextSlot =
    [...schedule]
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
      .find(
        (slot) =>
          slot.adjustment?.kind !== "cancelled" && slotStatus(slot) !== "done",
      ) ?? null;

  const liveSlot = schedule.find((slot) => slotStatus(slot) === "now") ?? null;
  const percent = overallPercent(attendance);

  const pendingSoon = assignments.filter(
    (assignment) =>
      assignment.status === "pending" && daysUntil(assignment.dueDate) <= 7,
  ).length;
  const overdue = assignments.filter(
    (assignment) => assignment.status === "late",
  ).length;
  const attention = pendingSoon + overdue;

  const fade = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative">
      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        {/* Identity + next class */}
        <div className="min-w-0">
          {eyebrow ? (
            <motion.p
              {...fade(0)}
              className="kicker flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground"
            >
              <span>{eyebrow}</span>
              {liveSlot ? (
                <span className="inline-flex items-center gap-1.5 text-primary normal-case tracking-normal text-xs font-medium">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-primary motion-reduce:animate-none"
                  />
                  {liveSlot.subject} in progress
                </span>
              ) : null}
            </motion.p>
          ) : null}

          <motion.h1
            {...fade(0.06)}
            className="display-hero mt-4 text-[2.75rem] leading-[1.05] sm:text-6xl"
          >
            {title}
          </motion.h1>

          {summary ? (
            <motion.p
              {...fade(0.12)}
              className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted-foreground"
            >
              {summary}
            </motion.p>
          ) : null}

          {/* Next class — a reading block under a hairline */}
          <motion.div {...fade(0.18)} className="mt-9 max-w-md border-t border-border pt-5">
            <p className="kicker text-muted-foreground">Next class</p>
            {loading ? (
              <div className="mt-3 space-y-2" aria-hidden="true">
                <span className="block h-5 w-40 animate-pulse rounded bg-surface-3" />
                <span className="block h-3.5 w-64 animate-pulse rounded bg-surface-2" />
              </div>
            ) : nextSlot ? (
              <>
                <p className="mt-2.5 text-xl font-medium tracking-tight">
                  {nextSlot.subject}
                </p>
                <p className="meta mt-1.5 text-sm text-muted-foreground">
                  {nextSlot.start} – {nextSlot.end} · {nextSlot.room}
                  <span aria-hidden="true"> · </span>
                  {nextSlot.faculty}
                </p>
                {nextSlot.adjustment &&
                nextSlot.adjustment.kind !== "cancelled" ? (
                  <p
                    className={cn(
                      "mt-2 flex items-center gap-1.5 text-sm font-medium",
                      ADJUSTMENT_TONE[nextSlot.adjustment.kind],
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 shrink-0 rounded-full bg-current"
                    />
                    {nextSlot.adjustment.note}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="mt-2.5 text-xl font-medium tracking-tight">
                  Day complete
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  No more classes today. Your calendar has what&apos;s next.
                </p>
              </>
            )}
          </motion.div>
        </div>

        {/* Vitals — two figures, hairline-separated */}
        <motion.dl
          {...fade(0.24)}
          className="grid grid-cols-2 gap-x-8 border-t border-border pt-5 sm:gap-x-14 lg:block lg:border-t-0 lg:pt-0"
        >
          <div>
            <dt className="kicker text-muted-foreground">Attendance</dt>
            <dd
              aria-live="polite"
              className={cn(
                "stat-number mt-3 text-5xl tabular",
                loading && "animate-pulse text-surface-4",
              )}
            >
              {loading ? "—" : `${percent.toFixed(1)}%`}
            </dd>
            <dd
              className={cn(
                "mt-2 text-sm font-medium",
                percent >= 75
                  ? "text-success"
                  : percent >= 65
                    ? "text-warning"
                    : "text-destructive",
              )}
            >
              {percent >= 75
                ? "Above the 75% threshold"
                : percent >= 65
                  ? "Close to the threshold"
                  : "Below the 75% threshold"}
            </dd>
          </div>

          <div className="lg:mt-6 lg:border-t lg:border-border lg:pt-5">
            <dt className="kicker text-muted-foreground">Assignments</dt>
            <dd
              className={cn(
                "stat-number mt-3 text-5xl tabular",
                loading && "animate-pulse text-surface-4",
              )}
            >
              {loading
                ? "—"
                : attention > 0
                  ? String(Math.min(attention, 99)).padStart(2, "0")
                  : "00"}
            </dd>
            <dd className="mt-2 text-sm font-medium text-muted-foreground">
              {attention > 0
                ? `${overdue > 0 ? `${overdue} overdue · ` : ""}${pendingSoon} due this week`
                : "Nothing needs attention"}
            </dd>
          </div>
        </motion.dl>
      </div>
    </section>
  );
}
