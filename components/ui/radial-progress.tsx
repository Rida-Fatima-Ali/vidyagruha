"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

export type RadialTone = "default" | "success" | "warning" | "destructive";

const TONE_STROKE: Record<RadialTone, string> = {
  default: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
};

export interface RadialProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Percentage between 0 and 100. */
  value: number;
  tone?: RadialTone;
  /** Optional marker (0–100) drawn as a tick — e.g. a 75% threshold. */
  threshold?: number;
  size?: number;
  stroke?: number;
  /** Rendered in the center of the ring. */
  children?: ReactNode;
}

/**
 * RadialProgress — a quiet health arc. It fills once on reveal,
 * then holds still and lets the figure speak.
 */
export function RadialProgress({
  value,
  tone = "default",
  threshold,
  size = 132,
  stroke = 9,
  children,
  className,
  ...props
}: RadialProgressProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="relative -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-surface-3"
          fill="none"
        />
        {/* Value arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={TONE_STROKE[tone]}
          fill="none"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - arc }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
        {/* Threshold tick */}
        {threshold != null ? (
          <line
            x1={
              size / 2 +
              (radius - stroke / 2) *
                Math.cos((threshold / 100) * 2 * Math.PI - Math.PI / 2)
            }
            y1={
              size / 2 +
              (radius - stroke / 2) *
                Math.sin((threshold / 100) * 2 * Math.PI - Math.PI / 2)
            }
            x2={
              size / 2 +
              (radius + stroke / 2 + 2) *
                Math.cos((threshold / 100) * 2 * Math.PI - Math.PI / 2)
            }
            y2={
              size / 2 +
              (radius + stroke / 2 + 2) *
                Math.sin((threshold / 100) * 2 * Math.PI - Math.PI / 2)
            }
            stroke="currentColor"
            className="text-muted-foreground/50"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
