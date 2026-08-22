import type {
  AssignmentOverviewStats,
  AssignmentSubmissionStats,
  FacultyAssignment,
  FacultyAssignmentDraft,
  FacultySubmission,
} from "@/types/faculty";
import type { StudentAssignment } from "@/types/student";
import { getRoster } from "@/mocks/roster";
import { ownedByFaculty, subjectName } from "@/services/schedule";
import { DEMO_NOW } from "@/constants/demo";

/**
 * Shared assignments + submissions store. Faculty publishing/creating writes
 * here; the student assignments page derives from here. Submissions for the
 * demo student reproduce the pre-existing student statuses exactly; the demo
 * faculty's own subject (Python Lab) has a full two-batch submission set.
 */

const ASSIGNMENTS: FacultyAssignment[] = [
  {
    id: "as-1",
    title: "Assignment 3 — Templates & STL",
    description: "Implement a generic stack using templates and STL containers.",
    code: "CMPN302",
    subject: "C++",
    dueDate: "2026-08-16T17:00:00",
    publishedAt: "2026-08-06T10:00:00",
    maxMarks: 20,
  },
  {
    id: "as-2",
    title: "Assignment 3 — Routing Algorithms",
    description: "Trace Dijkstra and Bellman-Ford on a sample topology.",
    code: "CMPN303",
    subject: "CN (Computer Networks)",
    dueDate: "2026-08-22T23:59:00",
    publishedAt: "2026-08-08T09:00:00",
    maxMarks: 20,
  },
  {
    id: "as-3",
    title: "LAN Lab Config Report 2",
    description: "VLAN trunking report for the lab topology.",
    code: "CMPN307",
    subject: "LAN (Linux Administrator)",
    dueDate: "2026-08-13T17:00:00",
    publishedAt: "2026-08-04T11:00:00",
    maxMarks: 10,
  },
  {
    id: "as-4",
    title: "8086 Programming Set 2",
    description: "Block transfer and string-manipulation programs with listings.",
    code: "CMPN304",
    subject: "Microprocessor",
    dueDate: "2026-08-09T23:59:00",
    publishedAt: "2026-08-02T12:00:00",
    maxMarks: 20,
  },
  {
    id: "as-5",
    title: "Reflection Essay — Unit 2",
    description: "800-word reflection on fundamental rights.",
    code: "CMPN305",
    subject: "CL (Constitutional Learning)",
    dueDate: "2026-08-28T23:59:00",
    publishedAt: "2026-08-10T10:00:00",
    maxMarks: 10,
  },
  {
    id: "as-py-1",
    title: "Experiment 6 — File Handling in Python",
    description: "Read, process and write a CSV of student records.",
    code: "CMPN309",
    subject: "Python Lab",
    dueDate: "2026-08-17T17:00:00",
    publishedAt: "2026-08-12T09:00:00",
    maxMarks: 10,
  },
  {
    id: "as-py-2",
    title: "Lab Report — Tkinter GUI Basics",
    description: "Screenshots + walkthrough for the contacts GUI.",
    code: "CMPN309",
    subject: "Python Lab",
    dueDate: "2026-08-18T17:00:00",
    publishedAt: "2026-08-13T09:00:00",
    maxMarks: 10,
  },
];

type SubmissionSeed = Record<string, FacultySubmission["status"] | undefined>;

/** Maps rollNo → "submitted" | "pending" for a two-batch assignment. */
function buildSubmissions(assignmentId: string, seed: SubmissionSeed): FacultySubmission[] {
  return getRoster().map((student) => {
    const state: FacultySubmission["status"] = seed[student.rollNo] ?? "submitted";
    return {
      id: `sub-${assignmentId}-${student.id}`,
      assignmentId,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      group: student.group,
      status: state,
      submittedAt:
        state === "submitted"
          ? `2026-08-14T${String(16 + (Number(student.rollNo) % 3)).padStart(2, "0")}:20:00`
          : undefined,
    };
  });
}

