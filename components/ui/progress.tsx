import { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type ProgressTone = "default" | "success" | "warning" | "destructive";

const toneClasses: Record<ProgressTone, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Percentage between 0 and 100. */
  value: number;
  tone?: ProgressTone;
  /** Optional marker position (0–100) drawn as a tick on the track. */
  threshold?: number;
}

export function Progress({
  value,
  tone = "default",
  threshold,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const tick = threshold != null ? Math.min(100, Math.max(0, threshold)) : null;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-spatial",
          toneClasses[tone],
        )}
        style={{ width: `${clamped}%` }}
      />
      {tick != null ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-px -translate-x-1/2 bg-foreground/25"
          style={{ left: `${tick}%` }}
        />
      ) : null}
    </div>
  );
}
