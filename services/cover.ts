import { COVER_REQUESTS, hasCoverRequest } from "@/mocks/cover-requests";
import {
  allFacultyNames,
  effectiveScheduleForDate,
  ownedByFaculty,
} from "@/services/schedule";
import { DEMO_TODAY } from "@/constants/demo";
import { weekDates } from "@/utils/date";
import type {
  CoverBoardView,
  CoverCandidate,
  CoverRequest,
  CoverRequestWithCandidates,
  CoverableSession,
} from "@/types/cover";

/** How far ahead the "request cover" picker looks. */
const COVERABLE_DAYS = 7;

function minutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function overlaps(
  a: { start: string; end: string },
  b: { start: string; end: string },
): boolean {
  return minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end);
}

/**
 * Ranks every department colleague for a request: whoever already teaches the
 * subject and is free at that hour comes first, then anyone free with the
 * lightest day, then colleagues who clash (shown greyed out, never hidden —
 * the requester still needs to know who was asked).
 */
export function candidatesFor(request: CoverRequest): CoverCandidate[] {
  const daySlots = effectiveScheduleForDate(request.date);

  const candidates = allFacultyNames()
    .filter((name) => name !== request.requestedBy)
    .map<CoverCandidate>((name) => {
      const theirSlots = daySlots.filter(
        (slot) => slot.faculty === name && slot.adjustment?.kind !== "cancelled",
      );
      const clash = theirSlots.find((slot) => overlaps(slot, request));
      return {
        name,
        free: !clash,
        clashSubject: clash?.subject,
        teachesSubject: ownedByFaculty(request.code, name),
        loadThatDay: theirSlots.length,
      };
    });

  return candidates.sort((a, b) => {
    if (a.free !== b.free) return a.free ? -1 : 1;
    if (a.teachesSubject !== b.teachesSubject) return a.teachesSubject ? -1 : 1;
    return a.loadThatDay - b.loadThatDay;
  });
}

export function withCandidates(request: CoverRequest): CoverRequestWithCandidates {
  return { ...request, candidates: candidatesFor(request) };
}

/** Whether `facultyName` can take the request (open, not theirs, no clash). */
export function canCover(request: CoverRequest, facultyName: string): boolean {
  if (request.status !== "open") return false;
  if (request.requestedBy === facultyName) return false;
  const candidate = candidatesFor(request).find((c) => c.name === facultyName);
  return Boolean(candidate?.free);
}

function fillMinutes(request: CoverRequest): number | null {
  if (!request.acceptedAt) return null;
  return Math.round(
    (new Date(request.acceptedAt).getTime() - new Date(request.requestedAt).getTime()) /
      60_000,
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

/** Sessions `facultyName` owns over the next week that are still coverable. */
export function coverableSessions(
  facultyName: string,
  fromISO = DEMO_TODAY,
): CoverableSession[] {
  const sessions: CoverableSession[] = [];
  for (const date of weekDates(fromISO, COVERABLE_DAYS)) {
    for (const slot of effectiveScheduleForDate(date)) {
      if (slot.faculty !== facultyName) continue;
      if (slot.adjustment?.kind === "cancelled") continue;
      sessions.push({
        id: `${date}-${slot.code}`,
        code: slot.code,
        subject: slot.subject,
        date,
        start: slot.start,
        end: slot.end,
        room: slot.room,
        type: slot.type,
        requested: hasCoverRequest(slot.code, date),
      });
    }
  }
  return sessions;
}

export function coverBoard(facultyName: string): CoverBoardView {
  const all = COVER_REQUESTS.map(withCandidates);

  const byRecency = (a: CoverRequest, b: CoverRequest) =>
    b.requestedAt.localeCompare(a.requestedAt);

  const mine = all.filter((request) => request.requestedBy === facultyName).sort(byRecency);
  const inbox = all
    .filter(
      (request) =>
        request.status === "open" &&
        request.requestedBy !== facultyName &&
        request.candidates.some(
          (candidate) => candidate.name === facultyName && candidate.free,
        ),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const settled = all
    .filter((request) => request.status !== "open" && request.requestedBy !== facultyName)
    .sort(byRecency);

  const fills = all
    .map(fillMinutes)
    .filter((value): value is number => value !== null);

  return {
    inbox,
    mine,
    settled,
    coverable: coverableSessions(facultyName),
    stats: {
      open: all.filter((request) => request.status === "open").length,
      coveringForOthers: all.filter((request) => request.acceptedBy === facultyName).length,
      awaitingCover: mine.filter((request) => request.status === "open").length,
      medianFillMinutes: median(fills),
    },
  };
}