const SUBMISSIONS: FacultySubmission[] = [
  // Demo student across every subject (reproduces the pre-existing statuses).
  { id: "sub-as-1-stu-001", assignmentId: "as-1", studentId: "stu-001", studentName: "Lakshya Choithani", rollNo: "01", group: "CMPN-A · Sem 3", status: "pending" },
  { id: "sub-as-2-stu-001", assignmentId: "as-2", studentId: "stu-001", studentName: "Lakshya Choithani", rollNo: "01", group: "CMPN-A · Sem 3", status: "pending" },
  { id: "sub-as-3-stu-001", assignmentId: "as-3", studentId: "stu-001", studentName: "Lakshya Choithani", rollNo: "01", group: "CMPN-A · Sem 3", status: "missing" },
  { id: "sub-as-4-stu-001", assignmentId: "as-4", studentId: "stu-001", studentName: "Lakshya Choithani", rollNo: "01", group: "CMPN-A · Sem 3", status: "submitted", submittedAt: "2026-08-08T20:10:00", grade: 17 },
  { id: "sub-as-5-stu-001", assignmentId: "as-5", studentId: "stu-001", studentName: "Lakshya Choithani", rollNo: "01", group: "CMPN-A · Sem 3", status: "pending" },
  // Full two-batch submissions for the demo faculty's Python Lab assignments
  // (stu-001's rows live in the seed — submitted for Experiment 6, pending for
  // the lab report — so the student feed stays consistent with the roster).
  ...buildSubmissions("as-py-1", {
    "03": "pending", "09": "pending", "23": "pending", "29": "pending",
    "04": "missing", "20": "missing",
  }),
  ...buildSubmissions("as-py-2", {
    "01": "pending",
    "07": "pending", "24": "pending", "32": "pending",
    "11": "missing", "14": "missing", "27": "missing",
  }),
];

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function getAssignmentsForFaculty(facultyName: string): FacultyAssignment[] {
  const codes = getFacultySubjectCodes(facultyName);
  return ASSIGNMENTS.filter((assignment) => codes.includes(assignment.code)).map(
    (assignment) => ({ ...assignment }),
  );
}

/** Faculty subject codes resolved from the canonical academic mapping. */
export function getFacultySubjectCodes(facultyName: string): string[] {
  return [...new Set(ASSIGNMENTS.map((assignment) => assignment.code))].filter(
    (code) => ownedByFaculty(code, facultyName),
  );
}

export function getAssignmentsForCodeStrict(code: string): FacultyAssignment[] {
  return ASSIGNMENTS.filter((assignment) => assignment.code === code).map(
    (assignment) => ({ ...assignment }),
  );
}

/** Every assignment in the shared store (admin analytics read from here). */
export function getAllAssignments(): FacultyAssignment[] {
  return ASSIGNMENTS.map((assignment) => ({ ...assignment }));
}

export function findSubmission(
  assignmentId: string,
  studentId: string,
): FacultySubmission | undefined {
  return SUBMISSIONS.find(
    (submission) =>
      submission.assignmentId === assignmentId && submission.studentId === studentId,
  );
}

export function getSubmissionsForAssignment(
  assignmentId: string,
): FacultySubmission[] {
  return SUBMISSIONS.filter(
    (submission) => submission.assignmentId === assignmentId,
  ).map((submission) => ({ ...submission }));
}

export function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback?: string,
): FacultySubmission {
  const submission = SUBMISSIONS.find((row) => row.id === submissionId);
  if (!submission) throw new Error("Submission not found");
  submission.status = "submitted";
  submission.grade = grade;
  if (feedback !== undefined) submission.feedback = feedback;
  return { ...submission };
}

/** Student-side submit — writes into the same shared submissions store the
 *  faculty grades from, so a submission shows up in the faculty list and in
 *  the admin analytics immediately. Preserves any existing grade. */
export function submitAssignment(
  assignmentId: string,
  studentId: string,
): FacultySubmission {
  let submission = SUBMISSIONS.find(
    (row) => row.assignmentId === assignmentId && row.studentId === studentId,
  );
  if (!submission) {
    const student = getRoster().find((candidate) => candidate.id === studentId);
    submission = {
      id: `sub-${assignmentId}-${studentId}`,
      assignmentId,
      studentId,
      studentName: student?.name ?? "Student",
      rollNo: student?.rollNo ?? "",
      group: student?.group ?? "",
      status: "pending",
    };
    SUBMISSIONS.unshift(submission);
  }
  submission.status = "submitted";
  submission.submittedAt = DEMO_NOW.toISOString();
  return { ...submission };
}

