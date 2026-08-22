"use client";

import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Info,
  Pin,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { cn } from "@/utils/cn";
import { formatShortDate, formatTime } from "@/utils/date";
import type {
  NoticeCategory,
  NoticeScope,
  StudentNotice,
} from "@/types/student";

const CATEGORY_CONFIG: Record<
  NoticeCategory,
  { label: string; icon: LucideIcon; kickerClass: string; washClass: string }
> = {
  important: {
    label: "Important",
    icon: TriangleAlert,
    kickerClass: "text-primary",
    washClass: "bg-primary/[0.07] text-primary ring-primary/20",
  },
  academic: {
    label: "Academic",
    icon: GraduationCap,
    kickerClass: "text-info",
    washClass: "bg-info/[0.06] text-info ring-info/20",
  },
  general: {
    label: "General",
    icon: Info,
    kickerClass: "text-muted-foreground",
    washClass: "bg-surface-2 text-muted-foreground ring-border",
  },
  event: {
    label: "Event",
    icon: Sparkles,
    kickerClass: "text-success",
    washClass: "bg-success/[0.07] text-success ring-success/20",
  },
};

const SCOPE_LABEL: Record<NoticeScope, string> = {
  institution: "Institution",
  department: "Department",
  class: "Class",
};

function sortNotices(notices: StudentNotice[]): StudentNotice[] {
  return [...notices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export interface NoticesListProps {
  notices: StudentNotice[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  categoryFilter?: NoticeCategory;
  limit?: number;
  showViewAll?: boolean;
}

/**
 * Notices read like a campus bulletin — the pinned announcement is a
 * featured fragment; the rest follow in an editorial column.
 */
export function NoticesList({
  notices,
  loading,
  error,
  onRetry,
  categoryFilter,
  limit,
  showViewAll = true,
}: NoticesListProps) {
  const filtered = categoryFilter
    ? notices.filter((notice) => notice.category === categoryFilter)
    : notices;
  const visible = sortNotices(filtered).slice(0, limit);

  return (
    <Panel
      title="Bulletin"
      description="Institution and department updates"
      flush
      action={
        showViewAll ? (
          <Link
            href="/student/notices"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="No notices here yet"
          description="Notices from the institution and your department will appear here."
        />
      ) : (
        <ul>
          {visible.map((notice) => {
            const config = CATEGORY_CONFIG[notice.category];
            const Icon = config.icon;
            const featured = notice.pinned;

            return (
              <li
                key={notice.id}
                className={cn(
                  "group relative px-5 py-4 transition-colors duration-200 hover:bg-surface-2/50",
                  featured && "border-b border-border bg-primary/[0.03]",
                  !featured && "border-b border-border last:border-b-0",
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Category mark */}
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                      config.washClass,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Editorial kicker row */}
                    <p className="flex items-center gap-2">
                      <span className={cn("kicker", config.kickerClass)}>
                        {config.label}
                      </span>
                      {notice.pinned ? (
                        <Pin className="h-3 w-3 text-primary" aria-label="Pinned notice" />
                      ) : null}
                      <span aria-hidden="true" className="h-px w-3 bg-border" />
                      <span className="tabular text-[11px] text-muted-foreground/70">
                        {SCOPE_LABEL[notice.scope]} · {formatShortDate(notice.date)}{" "}
                        {formatTime(notice.date)}
                      </span>
                    </p>

                    <p
                      className={cn(
                        "mt-1 font-medium tracking-tight",
                        featured ? "text-[15px]" : "text-sm",
                      )}
                    >
                      {notice.title}
                    </p>
                    {notice.body ? (
                      <p
                        className={cn(
                          "mt-0.5 leading-relaxed text-muted-foreground",
                          featured ? "line-clamp-2 text-[13px]" : "line-clamp-1 text-xs",
                        )}
                      >
                        {notice.body}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
