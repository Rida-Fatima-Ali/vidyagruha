/**
 * Shared attendance domain types. The roster, per-student-subject aggregates
 * and saved session records all live in mocks/attendance.ts — both the faculty
 * workbench and the student attendance page read from the same store.
 */

import type { ScheduleSlotType } from "@/types/student";

export interface RosterStudent {
  id: string;
  rollNo: string;
  name: string;
  /** Display group label, e.g. "CMPN-A · Sem 3". */
  group: string;
  /** Stable slug used for session keys, e.g. "cmpn-a". */
  groupSlug: string;
}

/** Per (student × subject) attendance aggregate — the "single source" both
 *  the faculty analytics and the student attendance page render. */
export interface StudentSubjectAggregate {
  studentId: string;
  code: string;
  attended: number;
  total: number;
  lateCount: number;
  /** Percentage for the subject, 0–100. */
  percent: number;
  /** Default passing threshold (75% in the prototype). */
  threshold: number;
}

export type MarkStatus = "present" | "absent" | "late";

export interface SessionAttendanceRecord {
  studentId: string;
  status: MarkStatus;
}

/**
 * A saved marking session — one per (date × code × group). Sessions for a
 * faculty day are *derived* from the effective schedule; only the records
 * students actually marked are stored.
 */
export interface SessionAttendance {
  id: string;
  date: string;
  code: string;
  groupSlug: string;
  group: string;
  subject: string;
  start: string;
  end: string;
  room: string;
  marked: boolean;
  savedAt: string;
  records: SessionAttendanceRecord[];
}

/** Lightweight session exposed by the API for the workbench + dashboard. */
export interface AttendanceSessionLite {
  id: string;
  date: string;
  code: string;
  subject: string;
  type: ScheduleSlotType;
  group: string;
  groupSlug: string;
  start: string;
  end: string;
  room: string;
  faculty: string;
  students: number;
  marked: boolean;
}

export interface SaveAttendancePayload {
  date: string;
  code: string;
  groupSlug: string;
  records: SessionAttendanceRecord[];
}

export interface ClassAttendanceSnapshot {
  code: string;
  subject: string;
  group: string;
  groupSlug: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  /** Class-wide attendance percentage, 0–100. */
  percent: number;
}

export interface AtRiskStudent {
  student: RosterStudent;
  code: string;
  subject: string;
  percent: number;
  threshold: number;
  missingAssignments: number;
  reasons: string[];
}

/** One bar in the compact attendance trend panel. */
export interface AttendanceTrendPoint {
  label: string;
  percent: number;
}
