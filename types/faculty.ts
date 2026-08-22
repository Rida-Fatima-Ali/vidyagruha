import type {
  ScheduleAdjustment,
  ScheduleChangeKind,
  ScheduleOverride,
} from "@/types/schedule";
import type { ScheduleSlotType, MaterialKind as StudentMaterialKind } from "@/types/student";
import type { AtRiskStudent } from "@/types/attendance";

/** Kinds the faculty store uses; "reference"/"assignment" map to "notes" in
 *  the student view so StudyMaterial's union stays intact. */
export type MaterialKind = StudentMaterialKind | "reference" | "assignment";

export interface FacultyClassSlot {
  id: string;
  subject: string;
  code: string;
  group: string;
  room: string;
  start: string;
  end: string;
  type: ScheduleSlotType;
  students: number;
  attendanceMarked: boolean;
  day: string;
}

export interface SubmissionReview {
  id: string;
  assignmentTitle: string;
  subject: string;
  code: string;
  pending: number;
  total: number;
  dueDate: string;
}

export interface FacultyDeadline {
  id: string;
  label: string;
  date: string;
}

export interface FacultyDashboardData {
  classes: FacultyClassSlot[];
  submissions: SubmissionReview[];
  deadlines: FacultyDeadline[];
  stats: {
    classesToday: number;
    studentsToday: number;
    pendingReview: number;
    openAssignments: number;
    atRiskAttendance: number;
    missingAssignments: number;
  };
  /**
   * Compact at-risk digest for the dashboard card — derived from the shared
   * attendance + assignment stores, scoped to the faculty's own subjects.
   */
  atRisk: AtRiskStudent[];
}

/**
 * A single lecture in the faculty's week, resolved from the effective schedule
 * so its `status` mirrors exactly what students see.
 */
export interface FacultyLectureOverview {
  id: string;
  /** ISO date (yyyy-mm-dd) of the effective session. */
  date: string;
  subject: string;
  code: string;
  /** Currently assigned faculty (reflects a substitute when changed). */
  faculty: string;
  room: string;
  start: string;
  end: string;
  type: ScheduleSlotType;
  group: string;
  status: ScheduleChangeKind | "normal";
  adjustment?: ScheduleAdjustment;
  /** Set when an override is currently shaping this lecture (for revert). */
  overrideId?: string;
}

/** Shape accepted by the manage-lecture mutation endpoints. */
export type CreateScheduleOverrideInput = Omit<ScheduleOverride, "id">;

/* ------------------------------------------------------------------ */
/* Assignments & submissions (shared store → student + faculty views)  */
/* ------------------------------------------------------------------ */

export type FacultyAssignmentStatus = "active" | "upcoming" | "closed";

export interface FacultyAssignment {
  id: string;
  title: string;
  description?: string;
  code: string;
  subject: string;
  dueDate: string;
  publishedAt: string;
  attachedMaterial?: string;
  maxMarks: number;
}

export interface FacultyAssignmentDraft {
  code: string;
  title: string;
  description: string;
  dueDate: string;
  attachedMaterial?: string;
  maxMarks: number;
}

export type SubmissionState = "submitted" | "pending" | "missing";

export interface FacultySubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  group: string;
  status: SubmissionState;
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

export interface AssignmentSubmissionStats {
  total: number;
  submitted: number;
  pending: number;
  missing: number;
  graded: number;
  avgGrade: number | null;
}

export interface AssignmentOverviewStats {
  total: number;
  active: number;
  dueSoon: number;
  pendingSubmissions: number;
  graded: number;
}

export interface AssignmentSubmissionsView {
  assignment: FacultyAssignment;
  stats: AssignmentSubmissionStats;
  submissions: FacultySubmission[];
}

/* ------------------------------------------------------------------ */
/* Course materials                                                    */
/* ------------------------------------------------------------------ */

export interface FacultyMaterial {
  id: string;
  title: string;
  description?: string;
  kind: MaterialKind;
  code: string;
  subject: string;
  uploadedBy: string;
  uploadedAt: string;
  fileName: string;
  sizeKb: number;
  pages: number;
}

export interface FacultyMaterialDraft {
  code: string;
  title: string;
  description: string;
  kind: MaterialKind;
  fileName: string;
  sizeKb: number;
  pages: number;
}

/* ------------------------------------------------------------------ */
/* Roster / student risk                                               */
/* ------------------------------------------------------------------ */

export interface StudentRiskRow {
  studentId: string;
  rollNo: string;
  name: string;
  group: string;
  code: string;
  subject: string;
  attendance: number;
  belowThreshold: boolean;
  missingAssignments: number;
}

export interface StudentsView {
  rows: StudentRiskRow[];
  atRiskCount: number;
  below75Count: number;
  missingAssignmentsCount: number;
}
