"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const reduceMotion = useReducedMotion();
  const layoutId = useId();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border bg-surface-2/60 p-0.5 shadow-[inset_0_1px_3px_rgb(0_0_0/0.06)]",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && !reduceMotion ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 480, damping: 38 }}
                className="absolute inset-0 rounded-lg card-surface border border-border shadow-inset-highlight shadow-card"
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "tabular relative z-10 rounded-full px-1.5 py-0.5 text-[11px] leading-none",
                  isActive
                    ? "bg-surface-3/60 text-muted-foreground"
                    : "bg-surface-3/30 text-muted-foreground",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
