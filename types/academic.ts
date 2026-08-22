export type SessionType = "lecture" | "lab" | "tutorial";

/**
 * Base (reference) academic data: subjects and their faculty, plus the
 * recurring weekly timetable. This is the "static" layer — real-world changes
 * to a specific day belong in ScheduleOverride (dynamic state), never here.
 */
export interface AcademicSubject {
  code: string;
  name: string;
  facultyName: string;
  defaultRoom: string;
  type: SessionType;
}

export interface WeeklySlot {
  id: string;
  /** JS getDay() value: 0 (Sunday) through 6 (Saturday). */
  weekday: number;
  code: string;
  room: string;
  /** 24-hour clock, e.g. "09:00". */
  start: string;
  end: string;
}
