import { ACADEMIC_SUBJECTS } from "@/mocks/academic";
import { SCHEDULE_OVERRIDES } from "@/mocks/schedule-overrides";
import {
  getSavedSessionsForCode,
  studentsBelowThreshold,
  studentsForSubject,
} from "@/mocks/attendance";
import {
  countMissingForStudent,
  getAllAssignments,
  getAssignmentOverviewStats,
  getSubmissionStats,
  getSubmissionsForAssignment,
} from "@/mocks/assignments";
import { getStudentMaterials } from "@/mocks/materials";
import { getAdminApprovals, getAdminRooms, MOCK_ADMIN_DASHBOARD } from "@/mocks/admin";
import { getAllEvents, getAllNotices } from "@/mocks/notices-events";
import { effectiveScheduleForDate, overridesForDate, subjectName } from "@/services/schedule";
import { DEMO_WEEK_START } from "@/constants/demo";
import { formatDayLabel, formatShortDate, weekDates } from "@/utils/date";
import type { ScheduleChangeKind, ScheduleOverride } from "@/types/schedule";
import type {
  AcademicAnalytics,
  AdminAnalyticsData,
  AdminScheduleSlot,
  AdminScheduleView,
  AttendanceRiskView,
  ConflictType,
  InstitutionalActivity,
  RadarCell,
  RadarDay,
  RiskStudentRow,
  RoomRadarView,
  ScheduleAnalytics,
  ScheduleConflict,
  SubjectAttendanceStat,
} from "@/types/admin";

/**
 * Admin views are computed from the shared stores so an admin, faculty member
 * and student always see the same institution. Nothing here duplicates the
 * timetable, subjects, faculty or attendance data.
 */

/* ------------------------------------------------------------------ */
/* Schedule overview + conflicts                                       */
/* ------------------------------------------------------------------ */

const GROUP_LABEL = "CMPN-A · Sem 3";

/** Effective schedule for one day as an admin slot (every subject). */
export function adminScheduleForDate(dateISO: string): AdminScheduleSlot[] {
  const overrideByCode = new Map(overridesForDate(dateISO).map((o) => [o.code, o]));
  const movedIn = SCHEDULE_OVERRIDES.filter(
    (o) => o.kind === "rescheduled" && o.toDate === dateISO,
  );

  return effectiveScheduleForDate(dateISO).map((slot) => {
    let overrideId: string | undefined;
    if (slot.adjustment) {
      overrideId =
        overrideByCode.get(slot.code)?.id ?? movedIn.find((m) => m.code === slot.code)?.id;
    }
    return {
      id: slot.id,
      date: dateISO,
      subject: slot.subject,
      code: slot.code,
      faculty: slot.faculty,
      room: slot.room,
      start: slot.start,
      end: slot.end,
      type: slot.type,
      group: GROUP_LABEL,
      status: slot.adjustment?.kind ?? "normal",
      adjustment: slot.adjustment,
      overrideId,
    };
  });
}

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && startB < endA;
}

function activeSlot(slot: AdminScheduleSlot): boolean {
  return slot.status !== "cancelled";
}

/** Double-booking detection for a date — by room and by faculty. */
export function conflictsForDate(dateISO: string): ScheduleConflict[] {
  const slots = adminScheduleForDate(dateISO).filter(activeSlot);
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      const left = slots[i];
      const right = slots[j];
      if (!overlaps(left.start, left.end, right.start, right.end)) continue;

      if (left.room && left.room === right.room) {
        conflicts.push(makeConflict(left, right, "room"));
      }
      if (left.faculty && left.faculty === right.faculty) {
        conflicts.push(makeConflict(left, right, "faculty"));
      }
    }
  }
  return conflicts;
}

