"use client";

import { TrendingUp } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";
import type { AttendanceTrendPoint, ClassAttendanceSnapshot } from "@/types/attendance";

export interface AttendanceAnalyticsProps {
  snapshot: ClassAttendanceSnapshot | null;
  trend: AttendanceTrendPoint[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/** Compact, honest class analytics — snapshot, trend bars, and status counts. */
export function AttendanceAnalytics({
  snapshot,
  trend,
  loading,
  error,
  onRetry,
}: AttendanceAnalyticsProps) {
  return (
    <Panel
      title="Class analytics"
      description="Latest recorded session"
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-2 w-full animate-pulse rounded bg-surface-2" />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState className="border-0 py-8" onRetry={onRetry} description={error} />
      ) : !snapshot ? (
        <p className="text-sm text-muted-foreground">
          Analytics appear after the first session is recorded.
        </p>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Class attendance
              </p>
              <p className="tabular font-heading text-2xl font-bold tracking-tight">
                {snapshot.percent}%
              </p>
            </div>
            <Progress
              value={snapshot.percent}
              tone={snapshot.percent >= 80 ? "success" : snapshot.percent >= 75 ? "warning" : "destructive"}
              className="mt-2 h-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatChip label="Present" value={snapshot.present} tone="success" />
            <StatChip label="Late" value={snapshot.late} tone="warning" />
            <StatChip label="Absent" value={snapshot.absent} tone="destructive" />
          </div>

          {trend.length > 0 ? (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                Last {trend.length} sessions
              </p>
              <div className="mt-3 flex h-16 items-end gap-2">
                {trend.map((point) => (
                  <div key={point.label} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-[height] duration-500",
                        point.percent >= 80
                          ? "bg-success/70"
                          : point.percent >= 75
                            ? "bg-warning/70"
                            : "bg-destructive/70",
                      )}
                      style={{ height: `${Math.max(10, point.percent)}%` }}
                      title={`${point.percent}%`}
                    />
                    <span className="tabular text-[10px] text-muted-foreground">
                      {point.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "destructive";
}) {
  const tones = {
    success: "text-success bg-success/10 ring-success/30",
    warning: "text-warning bg-warning/10 ring-warning/30",
    destructive: "text-destructive bg-destructive/10 ring-destructive/30",
  } as const;
  return (
    <div className={cn("rounded-xl px-3 py-2.5 text-center ring-1 ring-inset", tones[tone])}>
      <p className="tabular font-heading text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
