import type { ScheduleAdjustment } from "./schedule";

export type ScheduleSlotType = "lecture" | "lab" | "tutorial";

export interface ScheduleSlot {
  id: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  /** 24-hour clock, e.g. "09:00". */
  start: string;
  end: string;
  type: ScheduleSlotType;
  /** ISO date of the session. */
  day: string;
  /** Present when a base-schedule override applies (cancelled, moved, etc.). */
  adjustment?: ScheduleAdjustment;
}

export type AttendanceStatus = "good" | "warning" | "critical";

export interface SubjectAttendance {
  id: string;
  subject: string;
  code: string;
  attended: number;
  total: number;
  percent: number;
  threshold: number;
  status: AttendanceStatus;
}

export type AssignmentStatus = "pending" | "submitted" | "late" | "graded";
export type AssignmentPriority = "high" | "normal" | "low";

export interface StudentAssignment {
  id: string;
  title: string;
  subject: string;
  code: string;
  /** ISO date. */
  dueDate: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  submittedAt?: string;
  grade?: string;
  maxMarks?: number;
}

export type NoticeCategory = "important" | "academic" | "general" | "event";
export type NoticeScope = "institution" | "department" | "class";

export interface StudentNotice {
  id: string;
  category: NoticeCategory;
  title: string;
  body?: string;
  /** ISO date. */
  date: string;
  scope: NoticeScope;
  pinned?: boolean;
}

export interface StudentEvent {
  id: string;
  title: string;
  type: string;
  /** ISO date. */
  date: string;
  location: string;
  /** ISO date, when a registration deadline applies. */
  deadline?: string;
}

export type MaterialKind = "notes" | "slides" | "question-paper" | "lab-manual";

export interface StudyMaterial {
  id: string;
  title: string;
  kind: MaterialKind;
  subject: string;
  code: string;
  uploadedBy: string;
  /** ISO date. */
  uploadedAt: string;
  pages: number;
  sizeKb: number;
}

export interface StudentDashboardData {
  schedule: ScheduleSlot[];
  attendance: SubjectAttendance[];
  assignments: StudentAssignment[];
  notices: StudentNotice[];
  events: StudentEvent[];
}
