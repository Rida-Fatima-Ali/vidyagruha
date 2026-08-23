import { ApiError, apiClient, registerMock } from "./client";
import { getMockFacultyDashboard } from "@/mocks/faculty";
import {
  addScheduleOverride,
  findScheduleOverride,
  removeScheduleOverride,
} from "@/mocks/schedule-overrides";
import {
  createAssignment,
  getAssignmentsForFaculty,
  getAssignmentOverviewStats,
  getSubmissionStats,
  getSubmissionsForAssignment,
  gradeSubmission,
} from "@/mocks/assignments";
import {
  clearSessionAttendance,
  getClassSnapshot,
  getSavedSessionById,
} from "@/mocks/attendance";
import {
  createMaterial,
  getFacultyMaterials,
} from "@/mocks/materials";
import { MOCK_USERS } from "@/mocks/users";
import {
  pushActivityNotification,
  removeActivityNotification,
} from "@/mocks/notifications";
import {
  effectiveScheduleForDate,
  facultyFor,
  lecturesForFaculty,
  subjectName,
} from "@/services/schedule";
import { formatDayLabel } from "@/utils/date";
import {
  atRiskForSubject,
  facultySessionsForDate,
  persistSession,
  studentRowsForSubject,
  trendForSubject,
} from "@/services/attendance";
import { DEMO_WEEK_START } from "@/constants/demo";
import type { AuthUser } from "@/types/auth";
import type {
  CreateScheduleOverrideInput,
  FacultyAssignment,
  FacultyAssignmentDraft,
  FacultyDashboardData,
  FacultyLectureOverview,
  FacultyMaterial,
  FacultyMaterialDraft,
  StudentsView,
} from "@/types/faculty";
import type { ScheduleChangeKind, ScheduleOverride } from "@/types/schedule";
import type {
  AttendanceSessionLite,
  ClassAttendanceSnapshot,
  SaveAttendancePayload,
  SessionAttendance,
} from "@/types/attendance";

/**
 * Prototype accounts — the demo runs a single faculty member (Varsha Kinge),
 * so the faculty endpoints resolve their identity from the mock user pool
 * instead of a real session. The `role`/`userId` query params are still passed
 * through so the wiring matches the backend contract.
 */

function demoFaculty(): AuthUser {
  return MOCK_USERS.faculty;
}

/** Faculty may only change lectures where they are the assigned instructor. */
function assertFacultyOwns(code: string, facultyName: string): void {
  if (facultyFor(code) !== facultyName) {
    throw new ApiError("You can only manage lectures assigned to you.", 403);
  }
}

function assertOwnedCode(code: string, facultyName: string): void {
  if (!getAssignmentsForFaculty(facultyName).some((a) => a.code === code)) {
    throw new ApiError("You can only publish for subjects you teach.", 403);
  }
}

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

registerMock("/api/faculty/dashboard", () => getMockFacultyDashboard());

registerMock("/api/faculty/lectures", (request) => {
  const user = demoFaculty();
  const weekStart = request.query.weekStart ?? DEMO_WEEK_START;
  return lecturesForFaculty(user.name, weekStart);
});

