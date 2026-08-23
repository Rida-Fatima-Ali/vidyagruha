"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { CountUp } from "@/components/ui/count-up";

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

const TILE_ICON_BG: Record<StatTone, string> = {
  neutral: "bg-surface-2 text-muted-foreground",
  primary: "bg-primary/[0.08] text-primary border border-primary/20",
  info: "bg-info/[0.08] text-info border border-info/20",
  success: "bg-success/[0.08] text-success border border-success/20",
  warning: "bg-warning/[0.08] text-warning border border-warning/20",
  destructive: "bg-destructive/[0.08] text-destructive border border-destructive/20",
};

function StatTile({ item }: { item: StatTileItem }) {
  const tone = item.tone ?? "neutral";
  const Icon = item.icon;

  return (
    <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {item.label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200",
              TILE_ICON_BG[tone]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-baseline gap-1 tabular">
          <CountUp to={item.value} duration={1.2} />
          {item.suffix && (
            <span className="text-xl font-normal text-muted-foreground">{item.suffix}</span>
          )}
        </p>
        {item.detail && (
          <p className="mt-2 text-xs font-medium text-muted-foreground leading-normal">
            {item.detail}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatTiles({
  items,
  columns = 4,
  className = "",
}: {
  items: StatTileItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section aria-label="Key statistics" className={className}>
      <div className={cn("grid gap-4 sm:gap-5", colClass)}>
        {items.map((item) => (
          <StatTile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
