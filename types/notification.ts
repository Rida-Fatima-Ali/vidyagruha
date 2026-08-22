export type NotificationCategory =
  | "academic"
  | "attendance"
  | "assignment"
  | "notice"
  | "event"
  | "opportunity"
  | "communication"
  | "system";

export type NotificationPriority = "low" | "normal" | "high";

/** Which prototype role a runtime activity notification reaches. */
export type NotificationAudience = "students" | "faculty" | "admin" | "all";

export interface ActivityNotificationInput {
  category: NotificationCategory;
  title: string;
  body?: string;
  /** "all" (default) reaches every role; otherwise only that audience. */
  audience?: NotificationAudience;
  priority: NotificationPriority;
  /** When the notification concerns an academic subject. */
  subjectCode?: string;
  /** Stable key so repeat events refresh instead of duplicating. */
  dedupeKey?: string;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  /** ISO timestamp */
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  /** When the notification concerns an academic subject. */
  subjectCode?: string;
  /** Present on runtime activity notifications (used for role filtering). */
  audience?: NotificationAudience;
}
