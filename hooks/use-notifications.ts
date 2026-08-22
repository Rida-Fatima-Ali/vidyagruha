"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationService } from "@/services/api/notifications";
import { useAuth } from "@/hooks/use-auth";
import type { AppNotification } from "@/types/notification";

export interface UseNotificationsResult {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { user, ready } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !ready) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getMyNotifications(user);
      setNotifications(data);
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, ready]);

  useEffect(() => {
    if (!user || !ready) return;
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh, user, ready]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user);
      await refresh();
    } catch {
      setError("Unable to update notifications. Please try again.");
    }
  }, [refresh, user]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return { notifications, loading, error, unreadCount, markAllAsRead, refresh };
}
