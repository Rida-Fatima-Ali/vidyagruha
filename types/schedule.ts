export type ScheduleChangeKind =
  | "cancelled"
  | "rescheduled"
  | "swapped"
  | "extra"
  | "room_changed"
  | "faculty_changed";

/**
 * Compact, human-readable annotation attached to an effective schedule slot
 * when a base-schedule override applies to it.
 */
export interface ScheduleAdjustment {
  kind: ScheduleChangeKind;
  /** One-liner shown in the UI, e.g. "Moved from 09:00". */
  note: string;
  movedFromTime?: string;
  /** For cross-day reschedules: the ISO date the lecture originally ran on. */
  sourceDate?: string;
  swappedWithCode?: string;
  originalRoom?: string;
  originalFaculty?: string;
}

/**
 * A date-specific deviation from the recurring weekly timetable. The effective
 * schedule for a day is computed as `base + overrides`, so dashboards,
 * timetables and notifications all read from the same resolved data.
 */
export interface ScheduleOverride {
  id: string;
  /** ISO date (yyyy-mm-dd) the change applies to. */
  date: string;
  /** Subject code the change affects. */
  code: string;
  kind: ScheduleChangeKind;
  /** rescheduled — the original start time ("09:00"). */
  fromTime?: string;
  /** rescheduled / extra — the (new) start time. */
  toTime?: string;
  /** rescheduled — when moving the lecture to a different day. */
  toDate?: string;
  /** rescheduled / extra — end time of the session. */
  endTime?: string;
  /** room_changed — the replacement room. */
  newRoom?: string;
  /** faculty_changed — the covering faculty. */
  newFaculty?: string;
  /** swapped — the subject code this slot exchanged times with. */
  swappedWithCode?: string;
  /** Optional plain-language reason surfaced in the UI. */
  reason?: string;
}
