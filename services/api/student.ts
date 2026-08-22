import { ApiError, apiClient, registerMock } from "./client";
import {
  getMockAssignments,
  getMockAttendance,
  getMockDashboard,
  getMockEvents,
  getMockMaterials,
  getMockNotices,
  getMockSchedule,
  DEMO_STUDENT_ID,
} from "@/mocks/student";
import { submitAssignment } from "@/mocks/assignments";
import { pushActivityNotification } from "@/mocks/notifications";
import { subjectName } from "@/services/schedule";
import type {
  ScheduleSlot,
  StudentAssignment,
  StudentDashboardData,
  StudentEvent,
  StudentNotice,
  StudyMaterial,
  SubjectAttendance,
} from "@/types/student";

registerMock("/api/student/dashboard", () => getMockDashboard());
registerMock("/api/student/schedule", () => getMockSchedule());
registerMock("/api/student/attendance", () => getMockAttendance());
registerMock("/api/student/assignments", () => getMockAssignments());
registerMock("/api/student/materials", () => getMockMaterials());
registerMock("/api/student/notices", () => getMockNotices());
registerMock("/api/student/events", () => getMockEvents());

registerMock("/api/student/assignments/submit", (request) => {
  const body = (request.body ?? {}) as { assignmentId?: string };
  if (!body.assignmentId) {
    throw new ApiError("An assignment is required.", 400);
  }
  const assignment = getMockAssignments().find((item) => item.id === body.assignmentId);
  if (!assignment) {
    throw new ApiError("Assignment not found.", 404);
  }
  if (assignment.status === "submitted" || assignment.status === "graded") {
    throw new ApiError("This assignment is already submitted.", 409);
  }
  const submission = submitAssignment(body.assignmentId, DEMO_STUDENT_ID);
  pushActivityNotification({
    category: "assignment",
    title: `New submission — ${assignment.title}`,
    body: `${assignment.subject} · ${subjectName(assignment.code) ?? assignment.subject}`,
    audience: "faculty",
    priority: "normal",
    subjectCode: assignment.code,
  });
  return { ok: true, submission };
});

export const studentService = {
  getDashboard: () =>
    apiClient.get<StudentDashboardData>("/api/student/dashboard"),
  getSchedule: () =>
    apiClient.get<ScheduleSlot[]>("/api/student/schedule"),
  getAttendance: () =>
    apiClient.get<SubjectAttendance[]>("/api/student/attendance"),
  getAssignments: () =>
    apiClient.get<StudentAssignment[]>("/api/student/assignments"),
  getMaterials: () =>
    apiClient.get<StudyMaterial[]>("/api/student/materials"),
  getNotices: () =>
    apiClient.get<StudentNotice[]>("/api/student/notices"),
  getEvents: () =>
    apiClient.get<StudentEvent[]>("/api/student/events"),
  submitAssignment: (assignmentId: string) =>
    apiClient.post<{ ok: boolean }>("/api/student/assignments/submit", {
      assignmentId,
    }),
};