function makeConflict(
  left: AdminScheduleSlot,
  right: AdminScheduleSlot,
  type: ConflictType,
): ScheduleConflict {
  const base = {
    date: left.date,
    type,
    subject: left.subject,
    code: left.code,
    start: left.start,
    end: left.end,
    room: left.room,
    faculty: left.faculty,
  };
  const clash = {
    subject: right.subject,
    code: right.code,
    start: right.start,
    end: right.end,
    room: right.room,
    faculty: right.faculty,
  };
  const label = type === "room" ? "room" : "faculty";
  return {
    id: `conflict-${left.date}-${label}-${left.code}-${right.code}`,
    ...base,
    clashesWith: [clash],
  };
}

/** The effective schedule + conflicts across a range of dates. */
export function adminScheduleView(startISO: string, days: number): AdminScheduleView {
  const slots: AdminScheduleSlot[] = [];
  const conflicts: ScheduleConflict[] = [];
  for (const date of weekDates(startISO, days)) {
    slots.push(...adminScheduleForDate(date));
    conflicts.push(...conflictsForDate(date));
  }
  return { slots, conflicts };
}

export interface ProposedSlotConflict {
  type: ConflictType;
  subject: string;
  code: string;
  start: string;
  end: string;
  room: string;
  faculty: string;
}

/** Conflicts a prospective change would introduce (used by the manage dialog
 *  to warn before saving). `ignoreCode` skips the subject being edited. */
export function conflictsForProposedSlot(
  dateISO: string,
  proposed: { code?: string; start: string; end: string; room?: string; faculty?: string },
): ProposedSlotConflict[] {
  const clashes: ProposedSlotConflict[] = [];
  for (const slot of adminScheduleForDate(dateISO)) {
    if (!activeSlot(slot)) continue;
    if (proposed.code && slot.code === proposed.code) continue;
    if (!overlaps(proposed.start, proposed.end, slot.start, slot.end)) continue;
    if (proposed.room && slot.room === proposed.room) {
      clashes.push({
        type: "room",
        subject: slot.subject,
        code: slot.code,
        start: slot.start,
        end: slot.end,
        room: slot.room,
        faculty: slot.faculty,
      });
    }
    if (proposed.faculty && slot.faculty === proposed.faculty) {
      clashes.push({
        type: "faculty",
        subject: slot.subject,
        code: slot.code,
        start: slot.start,
        end: slot.end,
        room: slot.room,
        faculty: slot.faculty,
      });
    }
  }
  return clashes;
}

/* ------------------------------------------------------------------ */
/* Room-clash radar                                                    */
/* ------------------------------------------------------------------ */

/** Teaching hours the heatmap spans. */
const RADAR_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

function coversHour(slot: { start: string; end: string }, hour: string): boolean {
  const hourEnd = `${String(Number(hour.slice(0, 2)) + 1).padStart(2, "0")}:00`;
  return overlaps(slot.start, slot.end, hour, hourEnd);
}

