import type { ScheduleOverride } from "@/types/schedule";

/**
 * Date-specific deviations from the recurring weekly timetable. The effective
 * schedule for a day is `WEEKLY_TIMETABLE + SCHEDULE_OVERRIDES`, resolved by
 * services/schedule.ts. Dashboard, timetable, calendar and notifications all
 * read the resolved output — never the raw lists.
 */
export const SCHEDULE_OVERRIDES: ScheduleOverride[] = [
  // Demo day (Saturday, 2026-08-15) — exercises every change kind so the
  // student UI shows compact status indicators for each one.
  {
    id: "ov-20260815-cn",
    date: "2026-08-15",
    code: "CMPN303",
    kind: "rescheduled",
    fromTime: "09:00",
    toTime: "10:00",
    reason: "Faculty timings adjusted",
  },
  {
    id: "ov-20260815-mp",
    date: "2026-08-15",
    code: "CMPN304",
    kind: "room_changed",
    newRoom: "Lab 2 · Block C",
    reason: "Room 201 under maintenance",
  },
  {
    id: "ov-20260815-lan",
    date: "2026-08-15",
    code: "CMPN307",
    kind: "cancelled",
    reason: "Faculty on duty",
  },
  {
    id: "ov-20260815-lanlab",
    date: "2026-08-15",
    code: "CMPN308",
    kind: "faculty_changed",
    newFaculty: "Rupali Patil",
    reason: "Niti Patel on leave",
  },
  {
    id: "ov-20260815-py",
    date: "2026-08-15",
    code: "CMPN309",
    kind: "extra",
    toTime: "13:00",
    endTime: "14:40",
    newRoom: "Lab 3 · Block C",
    newFaculty: "Varsha Kinge",
    reason: "Backlog coverage",
  },
  // An earlier week — swaps C++ with Microprocessor on Monday.
  {
    id: "ov-20260810-cpp",
    date: "2026-08-10",
    code: "CMPN302",
    kind: "swapped",
    swappedWithCode: "CMPN304",
    reason: "Instructor availability",
  },
];

/**
 * Adds a schedule override at runtime (used by the faculty Manage Lecture
 * workflow). Non-extra changes replace any existing non-extra override for the
 * same (date, code) so the effective schedule stays deterministic. Extra
 * lectures are independent sessions and always stack.
 */
export function addScheduleOverride(
  input: Omit<ScheduleOverride, "id">,
): ScheduleOverride {
  if (input.kind !== "extra") {
    for (let index = SCHEDULE_OVERRIDES.length - 1; index >= 0; index -= 1) {
      const existing = SCHEDULE_OVERRIDES[index];
      if (
        existing.date === input.date &&
        existing.code === input.code &&
        existing.kind !== "extra"
      ) {
        SCHEDULE_OVERRIDES.splice(index, 1);
      }
    }
  }
  const override: ScheduleOverride = {
    ...input,
    id: `ov-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
  };
  SCHEDULE_OVERRIDES.push(override);
  return override;
}

/** Removes a runtime-added override; returns false when it does not exist. */
export function removeScheduleOverride(id: string): boolean {
  const index = SCHEDULE_OVERRIDES.findIndex((o) => o.id === id);
  if (index === -1) return false;
  SCHEDULE_OVERRIDES.splice(index, 1);
  return true;
}

/** Looks up an override by id (used for ownership checks before removal). */
export function findScheduleOverride(id: string): ScheduleOverride | undefined {
  return SCHEDULE_OVERRIDES.find((o) => o.id === id);
}