export function createAssignment(
  input: FacultyAssignmentDraft,
): FacultyAssignment {
  const assignment: FacultyAssignment = {
    id: `as-${Date.now().toString(36)}`,
    title: input.title.trim(),
    description: input.description.trim(),
    code: input.code,
    subject: subjectName(input.code) ?? input.code,
    dueDate: input.dueDate,
    publishedAt: DEMO_NOW.toISOString(),
    attachedMaterial: input.attachedMaterial,
    maxMarks: input.maxMarks,
  };
  ASSIGNMENTS.unshift(assignment);
  for (const student of getRoster()) {
    SUBMISSIONS.unshift({
      id: `sub-${assignment.id}-${student.id}`,
      assignmentId: assignment.id,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      group: student.group,
      status: "pending",
    });
  }
  return { ...assignment };
}

export function getSubmissionStats(assignmentId: string): AssignmentSubmissionStats {
  const rows = getSubmissionsForAssignment(assignmentId);
  const graded = rows.filter(
    (row) => row.status === "submitted" && typeof row.grade === "number",
  );
  const grades = graded.map((row) => row.grade as number);
  return {
    total: rows.length,
    submitted: rows.filter((row) => row.status === "submitted").length,
    pending: rows.filter((row) => row.status === "pending").length,
    missing: rows.filter((row) => row.status === "missing").length,
    graded: graded.length,
    avgGrade: grades.length
      ? Math.round((grades.reduce((sum, g) => sum + g, 0) / grades.length) * 10) / 10
      : null,
  };
}

export function getAssignmentOverviewStats(
  codes?: string[],
): AssignmentOverviewStats {
  const pool = codes
    ? ASSIGNMENTS.filter((assignment) => codes.includes(assignment.code))
    : ASSIGNMENTS;
  const now = DEMO_NOW;
  const active = pool.filter((assignment) => new Date(assignment.dueDate) >= now);
  const dueSoon = active.filter(
    (assignment) => new Date(assignment.dueDate).getTime() - now.getTime() <= 3 * 86_400_000,
  );
  const pendingSubmissions = pool.reduce((sum, assignment) => {
    const stats = getSubmissionStats(assignment.id);
    return sum + stats.pending + stats.missing;
  }, 0);
  return {
    total: pool.length,
    active: active.length,
    dueSoon: dueSoon.length,
    pendingSubmissions,
    graded: pool.reduce(
      (sum, assignment) => sum + getSubmissionStats(assignment.id).graded,
      0,
    ),
  };
}

export function countMissingForStudent(studentId: string, code: string): number {
  const codes = getAssignmentsForCodeStrict(code).map((assignment) => assignment.id);
  return SUBMISSIONS.filter(
    (submission) =>
      submission.studentId === studentId &&
      codes.includes(submission.assignmentId) &&
      (submission.status === "pending" || submission.status === "missing"),
  ).length;
}

/* ------------------------------------------------------------------ */
/* Student mapping                                                     */
/* ------------------------------------------------------------------ */

function isOverdue(assignment: FacultyAssignment): boolean {
  return new Date(assignment.dueDate) < DEMO_NOW;
}

function daysUntilDue(assignment: FacultyAssignment): number {
  return Math.ceil(
    (new Date(assignment.dueDate).getTime() - DEMO_NOW.getTime()) / 86_400_000,
  );
}

/** Derive the student assignments feed from the shared store. */
export function getStudentAssignmentsForUser(studentId: string): StudentAssignment[] {
  return ASSIGNMENTS.map((assignment) => {
    const submission = findSubmission(assignment.id, studentId);
    const overdue = isOverdue(assignment);

    let status: StudentAssignment["status"];
    if (submission?.status === "submitted" && typeof submission.grade === "number") {
      status = "graded";
    } else if (submission?.status === "submitted") {
      status = "submitted";
    } else if (overdue) {
      status = "late";
    } else {
      status = "pending";
    }

    let priority: StudentAssignment["priority"];
    if (status === "graded" || status === "submitted") {
      priority = "normal";
    } else if (overdue) {
      priority = "high";
    } else {
      const days = daysUntilDue(assignment);
      priority = days <= 3 ? "high" : days <= 8 ? "normal" : "low";
    }

    return {
      id: assignment.id,
      title: assignment.title,
      subject: assignment.subject,
      code: assignment.code,
      dueDate: assignment.dueDate,
      status,
      priority,
      submittedAt: submission?.submittedAt,
      grade:
        status === "graded" ? `${submission!.grade} / ${assignment.maxMarks}` : undefined,
      maxMarks: assignment.maxMarks,
    };
  });
}
