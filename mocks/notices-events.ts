import type {
  AdminEvent,
  AdminEventDraft,
  AdminEventStatus,
  AdminNotice,
  AdminNoticeAudience,
  AdminNoticeDraft,
  AdminNoticeStatus,
} from "@/types/admin";
import type { StudentEvent, StudentNotice } from "@/types/student";
import { DEMO_NOW, DEMO_TODAY } from "@/constants/demo";

/**
 * Single source of truth for notices + events. The admin console publishes
 * here; student and faculty feeds are audience-scoped projections over the
 * same records, so a notice created by an administrator shows up in the
 * student feed the moment it is published — never in a private copy.
 */

const NOTICES: AdminNotice[] = [
  {
    id: "n-1",
    title: "Internal Assessment 1 schedule published",
    body: "Semester 3 IA 1 timetable is now available. Verify your subject slots before Friday.",
    category: "important",
    audience: "institution",
    priority: "high",
    status: "published",
    pinned: true,
    publishAt: "2026-08-14T09:30:00",
    createdAt: "2026-08-14T09:30:00",
  },
  {
    id: "n-2",
    title: "C++ Lab experiment submission window closes Friday",
    body: "Submit the experiment file in Lab 3 before the 5:00 PM deadline.",
    category: "academic",
    audience: "department",
    priority: "normal",
    status: "published",
    pinned: true,
    publishAt: "2026-08-14T08:00:00",
    createdAt: "2026-08-14T08:00:00",
  },
  {
    id: "n-3",
    title: "SIH 2026 internal round — registrations open",
    body: "Registrations close Sunday. Teams of up to six, ideas pitched on Aug 18.",
    category: "event",
    audience: "institution",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-08-12T11:00:00",
    createdAt: "2026-08-12T11:00:00",
  },
  {
    id: "n-4",
    title: "Microprocessor lab viva rescheduled",
    body: "The viva for Batch B moves to Block C, Lab 3 at 2:00 PM.",
    category: "academic",
    audience: "department",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-08-12T15:20:00",
    createdAt: "2026-08-12T15:20:00",
  },
  {
    id: "n-5",
    title: "Library extended hours during exam season",
    body: "The central library now stays open until 9:00 PM on weekdays.",
    category: "general",
    audience: "institution",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-08-11T10:00:00",
    createdAt: "2026-08-11T10:00:00",
  },
  {
    id: "n-6",
    title: "Sports trials — cricket & athletics",
    body: "Trials begin at 4:00 PM on the main ground. Carry your kit.",
    category: "event",
    audience: "institution",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-08-10T16:45:00",
    createdAt: "2026-08-10T16:45:00",
  },
  {
    id: "n-7",
    title: "Canteen menu update — August",
    category: "general",
    audience: "institution",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-08-09T12:00:00",
    createdAt: "2026-08-09T12:00:00",
  },
  {
    id: "adm-nd-1",
    title: "Sem 3 mid-semester syllabus revision circular",
    body: "Draft syllabus coverage update for the mid-semester review meeting.",
    category: "academic",
    audience: "department",
    priority: "normal",
    status: "draft",
    pinned: false,
    publishAt: "2026-08-15T09:00:00",
    createdAt: "2026-08-14T11:00:00",
  },
  {
    id: "adm-ns-1",
    title: "Parent–teacher meet — Sem 3",
    body: "Scheduled parent–teacher meeting for the Sem 3 divisions on campus.",
    category: "general",
    audience: "class",
    priority: "normal",
    status: "scheduled",
    pinned: false,
    publishAt: "2026-08-18T09:00:00",
    createdAt: "2026-08-15T08:00:00",
  },
];

const EVENTS: AdminEvent[] = [
  {
    id: "e-1",
    title: "SIH 2026 — Internal Round",
    type: "Hackathon",
    date: "2026-08-18T09:00:00",
    location: "Innovation Lab",
    deadline: "2026-08-16T23:59:00",
    registrations: 120,
    capacity: 200,
    status: "open",
  },
  {
    id: "e-2",
    title: "Sports Trials — Cricket & Athletics",
    type: "Sports",
    date: "2026-08-15T16:00:00",
    location: "Main Ground",
    registrations: 64,
    capacity: 80,
    status: "upcoming",
  },
  {
    id: "e-3",
    title: "Guest Lecture: Systems Design at Scale",
    type: "Lecture",
    date: "2026-08-20T14:00:00",
    location: "Seminar Hall 1",
    registrations: 180,
    capacity: 150,
    status: "upcoming",
  },
  {
    id: "e-4",
    title: "Resume Workshop by the Placement Cell",
    type: "Workshop",
    date: "2026-08-25T15:00:00",
    location: "Career Centre",
    registrations: 96,
    capacity: 120,
    status: "upcoming",
    department: "Computer Engineering",
  },
  {
    id: "e-5",
    title: "Techno-Cultural Fest 2026",
    type: "Fest",
    date: "2026-09-18T09:00:00",
    location: "Central Quad",
    registrations: 240,
    capacity: 400,
    status: "upcoming",
  },
];