registerMock("/api/faculty/lectures/override", (request) => {
  const user = demoFaculty();
  const input = (request.body ?? {}) as CreateScheduleOverrideInput;
  if (!input.code || !input.date || !input.kind) {
    throw new ApiError("A lecture, date and change type are required.", 400);
  }
  assertFacultyOwns(input.code, user.name);
  const override = addScheduleOverride(input);
  const subject = subjectName(input.code) ?? input.code;
  pushActivityNotification({
    category: "academic",
    title: SCHEDULE_CHANGE_TITLE[input.kind](subject),
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
  return {
    ok: true,
    override,
    effectiveDay: effectiveScheduleForDate(input.date),
  };
});

registerMock("/api/faculty/lectures/override/remove", (request) => {
  const user = demoFaculty();
  const overrideId = (request.body as { overrideId?: string } | undefined)?.overrideId;
  if (!overrideId) {
    throw new ApiError("Missing override id.", 400);
  }
  const existing = findScheduleOverride(overrideId);
  if (!existing) {
    throw new ApiError("Schedule change not found.", 404);
  }
  assertFacultyOwns(existing.code, user.name);
  removeScheduleOverride(overrideId);
  pushActivityNotification({
    category: "academic",
    title: "Schedule change reverted",
    body: `${subjectName(existing.code) ?? existing.code} restored to the original timetable.`,
    audience: "all",
    priority: "normal",
    subjectCode: existing.code,
    dedupeKey: `override-${existing.id}-reverted`,
  });
  return { ok: true };
});

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

registerMock("/api/faculty/attendance/sessions", (request) => {
  const user = demoFaculty();
  const date = (request.query.date as string) ?? new Date().toISOString().slice(0, 10);
  return facultySessionsForDate(user.name, date);
});

registerMock("/api/faculty/attendance/session", (request) => {
  const id = request.query.id as string | undefined;
  const saved = id ? getSavedSessionById(id) : undefined;
  return saved ?? { marked: false };
});

registerMock("/api/faculty/attendance/save", (request) => {
  const user = demoFaculty();
  const payload = (request.body ?? {}) as SaveAttendancePayload;
  if (!payload.date || !payload.code || !payload.groupSlug || !Array.isArray(payload.records)) {
    throw new ApiError("A session and attendance records are required.", 400);
  }
  assertOwnedCode(payload.code, user.name);
  const session = getSessionMeta(payload);
  const result = persistSession(
    payload.date,
    payload.code,
    payload.groupSlug,
    payload.records,
    session.start,
    session.end,
    session.room,
  );
  pushActivityNotification({
    category: "attendance",
    title: `Attendance recorded — ${subjectName(payload.code)}`,
    body: `${payload.groupSlug.toUpperCase()} · ${payload.records.length} students marked`,
    audience: "students",
    priority: "normal",
    subjectCode: payload.code,
    dedupeKey: `att-${payload.date}-${payload.code}-${payload.groupSlug}`,
  });
  return {
    ...result,
    session: getSavedSessionById(result.id),
    snapshot: getClassSnapshot(payload.code, payload.groupSlug),
  };
});

/** Undo window: wipe the marking run, optionally restoring the prior one. */
registerMock("/api/faculty/attendance/undo", (request) => {
  const user = demoFaculty();
  const payload = (request.body ?? {}) as SaveAttendancePayload;
  if (!payload.date || !payload.code || !payload.groupSlug) {
    throw new ApiError("A session is required.", 400);
  }
  assertOwnedCode(payload.code, user.name);
  clearSessionAttendance(payload.date, payload.code, payload.groupSlug);
  removeActivityNotification(`att-${payload.date}-${payload.code}-${payload.groupSlug}`);

  if (Array.isArray(payload.records) && payload.records.length > 0) {
    const session = getSessionMeta(payload);
    const result = persistSession(
      payload.date,
      payload.code,
      payload.groupSlug,
      payload.records,
      session.start,
      session.end,
      session.room,
    );
    return {
      ...result,
      session: getSavedSessionById(result.id),
      snapshot: getClassSnapshot(payload.code, payload.groupSlug),
    };
  }

  return { cleared: true };
});

function getSessionMeta(payload: SaveAttendancePayload): {
  start: string;
  end: string;
  room: string;
} {
  const session = facultySessionsForDate(demoFaculty().name, payload.date).find(
    (s) => s.code === payload.code && s.groupSlug === payload.groupSlug,
  );
  return {
    start: session?.start ?? "13:00",
    end: session?.end ?? "14:40",
    room: session?.room ?? "",
  };
}

registerMock("/api/faculty/attendance/analytics", (request) => {
  const code = request.query.code as string | undefined;
  const group = request.query.group as string | undefined;
  if (!code) {
    throw new ApiError("A subject code is required.", 400);
  }
  return {
    snapshot: getClassSnapshot(code, group ?? "cmpn-a"),
    trend: trendForSubject(code),
    atRisk: atRiskForSubject(code, group),
    rows: studentRowsForSubject(code, group),
  };
});

/* ------------------------------------------------------------------ */
/* Assignments + submissions                                           */
/* ------------------------------------------------------------------ */

registerMock("/api/faculty/assignments", () => {
  const user = demoFaculty();
  return getAssignmentsForFaculty(user.name);
});

registerMock("/api/faculty/assignments/stats", () => {
  const user = demoFaculty();
  return getAssignmentOverviewStats(
    [...new Set(getAssignmentsForFaculty(user.name).map((a) => a.code))],
  );
});

registerMock("/api/faculty/assignments/create", (request) => {
  const user = demoFaculty();
  const input = (request.body ?? {}) as FacultyAssignmentDraft;
  if (!input.code || !input.title || !input.dueDate) {
    throw new ApiError("Subject, title and deadline are required.", 400);
  }
  assertOwnedCode(input.code, user.name);
  const assignment = createAssignment(input);
  pushActivityNotification({
    category: "assignment",
    title: `New assignment — ${assignment.title}`,
    body: `${assignment.subject} · due ${formatDayLabel(assignment.dueDate)}`,
    audience: "students",
    priority: "normal",
    subjectCode: assignment.code,
    dedupeKey: `assignment-${assignment.id}`,
  });
  return assignment;
});

registerMock("/api/faculty/submissions", (request) => {
  const assignmentId = request.query.assignmentId as string | undefined;
  if (!assignmentId) {
    throw new ApiError("An assignment is required.", 400);
  }
  const submissions = getSubmissionsForAssignment(assignmentId);
  const assignment = getAssignmentsForFaculty(demoFaculty().name).find(
    (a) => a.id === assignmentId,
  );
  if (!assignment) {
    throw new ApiError("Assignment not found.", 404);
  }
  return { assignment, stats: getSubmissionStats(assignmentId), submissions };
});

registerMock("/api/faculty/submissions/grade", (request) => {
  const body = (request.body ?? {}) as {
    submissionId?: string;
    grade?: number;
    feedback?: string;
  };
  if (!body.submissionId || typeof body.grade !== "number") {
    throw new ApiError("A submission and grade are required.", 400);
  }
  const graded = gradeSubmission(body.submissionId, body.grade, body.feedback);
  const gradedAssignment = getAssignmentsForFaculty(demoFaculty().name).find(
    (assignment) => assignment.id === graded.assignmentId,
  );
  pushActivityNotification({
    category: "assignment",
    title: `${graded.studentName}'s submission graded`,
    body: `"${gradedAssignment?.title ?? "Assignment"}" · scored ${graded.grade} marks`,
    audience: "students",
    priority: "normal",
    subjectCode: gradedAssignment?.code,
    dedupeKey: `grade-${graded.id}`,
  });
  return {
    ok: true,
    submission: graded,
    stats: getSubmissionStats(graded.assignmentId),
  };
});

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

registerMock("/api/faculty/materials", () => {
  const user = demoFaculty();
  return getFacultyMaterials(user.name);
});

registerMock("/api/faculty/materials/create", (request) => {
  const user = demoFaculty();
  const input = (request.body ?? {}) as FacultyMaterialDraft;
  if (!input.code || !input.title || !input.fileName) {
    throw new ApiError("Subject, title and file are required.", 400);
  }
  assertOwnedCode(input.code, user.name);
  const material = createMaterial(input, user.name);
  pushActivityNotification({
    category: "academic",
    title: `New study material — ${material.title}`,
    body: `${material.subject} · uploaded by ${material.uploadedBy}`,
    audience: "students",
    priority: "normal",
    subjectCode: material.code,
    dedupeKey: `material-${material.id}`,
  });
  return material;
});

/* ------------------------------------------------------------------ */
/* Students / risk                                                     */
/* ------------------------------------------------------------------ */

registerMock("/api/faculty/students", (request) => {
  const user = demoFaculty();
  const group = request.query.group as string | undefined;
  const codes = getAssignmentsForFaculty(user.name).map((a) => a.code);
  const subjectCodes = [...new Set(codes)];

  const view: StudentsView = {
    rows: [],
    atRiskCount: 0,
    below75Count: 0,
    missingAssignmentsCount: 0,
  };

  for (const code of subjectCodes) {
    for (const atRisk of atRiskForSubject(code, group)) {
      view.rows.push({
        studentId: atRisk.student.id,
        rollNo: atRisk.student.rollNo,
        name: atRisk.student.name,
        group: atRisk.student.group,
        code,
        subject: atRisk.subject,
        attendance: atRisk.percent,
        belowThreshold: atRisk.percent < atRisk.threshold,
        missingAssignments: atRisk.missingAssignments,
      });
      if (atRisk.percent < atRisk.threshold) view.below75Count += 1;
      if (atRisk.missingAssignments > 0) view.missingAssignmentsCount += 1;
    }
  }

  const uniqueStudents = new Map<string, StudentsView["rows"][number]>();
  for (const row of view.rows) uniqueStudents.set(row.studentId, row);
  view.rows = [...uniqueStudents.values()];
  view.atRiskCount = view.rows.filter(
    (row) => row.belowThreshold || row.missingAssignments > 0,
  ).length;
  return view;
});

export interface CreateOverrideResponse {
  ok: boolean;
  override: ScheduleOverride;
  effectiveDay: unknown;
}

export interface AttendanceSaveResponse {
  savedAt: string;
  id: string;
  session?: SessionAttendance;
  snapshot?: ClassAttendanceSnapshot;
}

export interface SubmissionGradeResponse {
  ok: boolean;
  submission: ReturnType<typeof gradeSubmission>;
  stats: ReturnType<typeof getSubmissionStats>;
}

export const facultyService = {
  getDashboard: () =>
    apiClient.get<FacultyDashboardData>("/api/faculty/dashboard"),

  getLectures: (user: AuthUser, weekStart?: string) =>
    apiClient.get<FacultyLectureOverview[]>(
      `/api/faculty/lectures?role=${user.role}&userId=${encodeURIComponent(user.id)}${
        weekStart ? `&weekStart=${weekStart}` : ""
      }`,
    ),

  createOverride: (user: AuthUser, input: CreateScheduleOverrideInput) =>
    apiClient.post<CreateOverrideResponse>(
      `/api/faculty/lectures/override?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      input,
    ),

  removeOverride: (user: AuthUser, overrideId: string) =>
    apiClient.post<{ ok: boolean }>(
      `/api/faculty/lectures/override/remove?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      { overrideId },
    ),

  /* Attendance */

  getSessions: (user: AuthUser, date: string) =>
    apiClient.get<AttendanceSessionLite[]>(
      `/api/faculty/attendance/sessions?role=${user.role}&userId=${encodeURIComponent(user.id)}&date=${date}`,
    ),

  getSession: (user: AuthUser, id: string) =>
    apiClient.get<SessionAttendance | { marked: false }>(
      `/api/faculty/attendance/session?role=${user.role}&userId=${encodeURIComponent(user.id)}&id=${id}`,
    ),

  saveAttendance: (user: AuthUser, payload: SaveAttendancePayload) =>
    apiClient.post<AttendanceSaveResponse>(
      `/api/faculty/attendance/save?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      payload,
    ),

  undoAttendance: (user: AuthUser, payload: SaveAttendancePayload) =>
    apiClient.post<AttendanceSaveResponse | { cleared: true }>(
      `/api/faculty/attendance/undo?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      payload,
    ),

  getAnalytics: (user: AuthUser, code: string, group?: string) =>
    apiClient.get<{
      snapshot: ClassAttendanceSnapshot;
      trend: { label: string; percent: number }[];
      atRisk: ReturnType<typeof atRiskForSubject>;
      rows: ReturnType<typeof studentRowsForSubject>;
    }>(
      `/api/faculty/attendance/analytics?role=${user.role}&userId=${encodeURIComponent(user.id)}&code=${code}&group=${group ?? ""}`,
    ),

  /* Assignments + submissions */

  getAssignments: (user: AuthUser) =>
    apiClient.get<FacultyAssignment[]>(
      `/api/faculty/assignments?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
    ),

  getAssignmentStats: (user: AuthUser) =>
    apiClient.get<ReturnType<typeof getAssignmentOverviewStats>>(
      `/api/faculty/assignments/stats?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
    ),

  createAssignment: (user: AuthUser, input: FacultyAssignmentDraft) =>
    apiClient.post<FacultyAssignment>(
      `/api/faculty/assignments/create?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      input,
    ),

  getSubmissions: (user: AuthUser, assignmentId: string) =>
    apiClient.get<{
      assignment: FacultyAssignment;
      stats: ReturnType<typeof getSubmissionStats>;
      submissions: ReturnType<typeof getSubmissionsForAssignment>;
    }>(
      `/api/faculty/submissions?role=${user.role}&userId=${encodeURIComponent(user.id)}&assignmentId=${assignmentId}`,
    ),

  gradeSubmission: (user: AuthUser, submissionId: string, grade: number, feedback?: string) =>
    apiClient.post<SubmissionGradeResponse>(
      `/api/faculty/submissions/grade?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      { submissionId, grade, feedback },
    ),

  /* Materials */

  getMaterials: (user: AuthUser) =>
    apiClient.get<FacultyMaterial[]>(
      `/api/faculty/materials?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
    ),

  createMaterial: (user: AuthUser, input: FacultyMaterialDraft) =>
    apiClient.post<FacultyMaterial>(
      `/api/faculty/materials/create?role=${user.role}&userId=${encodeURIComponent(user.id)}`,
      input,
    ),

  /* Students / risk */

  getStudents: (user: AuthUser, group?: string) =>
    apiClient.get<StudentsView>(
      `/api/faculty/students?role=${user.role}&userId=${encodeURIComponent(user.id)}${group ? `&group=${group}` : ""}`,
    ),
};
