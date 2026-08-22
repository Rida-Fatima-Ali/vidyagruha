"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  RadialProgress,
  type RadialTone,
} from "@/components/ui/radial-progress";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import { cn } from "@/utils/cn";
import type { AttendanceStatus, SubjectAttendance } from "@/types/student";

export const THRESHOLD = 75;

function statusTone(status: AttendanceStatus): ProgressTone {
  if (status === "critical") return "destructive";
  if (status === "warning") return "warning";
  return "success";
}

function radialTone(status: AttendanceStatus): RadialTone {
  if (status === "critical") return "destructive";
  if (status === "warning") return "warning";
  return "success";
}

const STATUS_TEXT_CLASS: Record<AttendanceStatus, string> = {
  good: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
};

const STATUS_DOT_CLASS: Record<AttendanceStatus, string> = {
  good: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

function overallOf(subjects: SubjectAttendance[]): {
  percent: number;
  status: AttendanceStatus;
  attended: number;
  total: number;
} {
  const attended = subjects.reduce((sum, subject) => sum + subject.attended, 0);
  const total = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const percent = total > 0 ? (attended / total) * 100 : 0;
  const status: AttendanceStatus =
    percent >= THRESHOLD ? "good" : percent >= 65 ? "warning" : "critical";
  return { percent, status, attended, total };
}

export interface AttendanceSummaryProps {
  subjects: SubjectAttendance[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  showOverall?: boolean;
  showViewAll?: boolean;
}

/**
 * Attendance as atmosphere — an animated health arc for the overall figure,
 * subject rhythm bars beneath. Motion communicates state (calm / warm pulse
 * / warning emphasis), then gets out of the way of the data.
 */
export function AttendanceSummary({
  subjects,
  loading,
  error,
  onRetry,
  showOverall = true,
  showViewAll = true,
}: AttendanceSummaryProps) {
  const reduceMotion = useReducedMotion();
  const overall = showOverall && subjects.length > 0 ? overallOf(subjects) : null;

  return (
    <Panel
      title="Attendance"
      description={overall ? undefined : `Subject-wise · threshold ${THRESHOLD}%`}
      flush
      action={
        showViewAll ? (
          <Link
            href="/student/attendance"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : subjects.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="No attendance data yet"
          description="Your subject-wise attendance will appear once classes begin."
        />
      ) : (
        <div className="p-5 pt-4">
          {overall ? (
            <div className="mb-5 flex items-center gap-5 border-b border-border pb-5">
              <RadialProgress
                value={overall.percent}
                tone={radialTone(overall.status)}
                threshold={THRESHOLD}
                size={96}
                stroke={7}
              >
                <span className="stat-number text-xl tabular">
                  {overall.percent.toFixed(1)}
                  <span className="text-[10px] text-muted-foreground">%</span>
                </span>
              </RadialProgress>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <span
                    aria-hidden="true"
                    className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT_CLASS[overall.status])}
                  />
                  Overall attendance
                </p>
                <p className="tabular mt-1 text-xs leading-relaxed text-muted-foreground">
                  {overall.attended} of {overall.total} sessions · threshold {THRESHOLD}%
                </p>
                <p
                  className={cn(
                    "mt-1.5 flex items-center gap-1.5 text-xs font-medium",
                    STATUS_TEXT_CLASS[overall.status],
                  )}
                >
                  {overall.status === "good"
                    ? "Comfortably above the requirement."
                    : overall.status === "warning"
                      ? "Borderline — attend the next few sessions."
                      : "Critical — please see your class advisor."}
                </p>
              </div>
            </div>
          ) : null}

          {/* Subject rhythm */}
          <ul className="divide-y divide-border">
            {subjects.map((subject, index) => (
              <motion.li
                key={subject.id}
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.06, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">
                    {subject.subject}
                    <span className="meta ml-1.5 text-muted-foreground">
                      {subject.code}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "tabular shrink-0 text-sm font-semibold",
                      STATUS_TEXT_CLASS[subject.status],
                    )}
                  >
                    {subject.percent.toFixed(1)}%
                  </p>
                </div>
                <Progress
                  value={subject.percent}
                  tone={statusTone(subject.status)}
                  threshold={THRESHOLD}
                  className="mt-1.5"
                />
                {subject.status !== "good" ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-warning">
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
                    {subject.status === "critical"
                      ? "Critically low — see your class advisor."
                      : "Below threshold — attend the next session."}
                  </p>
                ) : null}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
