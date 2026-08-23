import type { ScheduleSlotType } from "./student";

/**
 * Faculty cover-request marketplace. A faculty member who cannot take a
 * lecture posts the slot; every department colleague who is free at that
 * time gets a one-tap accept. Accepting writes a `faculty_changed` schedule
 * override, so the swap lands in the student timetable immediately.
 */

export type CoverRequestStatus = "open" | "accepted" | "cancelled";

export interface CoverRequest {
  id: string;
  code: string;
  subject: string;
  /** ISO date (yyyy-mm-dd) of the session that needs cover. */
  date: string;
  start: string;
  end: string;
  room: string;
  type: ScheduleSlotType;
  department: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  note?: string;
  status: CoverRequestStatus;
  acceptedBy?: string;
  acceptedAt?: string;
  /** Override created when the request was accepted (for revert). */
  overrideId?: string;
}

export interface CoverRequestDraft {
  code: string;
  date: string;
  reason: string;
  note?: string;
}

/** A colleague's availability for one request, ranked best-fit first. */
export interface CoverCandidate {
  name: string;
  /** No other lecture overlaps the requested slot. */
  free: boolean;
  /** Subject that clashes, when not free. */
  clashSubject?: string;
  /** Already teaches this subject code — the strongest match. */
  teachesSubject: boolean;
  /** Sessions this colleague already takes that day. */
  loadThatDay: number;
}

/** A session the viewer teaches and could still hand over. */
export interface CoverableSession {
  id: string;
  code: string;
  subject: string;
  date: string;
  start: string;
  end: string;
  room: string;
  type: ScheduleSlotType;
  /** True when an open or accepted request already exists for it. */
  requested: boolean;
}

export interface CoverRequestWithCandidates extends CoverRequest {
  candidates: CoverCandidate[];
}

export interface CoverBoardView {
  /** Open requests the viewer can cover (they are free at that time). */
  inbox: CoverRequestWithCandidates[];
  /** Requests the viewer raised, newest first. */
  mine: CoverRequestWithCandidates[];
  /** Settled requests across the department. */
  settled: CoverRequestWithCandidates[];
  /** The viewer's upcoming sessions, for the "request cover" form. */
  coverable: CoverableSession[];
  stats: {
    open: number;
    coveringForOthers: number;
    awaitingCover: number;
    /** Median minutes between posting and acceptance, across settled ones. */
    medianFillMinutes: number | null;
  };
}
