"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellRing,
  CheckCheck,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/utils/cn";
import type { NotificationCategory } from "@/types/notification";

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
  academic: "bg-primary/[0.1] text-primary",
  attendance: "bg-warning/[0.1] text-warning",
  assignment: "bg-info/[0.1] text-info",
  notice: "bg-surface-3/60 text-muted-foreground",
  event: "bg-success/[0.1] text-success",
  opportunity: "bg-primary/[0.1] text-primary",
  communication: "bg-info/[0.1] text-info",
  system: "bg-surface-3/60 text-muted-foreground",
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

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAllAsRead,
    refresh,
  } = useNotifications();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      void refresh();
    }
  }, [open, refresh]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Bell className="h-5 w-5" aria-hidden="true" />
        )}
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
          >
            {unreadCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border shadow-float"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <h2 className="font-heading text-sm font-semibold">Notifications</h2>
              {unreadCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => void markAllAsRead()}
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Mark all read
                </Button>
              ) : null}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-4" aria-busy="true">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-3/4" />
                </div>
              ) : error ? (
                <EmptyState
                  className="rounded-none border-0 py-10"
                  title="Couldn't load notifications"
                  description={error}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refresh()}
                  >
                    Try again
                  </Button>
                </EmptyState>
              ) : notifications.length === 0 ? (
                <EmptyState
                  className="rounded-none border-0 py-10"
                  title="You're all caught up"
                  description="New notifications will appear here."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((notification) => {
                    const Icon = CATEGORY_ICON[notification.category];
                    return (
                      <li
                        key={notification.id}
                        className="flex items-start gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-3/30"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/40",
                            notification.read
                              ? "bg-surface-3/40 text-muted-foreground"
                              : CATEGORY_TONE[notification.category],
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={
                              notification.read
                                ? "block text-sm text-muted-foreground"
                                : "block text-sm font-medium text-foreground"
                            }
                          >
                            {notification.title}
                          </span>
                          {notification.body ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {notification.body}
                            </span>
                          ) : null}
                          <span className="mt-1 block text-[11px] text-muted-foreground/60">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </span>
                        {!notification.read ? (
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
