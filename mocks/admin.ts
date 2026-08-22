import type {
  AdminClass,
  AdminDashboardData,
  AdminFaculty,
  AdminFacultySubject,
  AdminRoom,
  AdminStudent,
  AdminSubject,
  AdminUser,
  ApprovalDecision,
  PendingApproval,
  RoomKind,
} from "@/types/admin";
import { ACADEMIC_SUBJECTS, WEEKLY_TIMETABLE } from "@/mocks/academic";
import { getRoster, groupLabel } from "@/mocks/roster";
import { studentsForSubject } from "@/mocks/attendance";
import { countMissingForStudent } from "@/mocks/assignments";
import { DEMO_NOW } from "@/constants/demo";

/**
 * Admin mocks stay thin projections over the shared stores (roster, academic
 * subjects, attendance aggregates, assignments) so faculty actions reflect
 * here instantly — the admin never sees a separate copy of the institution.
 */

export const MOCK_ADMIN_DASHBOARD: AdminDashboardData = {
  stats: {
    totalStudents: 3842,
    activeFaculty: 214,
    facultyOnRoll: 226,
    attendanceToday: 91.4,
    attendanceTrend: 1.2,
    pendingApprovals: 12,
    newApprovals: 5,
    changedApprovals: 7,
  },
  departments: [
    {
      id: "cmpn",
      name: "Computer Science",
      code: "CMPN",
      students: 1184,
      faculty: 62,
      attendanceRate: 92.1,
      trend: 0.8,
    },
    {
      id: "inft",
      name: "Information Technology",
      code: "INFT",
      students: 612,
      faculty: 34,
      attendanceRate: 90.4,
      trend: 1.4,
    },
    {
      id: "extc",
      name: "Electronics & Telecomm.",
      code: "EXTC",
      students: 586,
      faculty: 31,
      attendanceRate: 89.7,
      trend: -0.6,
    },
    {
      id: "aiml",
      name: "Artificial Intelligence & ML",
      code: "AIML",
      students: 348,
      faculty: 21,
      attendanceRate: 93.6,
      trend: 2.1,
    },
    {
      id: "mech",
      name: "Mechanical Engineering",
      code: "MECH",
      students: 641,
      faculty: 42,
      attendanceRate: 87.2,
      trend: -1.3,
    },
    {
      id: "civl",
      name: "Civil Engineering",
      code: "CIVL",
      students: 471,
      faculty: 36,
      attendanceRate: 85.8,
      trend: -2.4,
    },
  ],
  approvals: [
    {
      id: "apr-1041",
      type: "student-enrollment",
      subject: "Riya Sharma",
      detail: "New student enrollment · B.E. Computer Science · Sem 1",
      requestedBy: "Admissions Office",
      requestedAt: "2026-08-15T09:10:00",
    },
    {
      id: "apr-1040",
      type: "faculty-change",
      subject: "Dr. Meena Iyer",
      detail: "Class duty change · CMPN Sem 5 Section B",
      requestedBy: "Prof. A. Deshpande (HoD)",
      requestedAt: "2026-08-15T08:40:00",
    },
    {
      id: "apr-1039",
      type: "student-change",
      subject: "Arjun Nair",
      detail: "Division change request · CMPN Sem 3 A → B",
      requestedBy: "Class Advisor, CMPN-B",
      requestedAt: "2026-08-15T08:05:00",
    },
    {
      id: "apr-1038",
      type: "faculty-joining",
      subject: "Dr. Karthik Rao",
      detail: "New faculty appointment · Applied Mathematics",
      requestedBy: "HR Office",
      requestedAt: "2026-08-14T17:30:00",
    },
    {
      id: "apr-1037",
      type: "student-enrollment",
      subject: "Priya Deshmukh",
      detail: "Readmission after approved leave · B.E. IT · Sem 5",
      requestedBy: "Examination Cell",
      requestedAt: "2026-08-14T15:20:00",
    },
    {
      id: "apr-1036",
      type: "student-change",
      subject: "Aman Verma",
      detail: "Name correction on academic records",
      requestedBy: "Examination Cell",
      requestedAt: "2026-08-14T12:45:00",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function emailFor(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
  return `${slug}@somaiya.edu`;
}

export function getAdminUsers(): AdminUser[] {
  const students: AdminUser[] = getRoster().map((student) => ({
    id: student.id,
    name: student.name,
    email: emailFor(student.name),
    role: "student",
    roleName: `Student · ${student.group}`,
    status: "active",
    joinedAt: "2026-06-10T09:00:00",
    lastActive: "2026-08-14T17:20:00",
  }));

  const faculty = getAdminFaculty().map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: "faculty" as const,
    roleName: `Faculty · ${member.department}`,
    status: member.status,
    joinedAt: member.joinedAt,
    lastActive: "2026-08-15T13:10:00",
  }));

  const admins: AdminUser[] = [
    {
      id: "adm-001",
      name: "Admin Portal",
      email: "admin@somaiya.edu",
      role: "admin",
      roleName: "System Administrator",
      status: "active",
      joinedAt: "2025-05-01T09:00:00",
      lastActive: "2026-08-15T13:45:00",
    },
  ];

  return [...students, ...faculty, ...admins];
}

/** Student directory — attendance aggregates read from the shared store. */
export function getAdminStudents(groupSlug?: string): AdminStudent[] {
  return studentsForSubject("CMPN309", groupSlug).map(({ student, aggregate }) => ({
    id: student.id,
    rollNo: student.rollNo,
    name: student.name,
    group: student.group,
    groupSlug: student.groupSlug,
    attendancePercent: aggregate?.percent ?? null,
    belowThreshold: aggregate ? aggregate.percent < aggregate.threshold : false,
    missingAssignments: countMissingForStudent(student.id, "CMPN309"),
  }));
}

