import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const TONES = [
  "bg-primary/12 text-primary",
  "bg-info/12 text-info",
  "bg-success/12 text-success",
  "bg-warning/12 text-warning",
  "bg-destructive/12 text-destructive",
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toneFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return TONES[Math.abs(hash) % TONES.length];
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold shadow-inset-highlight ring-1 ring-inset ring-border/50 transition-transform duration-200",
        sizes[size],
        toneFor(name),
        className,
      )}
      {...props}
    >
      {initialsOf(name)}
    </span>
  );
}
