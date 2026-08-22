import type {
  FacultyClassSlot,
  FacultyDashboardData,
  FacultyDeadline,
  SubmissionReview,
} from "@/types/faculty";
import {
  getAssignmentsForFaculty,
  getAssignmentOverviewStats,
  getSubmissionStats,
} from "@/mocks/assignments";
import { getSavedSession } from "@/mocks/attendance";
import {
  atRiskForSubject,
  facultySessionsForDate,
} from "@/services/attendance";
import { subjectName } from "@/services/schedule";
import { DEMO_FACULTY_NAME, DEMO_TODAY } from "@/constants/demo";

/**
 * Faculty dashboard, computed from the shared stores + the effective schedule
 * so it stays consistent with the attendance workbench and student views.
 */

export function getMockFacultyDashboard(): FacultyDashboardData {
  const sessions = facultySessionsForDate(DEMO_FACULTY_NAME, DEMO_TODAY);

  const classes: FacultyClassSlot[] = sessions.map((session) => ({
    id: session.id,
    subject: session.subject,
    code: session.code,
    group: session.group,
    room: session.room,
    start: session.start,
    end: session.end,
    type: session.type,
    students: session.students,
    attendanceMarked: Boolean(
      getSavedSession(session.date, session.code, session.groupSlug),
    ),
    day: session.date,
  }));

  const assignments = getAssignmentsForFaculty(DEMO_FACULTY_NAME);
  const submissions: SubmissionReview[] = assignments.map((assignment) => {
    const stats = getSubmissionStats(assignment.id);
    return {
      id: `sub-rev-${assignment.id}`,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      code: assignment.code,
      pending: stats.pending + stats.missing,
      total: stats.total,
      dueDate: assignment.dueDate,
    };
  });

  const overview = getAssignmentOverviewStats(facultySubjectCodes(DEMO_FACULTY_NAME));
  const facultyCodes = [...new Set(assignments.map((assignment) => assignment.code))];
  const atRisk = facultyCodes.flatMap((code) => atRiskForSubject(code));

  const deadlines: FacultyDeadline[] = [
    {
      id: "fac-dl-1",
      label: "IA 1 marks due for departmental review",
      date: "2026-08-18T17:00:00",
    },
    ...assignments.map((assignment) => ({
      id: `fac-dl-${assignment.id}`,
      label: `${assignment.title} submissions close`,
      date: assignment.dueDate,
    })),
  ];

  return {
    stats: {
      classesToday: sessions.length,
      studentsToday: sessions.reduce((sum, session) => sum + session.students, 0),
      pendingReview: overview.pendingSubmissions,
      openAssignments: overview.active,
      atRiskAttendance: atRisk.filter((row) => row.percent < row.threshold).length,
      missingAssignments: atRisk.filter((row) => row.missingAssignments > 0).length,
    },
    classes,
    submissions,
    deadlines,
    atRisk: atRisk.slice(0, 5),
  };
}

/** Convenience for the dashboard mock + notifications. */
export function facultySubjectCodes(facultyName: string): string[] {
  const codes = getAssignmentsForFaculty(facultyName).map((a) => a.code);
  return [...new Set(codes)];
}

export function demoFacultySubjectCodes(): string[] {
  return facultySubjectCodes(DEMO_FACULTY_NAME);
}

export function demoSubjectName(code: string): string {
  return subjectName(code);
}
