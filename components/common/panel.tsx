import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface PanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Removes the default padding on the body (for lists/tables). */
  flush?: boolean;
  className?: string;
}

export function Panel({
  title,
  description,
  action,
  children,
  flush = false,
  className,
}: PanelProps) {
  return (
    <section
      className={cn(
        "card-surface overflow-hidden rounded-xl border border-border text-card-foreground shadow-card",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-border/80 px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={flush ? undefined : "p-5"}>{children}</div>
    </section>
  );
}
