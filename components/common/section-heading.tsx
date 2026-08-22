import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-4 gap-y-1.5", className)}>
      <div>
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