/* ------------------------------------------------------------------ */
/* Admin-facing API                                                    */
/* ------------------------------------------------------------------ */

export function getAllNotices(): AdminNotice[] {
  return NOTICES.map((notice) => ({ ...notice }));
}

export function saveNotice(draft: AdminNoticeDraft): AdminNotice {
  if (draft.id) {
    const index = NOTICES.findIndex((notice) => notice.id === draft.id);
    if (index !== -1) {
      const updated: AdminNotice = {
        ...NOTICES[index],
        ...draft,
        id: draft.id,
        createdAt: NOTICES[index].createdAt,
      };
      NOTICES[index] = updated;
      return { ...updated };
    }
  }
  const notice: AdminNotice = {
    id: `adm-n-${Date.now().toString(36)}`,
    ...draft,
    createdAt: DEMO_NOW.toISOString(),
  };
  NOTICES.unshift(notice);
  return { ...notice };
}

export function setNoticeStatus(
  id: string,
  status: AdminNoticeStatus,
): AdminNotice | undefined {
  const index = NOTICES.findIndex((notice) => notice.id === id);
  if (index === -1) return undefined;
  NOTICES[index] = { ...NOTICES[index], status };
  return { ...NOTICES[index] };
}

export function getAllEvents(): AdminEvent[] {
  return EVENTS.map((event) => ({ ...event }));
}

export function saveEvent(draft: AdminEventDraft): AdminEvent {
  if (draft.id) {
    const index = EVENTS.findIndex((event) => event.id === draft.id);
    if (index !== -1) {
      const updated: AdminEvent = {
        ...EVENTS[index],
        ...draft,
        id: draft.id,
        registrations: draft.registrations ?? EVENTS[index].registrations,
      };
      EVENTS[index] = updated;
      return { ...updated };
    }
  }
  const event: AdminEvent = {
    id: `adm-e-${Date.now().toString(36)}`,
    title: draft.title,
    type: draft.type,
    date: draft.date,
    location: draft.location,
    deadline: draft.deadline,
    registrations: draft.registrations ?? 0,
    capacity: draft.capacity,
    status: eventStatus(draft.date, draft.deadline),
    department: draft.department,
    audience: draft.audience,
  };
  EVENTS.unshift(event);
  return { ...event };
}

function eventStatus(date: string, deadline?: string): AdminEventStatus {
  if (date < DEMO_TODAY) return "past";
  return deadline ? "open" : "upcoming";
}

/* ------------------------------------------------------------------ */
/* Audience-scoped projections                                         */
/* ------------------------------------------------------------------ */

function isVisibleToStudent(audience: AdminNoticeAudience | undefined): boolean {
  return (
    audience === undefined ||
    audience === "institution" ||
    audience === "department" ||
    audience === "class" ||
    audience === "students"
  );
}

function isVisibleToFaculty(audience: AdminNoticeAudience | undefined): boolean {
  return (
    audience === undefined ||
    audience === "institution" ||
    audience === "department" ||
    audience === "faculty"
  );
}

function toStudentNotice(notice: AdminNotice): StudentNotice {
  const scope = notice.audience === "class" || notice.audience === "department"
    ? notice.audience
    : "institution";
  return {
    id: notice.id,
    category: notice.category,
    title: notice.title,
    body: notice.body,
    date: notice.publishAt,
    scope,
    pinned: notice.pinned,
  };
}

export function getStudentNotices(): StudentNotice[] {
  return NOTICES.filter(
    (notice) =>
      notice.status === "published" && isVisibleToStudent(notice.audience),
  ).map((notice) => toStudentNotice(notice));
}

export function getFacultyNotices(): StudentNotice[] {
  return NOTICES.filter(
    (notice) =>
      notice.status === "published" && isVisibleToFaculty(notice.audience),
  ).map((notice) => toStudentNotice(notice));
}

export function getStudentEvents(): StudentEvent[] {
  return EVENTS.filter((event) => isVisibleToStudent(event.audience)).map(
    (event) => ({
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date,
      location: event.location,
      deadline: event.deadline,
    }),
  );
}

export function getFacultyEvents(): StudentEvent[] {
  return EVENTS.filter((event) => isVisibleToFaculty(event.audience)).map(
    (event) => ({
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date,
      location: event.location,
      deadline: event.deadline,
    }),
  );
}
