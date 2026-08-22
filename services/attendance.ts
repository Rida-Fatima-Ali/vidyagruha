import type {
  AttendanceSessionLite,
  AttendanceTrendPoint,
  AtRiskStudent,
  RosterStudent,
  SessionAttendanceRecord,
} from "@/types/attendance";
import {
  getSavedSession,
  getSavedSessionById,
  saveSessionAttendance,
  studentsBelowThreshold,
  studentsForSubject,
  attendanceTrend,
  getRosterForSession,
} from "@/mocks/attendance";
import { getRoster, getRosterStudent, GROUP_SLUGS, groupLabel } from "@/mocks/roster";
import { countMissingForStudent } from "@/mocks/assignments";
import { effectiveScheduleForDate, ownedByFaculty } from "@/services/schedule";
import { subjectName } from "@/services/schedule";
import { DEMO_NOW } from "@/constants/demo";

/**
 * Faculty-facing attendance domain logic. Sessions for a faculty day are
 * derived from the *effective* schedule (so overrides instantly change the
 * workbench) and expanded into per-batch sessions (CMPN-A / CMPN-B).
 */

export function sessionId(date: string, code: string, groupSlug: string): string {
  return `session-${date}-${code}-${groupSlug}`;
}

export function facultySessionsForDate(
  facultyName: string,
  dateISO: string,
): AttendanceSessionLite[] {
  const slots = effectiveScheduleForDate(dateISO).filter((slot) =>
    ownedByFaculty(slot.code, facultyName),
  );
  const sessions: AttendanceSessionLite[] = [];
  for (const slot of slots) {
    for (const groupSlug of GROUP_SLUGS) {
      const students = getRoster(groupSlug).length;
      sessions.push({
        id: sessionId(dateISO, slot.code, groupSlug),
        date: dateISO,
        code: slot.code,
        subject: slot.subject,
        type: slot.type,
        group: groupLabel(groupSlug),
        groupSlug,
        start: slot.start,
        end: slot.end,
        room: slot.room,
        faculty: slot.faculty,
        students,
        marked: Boolean(getSavedSession(dateISO, slot.code, groupSlug)),
      });
    }
  }
  return sessions.sort(
    (a, b) => a.start.localeCompare(b.start) || a.groupSlug.localeCompare(b.groupSlug),
  );
}

/** Roster for a session — the students a faculty member marks attendance for. */
export function rosterForSession(
  session: Pick<AttendanceSessionLite, "date" | "code" | "groupSlug">,
): RosterStudent[] {
  return getRosterForSession(session);
}

export function persistSession(
  date: string,
  code: string,
  groupSlug: string,
  records: SessionAttendanceRecord[],
  start: string,
  end: string,
  room: string,
): { savedAt: string; id: string } {
  const savedAt = DEMO_NOW.toISOString();
  const session = saveSessionAttendance(
    date,
    code,
    groupSlug,
    subjectName(code),
    start,
    end,
    room,
    records,
    savedAt,
  );
  return { savedAt, id: session.id };
}

export function findSavedSessionById(id: string) {
  return getSavedSessionById(id);
}

export function findSavedSession(date: string, code: string, groupSlug: string) {
  return getSavedSession(date, code, groupSlug);
}

/**
 * Students at risk for a faculty's own subject: below the attendance
 * threshold, or with outstanding submissions. Scoped by subject so a
 * Microprocessor warning never leaks into the Python Lab context.
 */
export function atRiskForSubject(
  code: string,
  groupSlug?: string,
): AtRiskStudent[] {
  return studentsBelowThreshold(code, groupSlug).map(({ student, aggregate }) => {
    const missing = countMissingForStudent(student.id, code);
    const reasons: string[] = [
      `Attendance ${aggregate.percent}% — below the ${aggregate.threshold}% threshold`,
    ];
    if (missing > 0) {
      reasons.push(`${missing} outstanding submission${missing === 1 ? "" : "s"}`);
    }
    return {
      student,
      code,
      subject: subjectName(code),
      percent: aggregate.percent,
      threshold: aggregate.threshold,
      missingAssignments: missing,
      reasons,
    };
  });
}

export function trendForSubject(code: string): AttendanceTrendPoint[] {
  return attendanceTrend(code);
}

/** Every roster row for the marking workbench, with live aggregate + missing
 *  assignment counts so the "below threshold" hint is contextual. */
export function studentRowsForSubject(code: string, groupSlug?: string) {
  return studentsForSubject(code, groupSlug).map(({ student, aggregate }) => ({
    student,
    percent: aggregate?.percent ?? 0,
    threshold: aggregate?.threshold ?? 75,
    missingAssignments: countMissingForStudent(student.id, code),
  }));
}

export function rosterStudent(studentId: string) {
  return getRosterStudent(studentId);
}

export { groupLabel };
