import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/utils/cn";

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
          compact ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <GraduationCap
          className={cn("relative", compact ? "h-4 w-4" : "h-[18px] w-[18px]")}
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          "font-heading font-semibold tracking-tight",
          compact ? "text-base" : "text-lg",
        )}
      >
        {APP_NAME}
      </span>
    </div>
  );
}