/** Rooms × hours occupancy for a week, with already-booked double-bookings flagged. */
export function roomRadar(weekStartISO: string = DEMO_WEEK_START, days = 6): RoomRadarView {
  const rooms = getAdminRooms();
  const dates = weekDates(weekStartISO, days);
  const movable: RoomRadarView["movable"] = [];

  const radarDays: RadarDay[] = dates.map((date) => {
    const slots = adminScheduleForDate(date).filter(activeSlot);
    for (const slot of slots) {
      movable.push({
        id: `${date}-${slot.code}`,
        date,
        code: slot.code,
        subject: slot.subject,
        room: slot.room,
        start: slot.start,
        end: slot.end,
      });
    }

    const cells: RadarCell[] = [];
    for (const room of rooms) {
      for (const hour of RADAR_HOURS) {
        const sessions = slots
          .filter((slot) => slot.room === room.name && coversHour(slot, hour))
          .map((slot) => ({
            code: slot.code,
            subject: slot.subject,
            faculty: slot.faculty,
            start: slot.start,
            end: slot.end,
            type: slot.type,
          }));
        if (sessions.length === 0) continue;
        cells.push({ room: room.name, hour, sessions, clash: sessions.length > 1 });
      }
    }

    return {
      date,
      label: formatDayLabel(date),
      cells,
      bookedHours: cells.length,
    };
  });

  return { weekStart: weekStartISO, hours: RADAR_HOURS, rooms, days: radarDays, movable };
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

function averagePercent(code: string): number | null {
  const percents = studentsForSubject(code)
    .map((row) => row.aggregate?.percent)
    .filter((value): value is number => value != null);
  if (percents.length === 0) return null;
  return Math.round((percents.reduce((sum, value) => sum + value, 0) / percents.length) * 10) / 10;
}

export function subjectAttendanceStats(): SubjectAttendanceStat[] {
  return ACADEMIC_SUBJECTS.map((subject) => {
    const rows = studentsForSubject(subject.code);
    const belowThreshold = rows.filter(
      (row) => row.aggregate && row.aggregate.percent < row.aggregate.threshold,
    ).length;
    return {
      code: subject.code,
      subject: subject.name,
      facultyName: subject.facultyName,
      type: subject.type,
      percent: averagePercent(subject.code) ?? 0,
      belowThreshold,
      total: rows.length,
      sessions: getSavedSessionsForCode(subject.code).length,
    };
  });
}

export function academicAnalytics(): AcademicAnalytics {
  const overview = getAssignmentOverviewStats();
  const assignments = getAllAssignments();
  const gradedAssignments = assignments
    .map((assignment) => getSubmissionStats(assignment.id))
    .filter((stats) => stats.graded > 0);
  const totalGraded = gradedAssignments.reduce((sum, stats) => sum + stats.graded, 0);
  const gradedSum = gradedAssignments.reduce(
    (sum, stats) => sum + (stats.avgGrade ?? 0) * stats.graded,
    0,
  );
  return {
    openAssignments: overview.active,
    dueSoon: overview.dueSoon,
    pendingSubmissions: overview.pendingSubmissions,
    graded: overview.graded,
    avgGrade: totalGraded > 0 ? Math.round((gradedSum / totalGraded) * 10) / 10 : null,
    materials: getStudentMaterials().length,
  };
}

export function scheduleAnalytics(): ScheduleAnalytics {
  const week = new Set(weekDates(DEMO_WEEK_START, 7));
  const inWeek = SCHEDULE_OVERRIDES.filter((o) => week.has(o.date));
  const count = (kind: ScheduleChangeKind) =>
    inWeek.filter((o) => o.kind === kind).length;
  const conflicts = weekDates(DEMO_WEEK_START, 7).reduce(
    (sum, date) => sum + conflictsForDate(date).length,
    0,
  );
  return {
    changesThisWeek: inWeek.length,
    cancellations: count("cancelled"),
    extras: count("extra"),
    reschedules: count("rescheduled") + count("swapped"),
    roomChanges: count("room_changed"),
    facultyChanges: count("faculty_changed"),
    conflicts,
  };
}

export function adminAnalytics(): AdminAnalyticsData {
  return {
    attendanceBySubject: subjectAttendanceStats(),
    departments: MOCK_ADMIN_DASHBOARD.departments.map((department) => ({ ...department })),
    academic: academicAnalytics(),
    schedule: scheduleAnalytics(),
  };
}

/* ------------------------------------------------------------------ */
/* Attendance risk                                                     */
/* ------------------------------------------------------------------ */

export function attendanceRisk(): AttendanceRiskView {
  const subjects: AttendanceRiskView["subjects"] = [];
  const students: RiskStudentRow[] = [];

  for (const subject of ACADEMIC_SUBJECTS) {
    const rows = studentsBelowThreshold(subject.code);
    if (rows.length === 0) continue;
    subjects.push({
      code: subject.code,
      subject: subject.name,
      facultyName: subject.facultyName,
      type: subject.type,
      atRiskCount: rows.length,
      totalStudents: studentsForSubject(subject.code).length,
      classPercent: averagePercent(subject.code) ?? 0,
      threshold: rows[0]?.aggregate.threshold ?? 75,
    });
    for (const row of rows) {
      students.push({
        student: row.student,
        code: subject.code,
        subject: subject.name,
        facultyName: subject.facultyName,
        percent: row.aggregate.percent,
        threshold: row.aggregate.threshold,
        missingAssignments: countMissingForStudent(row.student.id, subject.code),
      });
    }
  }

  subjects.sort((a, b) => b.atRiskCount - a.atRiskCount);
  students.sort((a, b) => a.percent - b.percent);
  return { subjects, students };
}

/* ------------------------------------------------------------------ */
/* Institutional activity feed                                         */
/* ------------------------------------------------------------------ */

const KIND_LABEL: Record<ScheduleOverride["kind"], string> = {
  cancelled: "Class cancelled",
  rescheduled: "Lecture rescheduled",
  swapped: "Lecture swapped",
  extra: "Extra lecture added",
  room_changed: "Room changed",
  faculty_changed: "Faculty changed",
};

const KIND_TONE: Record<ScheduleOverride["kind"], InstitutionalActivity["tone"]> = {
  cancelled: "destructive",
  rescheduled: "warning",
  swapped: "warning",
  extra: "info",
  room_changed: "warning",
  faculty_changed: "warning",
};

export function institutionalActivity(limit = 12): InstitutionalActivity[] {
  const entries: InstitutionalActivity[] = [];

  for (const override of SCHEDULE_OVERRIDES) {
    entries.push({
      id: `act-override-${override.id}`,
      kind: "schedule",
      title: `${subjectName(override.code)} — ${KIND_LABEL[override.kind]}`,
      description: `${formatDayLabel(override.date)} · ${override.reason ?? "Schedule change applied"}`,
      timestamp: `${override.date}T08:00:00`,
      tone: KIND_TONE[override.kind],
    });
  }

  const { pending } = getAdminApprovals();
  for (const approval of pending) {
    entries.push({
      id: `act-approval-${approval.id}`,
      kind: "approval",
      title: `Approval request — ${approval.subject}`,
      description: `${approval.detail} · by ${approval.requestedBy}`,
      timestamp: approval.requestedAt,
      tone: "warning",
    });
  }

  for (const notice of getAllNotices()) {
    if (notice.status !== "published") continue;
    entries.push({
      id: `act-notice-${notice.id}`,
      kind: "notice",
      title: `Notice published — ${notice.title}`,
      description: `${notice.category} · ${notice.audience} audience`,
      timestamp: notice.publishAt,
      tone: "info",
    });
  }

  for (const event of getAllEvents()) {
    if (event.status === "past") continue;
    entries.push({
      id: `act-event-${event.id}`,
      kind: "event",
      title: `Event — ${event.title}`,
      description: `${formatShortDate(event.date)} · ${event.location} · ${event.registrations} registered`,
      timestamp: event.date,
      tone: "neutral",
    });
  }

  for (const session of getSavedSessionsForCode("CMPN309")) {
    entries.push({
      id: `act-att-${session.id}`,
      kind: "attendance",
      title: `Attendance recorded — ${session.subject}`,
      description: `${session.group} · ${session.date} · ${session.records.length} students`,
      timestamp: session.savedAt,
      tone: "success",
    });
  }

  for (const assignment of getAllAssignments()) {
    const graded = getSubmissionsForAssignment(assignment.id).filter(
      (submission) => submission.status === "submitted" && typeof submission.grade === "number",
    );
    for (const submission of graded.slice(0, 2)) {
      entries.push({
        id: `act-grade-${submission.id}`,
        kind: "academic",
        title: `${submission.studentName} graded — ${assignment.title}`,
        description: `${assignment.subject} · ${submission.grade} / ${assignment.maxMarks}`,
        timestamp: "2026-08-14T16:00:00",
        tone: "info",
      });
    }
  }

  return entries
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}
