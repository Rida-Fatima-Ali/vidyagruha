"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export type StatTone =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export interface StatTileItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  detail?: string;
  tone?: StatTone;
  icon?: LucideIcon;
}

const TILE_BG: Record<StatTone, string> = {
  neutral: "bg-surface-2",
  primary: "bg-primary/[0.08]",
  info: "bg-info/[0.08]",
  success: "bg-success/[0.08]",
  warning: "bg-warning/[0.08]",
  destructive: "bg-destructive/[0.08]",
};

const TILE_TEXT: Record<StatTone, string> = {
  neutral: "text-muted-foreground",
  primary: "text-primary",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const DOT: Record<StatTone, string> = {
  neutral: "bg-muted-foreground/60",
  primary: "bg-primary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const durationMs = reduceMotion ? 1 : duration;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, reduceMotion]);

  return value;
}

function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString("en-IN");
  }
  return rounded.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function StatTile({ item }: { item: StatTileItem }) {
  const value = useCountUp(item.value);
  const tone = item.tone ?? "neutral";
  const Icon = item.icon;

  return (
    <div className="card-surface card-hover-depth rounded-xl border border-border p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="kicker text-muted-foreground">{item.label}</p>
        {Icon ? (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/50",
              TILE_BG[tone],
              TILE_TEXT[tone],
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="stat-number mt-3 text-3xl tabular">
        {formatValue(value)}
        {item.suffix ? (
          <span className="ml-0.5 font-sans text-sm font-medium text-muted-foreground">
            {item.suffix}
          </span>
        ) : null}
      </p>
      {item.detail ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[tone])}
          />
          <span className="truncate">{item.detail}</span>
        </p>
      ) : null}
    </div>
  );
}

export interface StatTilesProps {
  items: StatTileItem[];
  className?: string;
}

export function StatTiles({ items, className }: StatTilesProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.06 * index,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <StatTile item={item} />
        </motion.div>
      ))}
    </div>
  );
}
