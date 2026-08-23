import { apiClient, ApiError, registerMock } from "./client";
import {
  decideAdminApproval,
  getAdminApprovals,
  getAdminClasses,
  getAdminFaculty,
  getAdminRooms,
  getAdminStudents,
  getAdminSubjects,
  getAdminUsers,
  MOCK_ADMIN_DASHBOARD,
} from "@/mocks/admin";
import {
  getAllEvents,
  getAllNotices,
  saveEvent,
  saveNotice,
  setNoticeStatus,
} from "@/mocks/notices-events";
import {
  addScheduleOverride,
  findScheduleOverride,
  removeScheduleOverride,
} from "@/mocks/schedule-overrides";
import {
  adminAnalytics,
  adminScheduleView,
  attendanceRisk,
  institutionalActivity,
  roomRadar,
} from "@/services/admin";
import { subjectName } from "@/services/schedule";
import { orgTree } from "@/services/audience";
import { pushActivityNotification } from "@/mocks/notifications";
import { formatDayLabel } from "@/utils/date";
import { DEMO_WEEK_START } from "@/constants/demo";
import type {
  AdminAnalyticsData,
  AdminClass,
  AdminDashboardData,
  AdminEvent,
  AdminEventDraft,
  AdminFaculty,
  AdminNotice,
  AdminNoticeAudience,
  AdminNoticeDraft,
  AdminNoticeStatus,
  AdminRoom,
  AdminScheduleView,
  AdminStudent,
  AdminSubject,
  AdminUser,
  ApprovalDecision,
  AttendanceRiskView,
  InstitutionalActivity,
  PendingApproval,
  RoomRadarView,
} from "@/types/admin";
import type { CreateScheduleOverrideInput } from "@/types/faculty";
import type { OrgNode } from "@/types/org";
import type { ScheduleChangeKind, ScheduleOverride } from "@/types/schedule";

/**
 * Admin endpoints resolve against the shared mock stores directly (no identity
 * param needed — the prototype runs a single administrator account). Schedule
 * mutations deliberately skip the faculty ownership check: an administrator
 * may manage any lecture.
 */

registerMock("/api/admin/dashboard", () => MOCK_ADMIN_DASHBOARD);

const SCHEDULE_CHANGE_TITLE: Record<
  ScheduleChangeKind,
  (subject: string) => string
> = {
  cancelled: (subject) => `${subject} — class cancelled`,
  rescheduled: (subject) => `${subject} — rescheduled`,
  swapped: (subject) => `${subject} — time swapped`,
  extra: (subject) => `${subject} — extra lecture added`,
  room_changed: (subject) => `${subject} — room changed`,
  faculty_changed: (subject) => `${subject} — faculty changed`,
};

function audienceForNotice(audience: AdminNoticeAudience): "students" | "faculty" | "all" {
  if (audience === "students") return "students";
  if (audience === "faculty") return "faculty";
  if (audience === "class") return "students";
  return "all";
}

registerMock("/api/admin/users", () => getAdminUsers());

registerMock("/api/admin/students", (request) =>
  getAdminStudents(request.query.group),
);

registerMock("/api/admin/faculty", () => getAdminFaculty());

registerMock("/api/admin/classes", () => getAdminClasses());

registerMock("/api/admin/subjects", () => getAdminSubjects());

registerMock("/api/admin/rooms", () => getAdminRooms());

registerMock("/api/admin/rooms/radar", (request) => {
  const weekStart = request.query.weekStart ?? DEMO_WEEK_START;
  const days = Number(request.query.days ?? 6);
  return roomRadar(weekStart, days);
});

registerMock("/api/admin/org-tree", () => orgTree());

registerMock("/api/admin/schedule", (request) => {
  const start = request.query.start ?? "2026-08-10";
  const days = Number(request.query.days ?? 7);
  return adminScheduleView(start, days);
});

registerMock("/api/admin/schedule/override", (request) => {
  const input = (request.body ?? {}) as CreateScheduleOverrideInput;
  if (!input.code || !input.date || !input.kind) {
    throw new ApiError("A lecture, date and change type are required.", 400);
  }
  const override = addScheduleOverride(input);
  pushActivityNotification({
    category: "academic",
    title: SCHEDULE_CHANGE_TITLE[input.kind](subjectName(input.code) ?? input.code),
    body: `${formatDayLabel(input.date)} · ${input.reason ?? "Schedule updated"}`.replace(
      /\s·\s$/,
      "",
    ),
    audience: "all",
    priority:
      input.kind === "cancelled" || input.kind === "rescheduled" ? "high" : "normal",
    subjectCode: input.code,
    dedupeKey: `override-${override.id}`,
  });
  return { ok: true, override };
});

registerMock("/api/admin/schedule/override/remove", (request) => {
  const overrideId = (request.body as { overrideId?: string } | undefined)?.overrideId;
  if (!overrideId) {
    throw new ApiError("Missing override id.", 400);
  }
  const existing = findScheduleOverride(overrideId);
  if (existing) {
    pushActivityNotification({
      category: "academic",
      title: "Schedule change reverted",
      body: `${subjectName(existing.code) ?? existing.code} restored to the original timetable.`,
      audience: "all",
      priority: "normal",
      subjectCode: existing.code,
      dedupeKey: `override-${existing.id}-reverted`,
    });
  }
  return { ok: removeScheduleOverride(overrideId) };
});

registerMock("/api/admin/notices", () => getAllNotices());

