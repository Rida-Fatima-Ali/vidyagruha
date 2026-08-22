import type { SearchResult } from "@/types/search";

/**
 * Global search results are scoped by role. Each role sees only the pages it
 * can actually open — results without an implemented destination stay marked
 * as "Coming soon".
 */

const STUDENT_INDEX: SearchResult[] = [
  {
    id: "sr-1",
    type: "notice",
    title: "Internal Assessment Schedule — Sem 3",
    subtitle: "Academic notice · Published Aug 14",
    href: "/student/notices",
    available: true,
  },
  {
    id: "sr-2",
    type: "notice",
    title: "SIH 2026 registration open",
    subtitle: "Opportunity · Institution notice",
    href: "/student/notices",
    available: true,
  },
  {
    id: "sr-3",
    type: "material",
    title: "Microprocessor — Unit 2 notes",
    subtitle: "Charulata Ingle · Microprocessor",
    href: "/student/materials",
    available: true,
  },
  {
    id: "sr-4",
    type: "assignment",
    title: "C++ Assignment 3",
    subtitle: "C++ · Due Aug 16",
    href: "/student/assignments",
    available: true,
  },
  {
    id: "sr-5",
    type: "assignment",
    title: "CN Assignment 3",
    subtitle: "CN (Computer Networks) · Due Aug 22",
    href: "/student/assignments",
    available: true,
  },
  {
    id: "sr-6",
    type: "event",
    title: "Smart India Hackathon — Internal Round",
    subtitle: "Hackathon · Aug 24",
    href: "/student/events",
    available: true,
  },
  {
    id: "sr-7",
    type: "event",
    title: "Techno-Cultural Fest 2026",
    subtitle: "Cultural event · Sep 18",
    href: "/student/events",
    available: true,
  },
  {
    id: "sr-8",
    type: "subject",
    title: "C++",
    subtitle: "Second Year · Semester 3 · Division A",
    available: false,
  },
  {
    id: "sr-9",
    type: "subject",
    title: "Microprocessor",
    subtitle: "Second Year · Semester 3 · Division A",
    available: false,
  },
  {
    id: "sr-10",
    type: "campus",
    title: "Central Library",
    subtitle: "Block A · 8:00 AM – 8:00 PM",
    available: false,
  },
  {
    id: "sr-11",
    type: "campus",
    title: "Computer Lab 3",
    subtitle: "Block C · Ground floor",
    available: false,
  },
  {
    id: "sr-12",
    type: "group",
    title: "Computer Engg — Division A",
    subtitle: "Class group · 62 members",
    available: false,
  },
];

const FACULTY_INDEX: SearchResult[] = [
  {
    id: "fr-1",
    type: "subject",
    title: "Python Lab",
    subtitle: "CMPN309 · My class · lab",
    href: "/faculty/classes",
    available: true,
  },
  {
    id: "fr-2",
    type: "subject",
    title: "C++",
    subtitle: "CMPN302 · Second Year · Sem 3",
    href: "/faculty/classes",
    available: true,
  },
  {
    id: "fr-3",
    type: "subject",
    title: "Microprocessor",
    subtitle: "CMPN304 · Second Year · Sem 3",
    href: "/faculty/classes",
    available: true,
  },
  {
    id: "fr-4",
    type: "assignment",
    title: "C++ Assignment 3",
    subtitle: "C++ · Due Aug 16",
    href: "/faculty/assignments",
    available: true,
  },
  {
    id: "fr-5",
    type: "assignment",
    title: "CN Assignment 3",
    subtitle: "CN (Computer Networks) · Due Aug 22",
    href: "/faculty/assignments",
    available: true,
  },
  {
    id: "fr-6",
    type: "material",
    title: "Microprocessor — Unit 2 notes",
    subtitle: "Charulata Ingle · Microprocessor",
    href: "/faculty/materials",
    available: true,
  },
  {
    id: "fr-7",
    type: "group",
    title: "Computer Engg — Division A",
    subtitle: "Class group · 62 members",
    href: "/faculty/students",
    available: true,
  },
  {
    id: "fr-8",
    type: "group",
    title: "Computer Engg — Division B",
    subtitle: "Class group · 60 members",
    href: "/faculty/students",
    available: true,
  },
  {
    id: "fr-9",
    type: "event",
    title: "SIH 2026 — Internal Round",
    subtitle: "Hackathon · Aug 18",
    available: false,
  },
  {
    id: "fr-10",
    type: "notice",
    title: "Internal Assessment Schedule — Sem 3",
    subtitle: "Academic notice · Published Aug 14",
    available: false,
  },
];

