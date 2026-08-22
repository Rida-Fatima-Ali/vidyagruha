import type { ScheduleAdjustment, ScheduleChangeKind } from "./schedule";
import type { ScheduleSlotType, NoticeCategory, NoticeScope } from "./student";
import type { RosterStudent } from "./attendance";

export type ApprovalType =
  | "student-enrollment"
  | "faculty-joining"
  | "student-change"
  | "faculty-change";

export type ApprovalDecision = "approved" | "deferred";

export interface PendingApproval {
  id: string;
  type: ApprovalType;
  subject: string;
  detail: string;
  requestedBy: string;
  requestedAt: string;
  /** Present once a decision has been made (resolved list). */
  decision?: ApprovalDecision;
  decidedAt?: string;
}

export interface DepartmentStat {
  id: string;
  name: string;
  code: string;
  students: number;
  faculty: number;
  attendanceRate: number;
  trend: number;
}

export interface AdminDashboardData {
  stats: {
    totalStudents: number;
    activeFaculty: number;
    facultyOnRoll: number;
    attendanceToday: number;
    attendanceTrend: number;
    pendingApprovals: number;
    newApprovals: number;
    changedApprovals: number;
  };
  departments: DepartmentStat[];
  approvals: PendingApproval[];
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export type AdminUserStatus = "active" | "suspended" | "invited";
export type AdminUserRole = "student" | "faculty" | "admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  /** Human context line, e.g. "Student · CMPN-A · Sem 3". */
  roleName: string;
  status: AdminUserStatus;
  joinedAt: string;
  lastActive: string;
}

/** Student directory row — attendance aggregates from the shared store. */
export interface AdminStudent {
  id: string;
  rollNo: string;
  name: string;
  group: string;
  groupSlug: string;
  /** Attendance % in the roster subject (Python Lab for the demo roster). */
  attendancePercent: number | null;
  belowThreshold: boolean;
  missingAssignments: number;
}

export interface AdminFacultySubject {
  code: string;
  name: string;
  type: ScheduleSlotType;
}

export interface AdminFaculty {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: AdminFacultySubject[];
  status: AdminUserStatus;
  joinedAt: string;
}

/* ------------------------------------------------------------------ */
/* Classes / subjects / rooms                                          */
/* ------------------------------------------------------------------ */

export interface AdminClass {
  id: string;
  name: string;
  programme: string;
  year: string;
  semester: string;
  strength: number;
  advisor: string;
  attendanceRate: number | null;
}

export interface AdminSubject {
  code: string;
  name: string;
  type: ScheduleSlotType;
  facultyName: string;
  defaultRoom: string;
  weeklySessions: number;
  /** Average attendance across students with aggregates; null when none. */
  attendanceRate: number | null;
  belowThreshold: number;
}

export type RoomKind = "classroom" | "lab" | "seminar";

export interface AdminRoom {
  id: string;
  name: string;
  block: string;
  capacity: number;
  kind: RoomKind;
  sessionsPerWeek: number;
  utilizationPercent: number;
}

/* ------------------------------------------------------------------ */
/* Schedule + conflicts                                                */
/* ------------------------------------------------------------------ */

export interface AdminScheduleSlot {
  id: string;
  date: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  start: string;
  end: string;
  type: ScheduleSlotType;
  group: string;
  status: ScheduleChangeKind | "normal";
  adjustment?: ScheduleAdjustment;
  /** Present when an override is shaping this slot (for revert). */
  overrideId?: string;
}

export type ConflictType = "room" | "faculty";

export interface ScheduleConflict {
  id: string;
  date: string;
  type: ConflictType;
  subject: string;
  code: string;
  start: string;
  end: string;
  room: string;
  faculty: string;
  clashesWith: {
    subject: string;
    code: string;
    start: string;
    end: string;
    room: string;
    faculty: string;
  }[];
}

export interface AdminScheduleView {
  slots: AdminScheduleSlot[];
  conflicts: ScheduleConflict[];
}

/* ------------------------------------------------------------------ */
/* Notices + events                                                    */
/* ------------------------------------------------------------------ */

export type AdminNoticeStatus = "draft" | "published" | "scheduled" | "archived";
/**
 * Who a notice/event reaches. Institution / department / class are geographic
 * scopes; "students" / "faculty" split the two audiences explicitly so a
 * students-only notice never leaks into the faculty feed (and vice-versa).
 */
export type AdminNoticeAudience = NoticeScope | "students" | "faculty";

export interface AdminNotice {
  id: string;
  title: string;
  body?: string;
  category: NoticeCategory;
  audience: AdminNoticeAudience;
  priority: "high" | "normal" | "low";
  status: AdminNoticeStatus;
  pinned: boolean;
  /** ISO datetime the notice goes (or went) live. */
  publishAt: string;
  createdAt: string;
}

export interface AdminNoticeDraft {
  id?: string;
  title: string;
  body?: string;
  category: NoticeCategory;
  audience: AdminNoticeAudience;
  priority: "high" | "normal" | "low";
  status: AdminNoticeStatus;
  pinned: boolean;
  publishAt: string;
}

export type AdminEventStatus = "upcoming" | "open" | "closed" | "past";

export interface AdminEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  deadline?: string;
  registrations: number;
  capacity?: number;
  status: AdminEventStatus;
  department?: string;
  /** Who should see the event. Defaults to the whole institution. */
  audience?: AdminNoticeAudience;
}

export interface AdminEventDraft {
  id?: string;
  title: string;
  type: string;
  date: string;
  location: string;
  deadline?: string;
  capacity?: number;
  registrations?: number;
  department?: string;
  audience?: AdminNoticeAudience;
}

/* ------------------------------------------------------------------ */
/* Analytics + risk                                                    */
/* ------------------------------------------------------------------ */

export interface SubjectAttendanceStat {
  code: string;
  subject: string;
  facultyName: string;
  type: ScheduleSlotType;
  percent: number;
  belowThreshold: number;
  total: number;
  sessions: number;
}

export interface AcademicAnalytics {
  openAssignments: number;
  dueSoon: number;
  pendingSubmissions: number;
  graded: number;
  avgGrade: number | null;
  materials: number;
}

export interface ScheduleAnalytics {
  changesThisWeek: number;
  cancellations: number;
  extras: number;
  reschedules: number;
  roomChanges: number;
  facultyChanges: number;
  conflicts: number;
}

export interface AdminAnalyticsData {
  attendanceBySubject: SubjectAttendanceStat[];
  departments: DepartmentStat[];
  academic: AcademicAnalytics;
  schedule: ScheduleAnalytics;
}

export interface RiskSubjectRow {
  code: string;
  subject: string;
  facultyName: string;
  type: ScheduleSlotType;
  atRiskCount: number;
  totalStudents: number;
  classPercent: number;
  threshold: number;
}

export interface RiskStudentRow {
  student: RosterStudent;
  code: string;
  subject: string;
  facultyName: string;
  percent: number;
  threshold: number;
  missingAssignments: number;
}

export interface AttendanceRiskView {
  subjects: RiskSubjectRow[];
  students: RiskStudentRow[];
}

/* ------------------------------------------------------------------ */
/* Institutional activity feed                                         */
/* ------------------------------------------------------------------ */

export type ActivityKind =
  | "schedule"
  | "approval"
  | "notice"
  | "event"
  | "attendance"
  | "academic";

export interface InstitutionalActivity {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  timestamp: string;
  tone: "info" | "success" | "warning" | "destructive" | "neutral";
}
