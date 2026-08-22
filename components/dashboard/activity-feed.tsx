"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CircleAlert,
  ClipboardList,
  GraduationCap,
  Megaphone,
  MessagesSquare,
  Rocket,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import type { NotificationCategory, NotificationPriority } from "@/types/notification";
import { cn } from "@/utils/cn";

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  academic: GraduationCap,
  attendance: CircleAlert,
  assignment: ClipboardList,
  notice: Megaphone,
  event: Sparkles,
  opportunity: Rocket,
  communication: MessagesSquare,
  system: Wrench,
};

const CATEGORY_TONE: Record<NotificationCategory, string> = {
  academic: "bg-primary/15 text-primary",
  attendance: "bg-warning/15 text-warning",
  assignment: "bg-info/15 text-info",
  notice: "bg-surface-2 text-muted-foreground",
  event: "bg-success/15 text-success",
  opportunity: "bg-primary/15 text-primary",
  communication: "bg-info/15 text-info",
  system: "bg-surface-2 text-muted-foreground",
};

const PRIORITY_LABEL: Record<NotificationPriority, string> = {
  high: "High",
  normal: "Normal",
  low: "Low",
};

function formatRelativeTime(iso: string): string {
  const seconds = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(iso),
  );
}

export function ActivityFeed() {
  const { notifications, loading, error, unreadCount } = useNotifications();
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="latest-updates-heading"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2
          id="latest-updates-heading"
          className="font-heading text-sm font-semibold tracking-tight"
        >
          Latest updates
        </h2>
        {unreadCount > 0 ? (
          <Badge variant="info">{unreadCount} unread</Badge>
        ) : null}
      </div>

      <div>
        {loading ? (
          <div className="space-y-3 p-5" aria-busy="true">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-3/4" />
          </div>
        ) : error ? (
          <EmptyState
            className="rounded-none border-0 py-10"
            title="Couldn't load updates"
            description={error}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            className="rounded-none border-0 py-10"
            title="You're all caught up"
            description="New campus updates will appear here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.slice(0, 4).map((notification) => {
              const Icon = CATEGORY_ICON[notification.category];
              return (
                <li
                  key={notification.id}
                  className="flex items-start gap-3.5 px-5 py-3.5 transition-colors duration-150 hover:bg-surface-2/40"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      notification.read
                        ? "bg-surface-2 text-muted-foreground"
                        : CATEGORY_TONE[notification.category],
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm",
                        notification.read ? "text-muted-foreground" : "font-medium",
                      )}
                    >
                      {notification.title}
                    </span>
                    {notification.body ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                    ) : null}
                    <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground/70">
                      <span className="inline-flex items-center gap-1.5">
                        {!notification.read ? (
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        ) : null}
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                      {notification.priority === "high" ? (
                        <Badge variant="destructive">High</Badge>
                      ) : null}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    {notification.priority === "high" ? null : (
                      <Badge variant="outline">{PRIORITY_LABEL[notification.priority]}</Badge>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
