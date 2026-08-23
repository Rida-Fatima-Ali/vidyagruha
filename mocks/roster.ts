import type { RosterStudent } from "@/types/attendance";

/**
 * Shared Sem 3 roster (CMPN-A + CMPN-B).
 * Contains exactly 63 students as required by the specifications.
 */

export const GROUP_SLUGS = ["cmpn-a", "cmpn-b"] as const;

const ROSTER: RosterStudent[] = [
  // 1. Core 6 Named Students
  { id: "stu-001", rollNo: "01", name: "Lakshya Choithani", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-002", rollNo: "02", name: "Gargi Thotam", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-003", rollNo: "03", name: "Rida Fatima", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-004", rollNo: "04", name: "Priyansh Bhan", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-005", rollNo: "05", name: "Tejas Nagare", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-006", rollNo: "06", name: "Dheer Chheda", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
];

// Add dummy student records up to exactly 63 students
for (let i = 7; i <= 63; i++) {
  const roll = String(i).padStart(2, "0");
  const idStr = String(i).padStart(3, "0");
  const isA = i <= 32;
  ROSTER.push({
    id: `stu-${idStr}`,
    rollNo: roll,
    name: `Student ${idStr}`,
    group: isA ? "CMPN-A · Sem 3" : "CMPN-B · Sem 3",
    groupSlug: isA ? "cmpn-a" : "cmpn-b",
  });
}

export function getRoster(groupSlug?: string): RosterStudent[] {
  if (!groupSlug) return ROSTER.map((student) => ({ ...student }));
  return ROSTER.filter((student) => student.groupSlug === groupSlug).map(
    (student) => ({ ...student }),
  );
}

export function getRosterStudent(studentId: string): RosterStudent | undefined {
  return ROSTER.find((student) => student.id === studentId);
}

/** Display label for a group slug, e.g. "CMPN-A · Sem 3". */
export function groupLabel(groupSlug: string): string {
  const first = getRoster().find((student) => student.groupSlug === groupSlug);
  return first ? first.group : groupSlug.toUpperCase();
}
