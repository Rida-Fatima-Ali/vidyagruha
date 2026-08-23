import type { CoverRequest, CoverRequestDraft } from "@/types/cover";
import { effectiveScheduleForDate, getAcademicSubject } from "@/services/schedule";

/**
 * Runtime store for the cover-request marketplace. Seeded with a couple of
 * live requests (so the board is never empty) plus two settled ones that give
 * the "median fill time" stat something to measure.
 */

export const COVER_DEPARTMENT = "Computer Engineering";

export const COVER_REQUESTS: CoverRequest[] = [
  {
    id: "cov-seed-mp",
    code: "CMPN304",
    subject: "Microprocessor",
    date: "2026-08-17",
    start: "11:00",
    end: "11:50",
    room: "Room 201",
    type: "lecture",
    department: COVER_DEPARTMENT,
    requestedBy: "Charulata Ingle",
    requestedAt: "2026-08-15T12:05:00",
    reason: "FDP at VJTI",
    note: "Unit 3 — 8086 addressing modes. Slides are already in Materials.",
    status: "open",
  },
  {
    id: "cov-seed-lan",
    code: "CMPN307",
    subject: "LAN (Linux Administrator)",
    date: "2026-08-19",
    start: "11:00",
    end: "11:50",
    room: "Room 210",
    type: "lecture",
    department: COVER_DEPARTMENT,
    requestedBy: "Niti Patel",
    requestedAt: "2026-08-15T09:40:00",
    reason: "Medical leave",
    status: "open",
  },
  {
    id: "cov-seed-cpp",
    code: "CMPN302",
    subject: "C++",
    date: "2026-08-14",
    start: "10:00",
    end: "10:50",
    room: "Room 214",
    type: "lecture",
    department: COVER_DEPARTMENT,
    requestedBy: "Snehal Suryavanshi",
    requestedAt: "2026-08-13T18:12:00",
    reason: "University paper assessment duty",
    status: "accepted",
    acceptedBy: "Rupali Patil",
    acceptedAt: "2026-08-13T18:19:00",
  },
  {
    id: "cov-seed-cl",
    code: "CMPN305",
    subject: "CL (Constitutional Learning)",
    date: "2026-08-13",
    start: "16:00",
    end: "16:50",
    room: "Room 208",
    type: "lecture",
    department: COVER_DEPARTMENT,
    requestedBy: "Madhuri",
    requestedAt: "2026-08-12T20:30:00",
    reason: "Family emergency",
    status: "accepted",
    acceptedBy: "Charulata Ingle",
    acceptedAt: "2026-08-12T20:51:00",
  },
];

function nextId(): string {
  return `cov-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** The session a request refers to, resolved from the effective schedule. */
export function sessionForRequest(
  code: string,
  dateISO: string,
): { start: string; end: string; room: string } | null {
  const slot = effectiveScheduleForDate(dateISO).find((s) => s.code === code);
  if (!slot) return null;
  return { start: slot.start, end: slot.end, room: slot.room };
}

export function findCoverRequest(id: string): CoverRequest | undefined {
  return COVER_REQUESTS.find((request) => request.id === id);
}

/** True when the slot already has an open or accepted request. */
export function hasCoverRequest(code: string, dateISO: string): boolean {
  return COVER_REQUESTS.some(
    (request) =>
      request.code === code &&
      request.date === dateISO &&
      request.status !== "cancelled",
  );
}

export function createCoverRequest(
  facultyName: string,
  draft: CoverRequestDraft,
  requestedAt: string,
): CoverRequest {
  const subject = getAcademicSubject(draft.code);
  const session = sessionForRequest(draft.code, draft.date);
  const request: CoverRequest = {
    id: nextId(),
    code: draft.code,
    subject: subject?.name ?? draft.code,
    date: draft.date,
    start: session?.start ?? "09:00",
    end: session?.end ?? "09:50",
    room: session?.room ?? subject?.defaultRoom ?? "",
    type: subject?.type ?? "lecture",
    department: COVER_DEPARTMENT,
    requestedBy: facultyName,
    requestedAt,
    reason: draft.reason,
    note: draft.note?.trim() || undefined,
    status: "open",
  };
  COVER_REQUESTS.unshift(request);
  return request;
}

export function markCoverAccepted(
  id: string,
  facultyName: string,
  acceptedAt: string,
  overrideId: string,
): CoverRequest | undefined {
  const request = findCoverRequest(id);
  if (!request || request.status !== "open") return undefined;
  request.status = "accepted";
  request.acceptedBy = facultyName;
  request.acceptedAt = acceptedAt;
  request.overrideId = overrideId;
  return request;
}

export function cancelCoverRequest(id: string): CoverRequest | undefined {
  const request = findCoverRequest(id);
  if (!request || request.status !== "open") return undefined;
  request.status = "cancelled";
  return request;
}
