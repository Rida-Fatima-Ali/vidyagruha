import { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const variants = {
  default:
    "bg-primary/[0.08] text-primary ring-1 ring-inset ring-primary/20",
  secondary:
    "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  outline: "ring-1 ring-inset ring-border/70 text-muted-foreground",
  success:
    "bg-success/10 text-success ring-1 ring-inset ring-success/25",
  warning:
    "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
  destructive:
    "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
  info: "bg-info/10 text-info ring-1 ring-inset ring-info/25",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-4",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