const ADMIN_INDEX: SearchResult[] = [
  {
    id: "ar-1",
    type: "faculty",
    title: "Varsha Kinge",
    subtitle: "Faculty · Python Lab (CMPN309)",
    href: "/admin/faculty",
    available: true,
  },
  {
    id: "ar-2",
    type: "faculty",
    title: "Charulata Ingle",
    subtitle: "Faculty · Microprocessor (CMPN304)",
    href: "/admin/faculty",
    available: true,
  },
  {
    id: "ar-3",
    type: "subject",
    title: "Microprocessor",
    subtitle: "CMPN304 · Charulata Ingle · lecture",
    href: "/admin/subjects",
    available: true,
  },
  {
    id: "ar-4",
    type: "subject",
    title: "C++",
    subtitle: "CMPN302 · Snehal Suryavanshi · lecture",
    href: "/admin/subjects",
    available: true,
  },
  {
    id: "ar-5",
    type: "subject",
    title: "Python Lab",
    subtitle: "CMPN309 · Varsha Kinge · lab",
    href: "/admin/subjects",
    available: true,
  },
  {
    id: "ar-6",
    type: "notice",
    title: "Parent–teacher meet — Sem 3",
    subtitle: "Scheduled notice · Aug 18",
    href: "/admin/notices",
    available: true,
  },
  {
    id: "ar-7",
    type: "notice",
    title: "Sem 3 mid-semester syllabus revision circular",
    subtitle: "Draft notice",
    href: "/admin/notices",
    available: true,
  },
  {
    id: "ar-8",
    type: "event",
    title: "SIH 2026 — Internal Round",
    subtitle: "Hackathon · Aug 18 · Innovation Lab",
    href: "/admin/events",
    available: true,
  },
  {
    id: "ar-9",
    type: "event",
    title: "Techno-Cultural Fest 2026",
    subtitle: "Fest · Sep 18 · Central Quad",
    href: "/admin/events",
    available: true,
  },
  {
    id: "ar-10",
    type: "campus",
    title: "Seminar Hall 1",
    subtitle: "Block A · capacity 120",
    href: "/admin/rooms",
    available: true,
  },
  {
    id: "ar-11",
    type: "campus",
    title: "Lab 2 · Block C",
    subtitle: "Block C · lab · capacity 40",
    href: "/admin/rooms",
    available: true,
  },
  {
    id: "ar-12",
    type: "group",
    title: "Computer Engg — Division A",
    subtitle: "Class · 31 students · advisor Snehal Suryavanshi",
    href: "/admin/classes",
    available: true,
  },
  {
    id: "ar-13",
    type: "group",
    title: "Computer Engg — Division B",
    subtitle: "Class · 30 students · advisor Charulata Ingle",
    href: "/admin/classes",
    available: true,
  },
  {
    id: "ar-14",
    type: "assignment",
    title: "C++ Assignment 3",
    subtitle: "CMPN302 · due Aug 16",
    href: "/admin/analytics",
    available: true,
  },
  {
    id: "ar-15",
    type: "material",
    title: "Microprocessor — Unit 2 notes",
    subtitle: "CMPN304 · published material",
    href: "/admin/analytics",
    available: true,
  },
  {
    id: "ar-16",
    type: "notice",
    title: "Internal Assessment Schedule — Sem 3",
    subtitle: "Published notice",
    href: "/admin/notices",
    available: true,
  },
];

const INDEX_BY_ROLE: Record<string, SearchResult[]> = {
  student: STUDENT_INDEX,
  faculty: FACULTY_INDEX,
  admin: ADMIN_INDEX,
};

export function searchMockIndex(
  query: string,
  role: string,
): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const index = INDEX_BY_ROLE[role] ?? STUDENT_INDEX;
  return index
    .filter((result) => {
      const title = result.title.toLowerCase();
      const subtitle = (result.subtitle ?? "").toLowerCase();
      return (
        title.includes(normalized) ||
        subtitle.includes(normalized) ||
        result.type.includes(normalized)
      );
    })
    .slice(0, 8);
}
