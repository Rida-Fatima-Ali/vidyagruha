import type { RosterStudent } from "@/types/attendance";

/**
 * Shared Sem 3 roster (CMPN-A + CMPN-B). This is the single source of truth
 * for every faculty roster view and the attendance workbench — the demo student
 * (Lakshya Choithani) sits in CMPN-A.
 */

export const GROUP_SLUGS = ["cmpn-a", "cmpn-b"] as const;

const ROSTER: RosterStudent[] = [
  // CMPN-A · Sem 3
  { id: "stu-001", rollNo: "01", name: "Lakshya Choithani", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-002", rollNo: "02", name: "Ananya Deshpande", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-003", rollNo: "03", name: "Rohan Kulkarni", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-004", rollNo: "04", name: "Sneha Iyer", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-005", rollNo: "05", name: "Arjun Mehta", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-006", rollNo: "06", name: "Priya Nair", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-007", rollNo: "07", name: "Kunal Patil", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-008", rollNo: "08", name: "Divya Rao", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-009", rollNo: "09", name: "Aditya Sharma", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-010", rollNo: "10", name: "Ishita Verma", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-011", rollNo: "11", name: "Siddharth Joshi", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-012", rollNo: "12", name: "Tanvi Kulkarni", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-013", rollNo: "13", name: "Varun Gupta", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-014", rollNo: "14", name: "Meera Pillai", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-015", rollNo: "15", name: "Nikhil More", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  { id: "stu-016", rollNo: "16", name: "Ritu Singh", group: "CMPN-A · Sem 3", groupSlug: "cmpn-a" },
  // CMPN-B · Sem 3
  { id: "stu-017", rollNo: "17", name: "Kabir Shah", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-018", rollNo: "18", name: "Anjali Reddy", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-019", rollNo: "19", name: "Harsh Goyal", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-020", rollNo: "20", name: "Neha Bhatt", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-021", rollNo: "21", name: "Omkar Pawar", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-022", rollNo: "22", name: "Pooja Menon", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-023", rollNo: "23", name: "Yash Thakur", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-024", rollNo: "24", name: "Sanika Kulkarni", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-025", rollNo: "25", name: "Aryan Saxena", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-026", rollNo: "26", name: "Gauri Joshi", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-027", rollNo: "27", name: "Rahul Pillai", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-028", rollNo: "28", name: "Shreya Naik", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-029", rollNo: "29", name: "Manish Yadav", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-030", rollNo: "30", name: "Kavya Krishnan", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-031", rollNo: "31", name: "Devendra Mishra", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
  { id: "stu-032", rollNo: "32", name: "Nandini Shetty", group: "CMPN-B · Sem 3", groupSlug: "cmpn-b" },
];

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
