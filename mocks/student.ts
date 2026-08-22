import type {
  ScheduleSlot,
  StudentAssignment,
  StudentDashboardData,
  StudentEvent,
  StudentNotice,
  StudyMaterial,
  SubjectAttendance,
  AttendanceStatus,
} from "@/types/student";
import { effectiveScheduleForDate } from "@/services/schedule";
import { DEMO_TODAY } from "@/constants/demo";
import { getStudentAggregates } from "@/mocks/attendance";
import { ACADEMIC_SUBJECTS } from "@/mocks/academic";
import { getStudentAssignmentsForUser } from "@/mocks/assignments";
import { getStudentMaterials } from "@/mocks/materials";
import {
  getStudentEvents,
  getStudentNotices,
} from "@/mocks/notices-events";

/**
 * Student mocks are thin projections over the shared stores (attendance,
 * assignments, materials, notices, events) so faculty + admin actions reflect
 * instantly here.
 */

export const DEMO_STUDENT_ID = "stu-001";

export function getMockSchedule(): ScheduleSlot[] {
  return effectiveScheduleForDate(DEMO_TODAY);
}

function attendanceStatus(row: { percent: number }): AttendanceStatus {
  if (row.percent < 75) return "critical";
  if (row.percent < 80) return "warning";
  return "good";
}

export function getMockAttendance(): SubjectAttendance[] {
  const aggregates = getStudentAggregates(DEMO_STUDENT_ID);
  return ACADEMIC_SUBJECTS.map((subject, index) => {
    const row = aggregates.find(
      (aggregate) => aggregate.code === subject.code,
    );
    if (!row) throw new Error(`Missing attendance aggregate for ${subject.code}`);
    return {
      id: `a-${index + 1}`,
      subject: subject.name,
      code: subject.code,
      attended: row.attended,
      total: row.total,
      percent: row.percent,
      threshold: row.threshold,
      status: attendanceStatus(row),
    };
  });
}

export function getMockAssignments(): StudentAssignment[] {
  return getStudentAssignmentsForUser(DEMO_STUDENT_ID);
}

export function getMockNotices(): StudentNotice[] {
  return getStudentNotices();
}

export function getMockEvents(): StudentEvent[] {
  return getStudentEvents();
}

export function getMockMaterials(): StudyMaterial[] {
  return getStudentMaterials();
}

export function getMockDashboard(): StudentDashboardData {
  return {
    schedule: getMockSchedule(),
    attendance: getMockAttendance(),
    assignments: getMockAssignments(),
    notices: getMockNotices().slice(0, 4),
    events: getMockEvents().slice(0, 3),
  };
}