/** Faculty directory — derived from the canonical subject → faculty mapping. */
export function getAdminFaculty(): AdminFaculty[] {
  const byName = new Map<string, AdminFacultySubject[]>();
  for (const subject of ACADEMIC_SUBJECTS) {
    const list = byName.get(subject.facultyName) ?? [];
    list.push({ code: subject.code, name: subject.name, type: subject.type });
    byName.set(subject.facultyName, list);
  }
  return Array.from(byName.entries()).map(([name, subjects], index) => ({
    id: `fac-${String(index + 1).padStart(3, "0")}`,
    name,
    email: emailFor(name),
    department: "Computer Engineering",
    subjects,
    status: "active",
    joinedAt: "2024-07-01T09:00:00",
  }));
}

/* ------------------------------------------------------------------ */
/* Classes / subjects / rooms                                          */
/* ------------------------------------------------------------------ */

const CLASS_ADVISOR: Record<string, string> = {
  "cmpn-a": "Snehal Suryavanshi",
  "cmpn-b": "Charulata Ingle",
};

export function getAdminClasses(): AdminClass[] {
  const roster = getRoster();
  const slugs = Array.from(new Set(roster.map((student) => student.groupSlug)));
  return slugs.map((slug) => {
    const rows = studentsForSubject("CMPN309", slug);
    const percents = rows
      .map((row) => row.aggregate?.percent)
      .filter((value): value is number => value != null);
    const average = percents.length
      ? Math.round((percents.reduce((sum, value) => sum + value, 0) / percents.length) * 10) / 10
      : null;
    return {
      id: slug,
      name: groupLabel(slug),
      programme: "Computer Engineering",
      year: "Second Year",
      semester: "Semester 3",
      strength: rows.length,
      advisor: CLASS_ADVISOR[slug] ?? "Department Office",
      attendanceRate: average,
    };
  });
}

export function getAdminSubjects(): AdminSubject[] {
  return ACADEMIC_SUBJECTS.map((subject) => {
    const rows = studentsForSubject(subject.code);
    const percents = rows
      .map((row) => row.aggregate?.percent)
      .filter((value): value is number => value != null);
    const average = percents.length
      ? Math.round((percents.reduce((sum, value) => sum + value, 0) / percents.length) * 10) / 10
      : null;
    const belowThreshold = rows.filter(
      (row) => row.aggregate && row.aggregate.percent < row.aggregate.threshold,
    ).length;
    return {
      code: subject.code,
      name: subject.name,
      type: subject.type,
      facultyName: subject.facultyName,
      defaultRoom: subject.defaultRoom,
      weeklySessions: WEEKLY_TIMETABLE.filter((slot) => slot.code === subject.code).length,
      attendanceRate: average,
      belowThreshold,
    };
  });
}

const ROOM_META: Record<string, { block: string; capacity: number; kind: RoomKind }> = {
  "Room 201": { block: "Block A", capacity: 60, kind: "classroom" },
  "Room 206": { block: "Block A", capacity: 60, kind: "classroom" },
  "Room 208": { block: "Block A", capacity: 60, kind: "classroom" },
  "Room 210": { block: "Block A", capacity: 60, kind: "classroom" },
  "Room 214": { block: "Block A", capacity: 60, kind: "classroom" },
  "Lab 2 · Block B": { block: "Block B", capacity: 40, kind: "lab" },
  "Lab 2 · Block C": { block: "Block C", capacity: 40, kind: "lab" },
  "Lab 3 · Block C": { block: "Block C", capacity: 40, kind: "lab" },
  "Seminar Hall 1": { block: "Block A", capacity: 120, kind: "seminar" },
};

const WEEKLY_PERIODS = 48;

export function getAdminRooms(): AdminRoom[] {
  return Object.entries(ROOM_META).map(([name, meta], index) => {
    const sessions = WEEKLY_TIMETABLE.filter((slot) => slot.room === name).length;
    return {
      id: `room-${index + 1}`,
      name,
      block: meta.block,
      capacity: meta.capacity,
      kind: meta.kind,
      sessionsPerWeek: sessions,
      utilizationPercent: Math.min(100, Math.round((sessions / WEEKLY_PERIODS) * 100)),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Approvals                                                           */
/* ------------------------------------------------------------------ */

const RESOLVED_APPROVALS: PendingApproval[] = [];

export function getAdminApprovals(): {
  pending: PendingApproval[];
  resolved: PendingApproval[];
} {
  return {
    pending: MOCK_ADMIN_DASHBOARD.approvals.map((approval) => ({ ...approval })),
    resolved: RESOLVED_APPROVALS.map((approval) => ({ ...approval })),
  };
}

export function decideAdminApproval(
  id: string,
  decision: ApprovalDecision,
): PendingApproval | undefined {
  const index = MOCK_ADMIN_DASHBOARD.approvals.findIndex((approval) => approval.id === id);
  if (index === -1) return undefined;
  const [approval] = MOCK_ADMIN_DASHBOARD.approvals.splice(index, 1);
  const resolved: PendingApproval = {
    ...approval,
    decision,
    decidedAt: DEMO_NOW.toISOString(),
  };
  RESOLVED_APPROVALS.unshift(resolved);
  return resolved;
}
