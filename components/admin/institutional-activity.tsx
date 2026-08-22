"use client";

import { useMemo } from "react";
import {
  BookOpen,
  CalendarClock,
  CalendarHeart,
  CheckCircle2,
  Megaphone,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useAdminActivity } from "@/hooks/use-admin";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { ActivityKind, InstitutionalActivity } from "@/types/admin";

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  schedule: CalendarClock,
  approval: UserCheck,
  notice: Megaphone,
  event: CalendarHeart,
  attendance: CheckCircle2,
  academic: BookOpen,
};

const TONE_STYLES: Record<InstitutionalActivity["tone"], string> = {
  info: "bg-info/10 text-info ring-info/25",
  success: "bg-success/10 text-success ring-success/25",
  warning: "bg-warning/10 text-warning ring-warning/25",
  destructive: "bg-destructive/10 text-destructive ring-destructive/25",
  neutral: "bg-surface-2 text-muted-foreground ring-border/60",
};

export interface InstitutionalActivityProps {
  limit?: number;
}

export function InstitutionalActivity({ limit }: InstitutionalActivityProps) {
  const { data, loading, error, refresh } = useAdminActivity();
  const items = useMemo(() => (data ?? []).slice(0, limit), [data, limit]);

  return (
    <Panel
      title="Institutional activity"
      description="Latest campus movements"
      flush
    >
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={() => void refresh()} description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="Nothing yet"
          description="Recent schedule changes, approvals and notices will appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const Icon = KIND_ICON[item.kind];
            return (
              <li key={item.id} className="flex items-start gap-3.5 px-5 py-3.5">
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                    TONE_STYLES[item.tone],
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
