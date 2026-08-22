"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, MapPin, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { formatShortDate } from "@/utils/date";
import type { AttendanceSessionLite } from "@/types/attendance";

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export interface CurrentLectureProps {
  /** The lecture the faculty member should focus on right now. */
  session: AttendanceSessionLite | null;
  /** Number of batches sharing this lecture (2 in the demo). */
  batchCount: number;
  /** Prototype clock used to decide the live state. */
  now: Date;
  loading: boolean;
  onMarkAttendance: () => void;
  onViewSchedule: () => void;
}

/**
 * The teaching day's operating surface — a dense, confident command card.
 * When live, a progress rail fills between start and end on the demo clock,
 * and the attendance CTA is the one emphatic element in the room.
 */
export function CurrentLecture({
  session,
  batchCount,
  now,
  loading,
  onMarkAttendance,
  onViewSchedule,
}: CurrentLectureProps) {
  const reduceMotion = useReducedMotion();

  if (loading) {
    return (
      <section className="card-surface relative overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="flex h-44 animate-pulse flex-col justify-end gap-3 p-6">
          <div className="h-3 w-24 rounded bg-surface-3" />
          <div className="h-5 w-56 rounded bg-surface-3" />
          <div className="h-3 w-40 rounded bg-surface-3" />
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="card-surface relative overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="relative z-10 flex flex-col gap-3 p-6">
          <Badge variant="secondary" className="w-fit">
            Teaching day
          </Badge>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            No classes on {formatShortDate(now)}
          </h2>
          <p className="text-sm text-muted-foreground">
            Your schedule is clear. New lectures and attendance runs will appear
            here.
          </p>
        </div>
      </section>
    );
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = toMinutes(session.start);
  const endMinutes = toMinutes(session.end);
  const live = nowMinutes >= startMinutes && nowMinutes < endMinutes;
  const progress =
    endMinutes > startMinutes
      ? Math.min(
          1,
          Math.max(0, (nowMinutes - startMinutes) / (endMinutes - startMinutes)),
        )
      : 0;

  return (
    <section className="card-surface relative overflow-hidden rounded-2xl border border-border shadow-card">
      {live ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[2px] bg-primary/60 motion-reduce:animate-none"
        />
      ) : null}

      <div className="relative z-10 flex flex-col gap-4 p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={live ? "success" : "info"} className="gap-1.5">
            {live ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
                />
                In progress
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Up next
              </>
            )}
          </Badge>
          <span className="tabular text-xs text-muted-foreground">
            {formatShortDate(session.date)}
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {session.subject}
              </h2>
              <span className="meta text-muted-foreground">
                {session.code}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="meta flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {session.start}–{session.end}
              </span>
              <span className="meta flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {session.room}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden="true" />
                {batchCount} batch{batchCount === 1 ? "" : "es"} · {session.group.split(" · ")[0]}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewSchedule}>
              Schedule
            </Button>
            <Button
              variant={live ? "default" : "outline"}
              size="sm"
              onClick={onMarkAttendance}
            >
              Mark attendance
            </Button>
          </div>
        </div>

        {/* Session progress rail */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-1 flex items-center gap-3"
        >
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-surface-4/70">
            {live ? (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-success"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : null}
          </div>
          <p
            className={cn(
              "shrink-0 text-xs font-medium tabular",
              live ? "text-success" : "text-muted-foreground",
            )}
          >
            {live
              ? `${Math.round(progress * 100)}% elapsed · ends ${session.end}`
              : `Starts at ${session.start}`}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