registerMock("/api/admin/notices/save", (request) => {
  const draft = (request.body ?? {}) as AdminNoticeDraft;
  if (!draft.title?.trim()) {
    throw new ApiError("A notice title is required.", 400);
  }
  const previouslyPublished = draft.id
    ? getAllNotices().find((notice) => notice.id === draft.id)?.status === "published"
    : false;
  const saved = saveNotice(draft);
  if (saved.status === "published" && !previouslyPublished) {
    pushActivityNotification({
      category: "notice",
      title: `Notice published — ${saved.title}`,
      body: `${saved.category} · ${saved.audience} audience`,
      audience: audienceForNotice(saved.audience),
      priority: saved.priority === "high" ? "high" : "normal",
      dedupeKey: `notice-${saved.id}`,
    });
  }
  return saved;
});

registerMock("/api/admin/notices/status", (request) => {
  const body = (request.body ?? {}) as {
    id?: string;
    status?: AdminNoticeStatus;
  };
  if (!body.id || !body.status) {
    throw new ApiError("Notice id and status are required.", 400);
  }
  const updated = setNoticeStatus(body.id, body.status);
  if (!updated) throw new ApiError("Notice not found.", 404);
  if (body.status === "published") {
    pushActivityNotification({
      category: "notice",
      title: `Notice published — ${updated.title}`,
      body: `${updated.category} · ${updated.audience} audience`,
      audience: audienceForNotice(updated.audience),
      priority: updated.priority === "high" ? "high" : "normal",
      dedupeKey: `notice-${updated.id}`,
    });
  }
  return updated;
});

registerMock("/api/admin/events", () => getAllEvents());

registerMock("/api/admin/events/save", (request) => {
  const draft = (request.body ?? {}) as AdminEventDraft;
  if (!draft.title?.trim()) {
    throw new ApiError("An event title is required.", 400);
  }
  const created = !draft.id;
  const saved = saveEvent(draft);
  if (created) {
    pushActivityNotification({
      category: "event",
      title: `New event — ${saved.title}`,
      body: `${formatDayLabel(saved.date)} · ${saved.location}`,
      audience: audienceForNotice(saved.audience ?? "institution"),
      priority: "normal",
      dedupeKey: `event-${saved.id}`,
    });
  }
  return saved;
});

registerMock("/api/admin/approvals", () => getAdminApprovals());

registerMock("/api/admin/approvals/decide", (request) => {
  const body = (request.body ?? {}) as { id?: string; decision?: ApprovalDecision };
  if (!body.id || !body.decision) {
    throw new ApiError("Approval id and decision are required.", 400);
  }
  const resolved = decideAdminApproval(body.id, body.decision);
  if (!resolved) throw new ApiError("Approval not found.", 404);
  return resolved;
});

registerMock("/api/admin/analytics", () => adminAnalytics());

registerMock("/api/admin/risk", () => attendanceRisk());

registerMock("/api/admin/activity", () => institutionalActivity());

export const adminService = {
  getDashboard: () =>
    apiClient.get<AdminDashboardData>("/api/admin/dashboard"),

  getUsers: () => apiClient.get<AdminUser[]>("/api/admin/users"),

  getStudents: (group?: string) =>
    apiClient.get<AdminStudent[]>(
      `/api/admin/students${group ? `?group=${group}` : ""}`,
    ),

  getFaculty: () => apiClient.get<AdminFaculty[]>("/api/admin/faculty"),

  getClasses: () => apiClient.get<AdminClass[]>("/api/admin/classes"),

  getSubjects: () => apiClient.get<AdminSubject[]>("/api/admin/subjects"),

  getRooms: () => apiClient.get<AdminRoom[]>("/api/admin/rooms"),

  getRoomRadar: (weekStart: string, days = 6) =>
    apiClient.get<RoomRadarView>(
      `/api/admin/rooms/radar?weekStart=${weekStart}&days=${days}`,
    ),

  getOrgTree: () => apiClient.get<OrgNode>("/api/admin/org-tree"),

  getSchedule: (start: string, days: number) =>
    apiClient.get<AdminScheduleView>(`/api/admin/schedule?start=${start}&days=${days}`),

  createScheduleOverride: (input: CreateScheduleOverrideInput) =>
    apiClient.post<{ ok: boolean; override: ScheduleOverride }>(
      "/api/admin/schedule/override",
      input,
    ),

  removeScheduleOverride: (overrideId: string) =>
    apiClient.post<{ ok: boolean }>("/api/admin/schedule/override/remove", {
      overrideId,
    }),

  getNotices: () => apiClient.get<AdminNotice[]>("/api/admin/notices"),

  saveNotice: (draft: AdminNoticeDraft) =>
    apiClient.post<AdminNotice>("/api/admin/notices/save", draft),

  setNoticeStatus: (id: string, status: AdminNoticeStatus) =>
    apiClient.post<AdminNotice>("/api/admin/notices/status", { id, status }),

  getEvents: () => apiClient.get<AdminEvent[]>("/api/admin/events"),

  saveEvent: (draft: AdminEventDraft) =>
    apiClient.post<AdminEvent>("/api/admin/events/save", draft),

  getApprovals: () =>
    apiClient.get<{ pending: PendingApproval[]; resolved: PendingApproval[] }>(
      "/api/admin/approvals",
    ),

  decideApproval: (id: string, decision: ApprovalDecision) =>
    apiClient.post<PendingApproval>("/api/admin/approvals/decide", { id, decision }),

  getAnalytics: () => apiClient.get<AdminAnalyticsData>("/api/admin/analytics"),

  getRisk: () => apiClient.get<AttendanceRiskView>("/api/admin/risk"),

  getActivity: () => apiClient.get<InstitutionalActivity[]>("/api/admin/activity"),
};
