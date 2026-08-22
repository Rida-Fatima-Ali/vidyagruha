import { apiClient, registerMock } from "./client";
import {
  getMockNotificationsForUser,
  markAllMockNotificationsRead,
} from "@/mocks/notifications";
import type { AuthUser, UserRole } from "@/types/auth";
import type { AppNotification } from "@/types/notification";

/**
 * Resolves the requesting user from query params. Role and id are enough to
 * scope mock content; display name comes from the auth session on the client.
 */
function userFromQuery(
  role: string | undefined,
  userId: string | undefined,
): AuthUser {
  const resolvedRole: UserRole =
    role === "faculty" || role === "admin" || role === "student" ? role : "student";
  return {
    id: userId ?? "stu-001",
    name: "",
    role: resolvedRole,
    email: "",
  };
}

registerMock("/api/notifications", (request) =>
  getMockNotificationsForUser(userFromQuery(request.query.role, request.query.userId)),
);
registerMock("/api/notifications/mark-all-read", (request) => {
  markAllMockNotificationsRead(
    userFromQuery(request.query.role, request.query.userId),
  );
  return { ok: true };
});

export const notificationService = {
  getMyNotifications: (user: AuthUser) =>
    apiClient.get<AppNotification[]>(
      `/api/notifications?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
    ),
  markAllAsRead: (user: AuthUser) =>
    apiClient.post<{ ok: boolean }>(
      `/api/notifications/mark-all-read?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
    ),
};
