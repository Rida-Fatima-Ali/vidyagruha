import { ACADEMIC_SUBJECTS, WEEKLY_TIMETABLE } from "@/mocks/academic";
import { SCHEDULE_OVERRIDES } from "@/mocks/schedule-overrides";
import type { AcademicSubject } from "@/types/academic";
import type { FacultyLectureOverview } from "@/types/faculty";
import type { ScheduleAdjustment, ScheduleOverride } from "@/types/schedule";
import type { ScheduleSlot } from "@/types/student";
import { formatDayLabel, weekDates } from "@/utils/date";

export { weekDates };

export function getAcademicSubject(code: string): AcademicSubject | undefined {
  return ACADEMIC_SUBJECTS.find((s) => s.code === code);
}

export function subjectName(code: string): string {
  return getAcademicSubject(code)?.name ?? code;
}

export function facultyFor(code: string): string {
  return getAcademicSubject(code)?.facultyName ?? "";
}

/** Whether a faculty member is the assigned instructor for a subject code. */
export function ownedByFaculty(code: string, facultyName: string): boolean {
  return facultyFor(code) === facultyName;
}

export function overridesForDate(dateISO: string): ScheduleOverride[] {
  return SCHEDULE_OVERRIDES.filter((o) => o.date === dateISO);
}

/** Every faculty who teaches an academic subject (for substitute options). */
export function allFacultyNames(): string[] {
  return Array.from(new Set(ACADEMIC_SUBJECTS.map((s) => s.facultyName)));
}

/** Every room referenced by the weekly timetable or a subject. */
export function availableRooms(): string[] {
  return Array.from(
    new Set([
      ...ACADEMIC_SUBJECTS.map((s) => s.defaultRoom),
      ...WEEKLY_TIMETABLE.map((w) => w.room),
    ]),
  );
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function baseSlotToSchedule(
  slot: { code: string; room: string; start: string; end: string },
  day: string,
): Omit<ScheduleSlot, "adjustment"> {
  const subject = getAcademicSubject(slot.code);
  return {
    id: `eff-${day}-${slot.code}`,
    subject: subject?.name ?? slot.code,
    code: slot.code,
    faculty: facultyFor(slot.code),
    room: slot.room,
    start: slot.start,
    end: slot.end,
    type: subject?.type ?? "lecture",
    day,
  };
}

/**
 * Effective schedule for a date: the recurring weekly timetable for that
 * weekday, with every matching ScheduleOverride applied (swaps included,
 * cross-day moves and extras injected). Slots are sorted by start time.
 */
export function effectiveScheduleForDate(dateISO: string): ScheduleSlot[] {
  const weekday = new Date(`${dateISO}T00:00:00`).getDay();
  const baseSlots = WEEKLY_TIMETABLE.filter((w) => w.weekday === weekday);
  const dayOverrides = overridesForDate(dateISO);

  // Cross-day reschedules: a base slot that moved away this day is skipped,
  // and a base slot moved in from another day is injected below.
  const movedAwayCodes = new Set(
    dayOverrides
      .filter((o) => o.kind === "rescheduled" && o.toDate && o.toDate !== dateISO)
      .map((o) => o.code),
  );
  const movedInOverrides = SCHEDULE_OVERRIDES.filter(
    (o) => o.kind === "rescheduled" && o.toDate === dateISO && o.date !== dateISO,
  );
  const movedInCodes = new Set(movedInOverrides.map((o) => o.code));

  const overrideByCode = new Map(
    dayOverrides
      .filter((o) => !movedAwayCodes.has(o.code))
      .map((o) => [o.code, o]),
  );

  const swapMap = new Map<string, string>();
  for (const o of dayOverrides) {
    if (o.kind === "swapped" && o.swappedWithCode) {
      swapMap.set(o.code, o.swappedWithCode);
      swapMap.set(o.swappedWithCode, o.code);
    }
  }

  const result: ScheduleSlot[] = [];
  const handled = new Set<string>();

  for (const base of baseSlots) {
    if (handled.has(base.code)) continue;
    if (movedAwayCodes.has(base.code) || movedInCodes.has(base.code)) continue;

    const swapPartner = swapMap.get(base.code);
    if (swapPartner) {
      const partnerSlot = baseSlots.find((s) => s.code === swapPartner);
      if (partnerSlot) {
        result.push({
          ...baseSlotToSchedule(base, dateISO),
          start: partnerSlot.start,
          end: partnerSlot.end,
          adjustment: {
            kind: "swapped",
            note: `Swapped with ${subjectName(swapPartner)}`,
            swappedWithCode: swapPartner,
          },
        });
        handled.add(base.code);
        handled.add(swapPartner);
        continue;
      }
    }

    const override = overrideByCode.get(base.code);
    const slot = baseSlotToSchedule(base, dateISO);

    if (!override) {
      result.push(slot);
      continue;
    }

    switch (override.kind) {
      case "cancelled":
        result.push({
          ...slot,
          adjustment: { kind: "cancelled", note: "Cancelled" },
        });
        break;
      case "rescheduled":
        result.push({
          ...slot,
          start: override.toTime ?? slot.start,
          end: override.endTime ?? slot.end,
          adjustment: {
            kind: "rescheduled",
            note: `Moved from ${override.fromTime ?? ""}`.trim(),
            movedFromTime: override.fromTime,
          },
        });
        break;
      case "room_changed":
        result.push({
          ...slot,
          room: override.newRoom ?? slot.room,
          adjustment: {
            kind: "room_changed",
            note: `Room changed → ${override.newRoom}`,
            originalRoom: slot.room,
          },
        });
        break;
      case "faculty_changed":
        result.push({
          ...slot,
          faculty: override.newFaculty ?? slot.faculty,
          adjustment: {
            kind: "faculty_changed",
            note: `Faculty changed → ${override.newFaculty}`,
            originalFaculty: slot.faculty,
          },
        });
        break;
      default:
        result.push(slot);
    }
  }

  for (const o of dayOverrides) {
    if (o.kind !== "extra") continue;
    const subject = getAcademicSubject(o.code);
    result.push({
      id: `eff-${dateISO}-${o.id}`,
      subject: subject?.name ?? o.code,
      code: o.code,
      faculty: o.newFaculty ?? facultyFor(o.code),
      room: o.newRoom ?? subject?.defaultRoom ?? "",
      start: o.toTime ?? "13:00",
      end: o.endTime ?? "14:40",
      type: subject?.type ?? "lecture",
      day: dateISO,
      adjustment: { kind: "extra", note: "Additional lecture" },
    });
  }

  for (const o of movedInOverrides) {
    const subject = getAcademicSubject(o.code);
    const baseEnd = WEEKLY_TIMETABLE.find((w) => w.code === o.code)?.end;
    const fallbackStart = o.toTime ?? "09:00";
    result.push({
      id: `eff-${dateISO}-${o.id}`,
      subject: subject?.name ?? o.code,
      code: o.code,
      faculty: facultyFor(o.code),
      room: o.newRoom ?? subject?.defaultRoom ?? "",
      start: o.toTime ?? "09:00",
      end: o.endTime ?? baseEnd ?? addMinutes(fallbackStart, 50),
      type: subject?.type ?? "lecture",
      day: dateISO,
      adjustment: {
        kind: "rescheduled",
        note: `Moved from ${formatDayLabel(o.date)} ${o.fromTime ?? ""}`.trim(),
        movedFromTime: o.fromTime,
        sourceDate: o.date,
      },
    });
  }

  return result.sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Every lecture a faculty member is assigned for the week starting at
 * `startISO`, flattened across the seven days with their effective status —
 * the backing data for the "Manage lectures" screen. Only lectures the faculty
 * actually owns are returned.
 */
export function lecturesForFaculty(
  facultyName: string,
  startISO: string,
): FacultyLectureOverview[] {
  const out: FacultyLectureOverview[] = [];
  for (const date of weekDates(startISO, 7)) {
    const slots = effectiveScheduleForDate(date);
    const overrideByCode = new Map(overridesForDate(date).map((o) => [o.code, o]));
    const movedIn = SCHEDULE_OVERRIDES.filter(
      (o) => o.kind === "rescheduled" && o.toDate === date,
    );

    for (const slot of slots) {
      if (!ownedByFaculty(slot.code, facultyName)) continue;

      let overrideId: string | undefined;
      if (slot.adjustment) {
        overrideId =
          overrideByCode.get(slot.code)?.id ??
          movedIn.find((m) => m.code === slot.code)?.id;
      }

      out.push({
        id: `${date}-${slot.code}`,
        date,
        subject: slot.subject,
        code: slot.code,
        faculty: slot.faculty,
        room: slot.room,
        start: slot.start,
        end: slot.end,
        type: slot.type,
        group: "CMPN-A · Sem 3",
        status: slot.adjustment?.kind ?? "normal",
        adjustment: slot.adjustment,
        overrideId,
      });
    }
  }
  return out;
}

export interface ScheduleDayMarker {
  day: number;
  kind: ScheduleOverride["kind"];
  code: string;
  reason?: string;
}

/**
 * Schedule-change markers for a given month (for calendar dots). `year`/`month`
 * follow JS Date conventions: month is 0-indexed. Cross-day moves also mark the
 * target day.
 */
export function scheduleOverrideMarkers(year: number, month: number): ScheduleDayMarker[] {
  const markers: ScheduleDayMarker[] = [];
  for (const o of SCHEDULE_OVERRIDES) {
    const [y, m, d] = o.date.split("-").map(Number);
    if (y === year && m === month + 1) {
      markers.push({ day: d, kind: o.kind, code: o.code, reason: o.reason });
    }
    if (o.toDate) {
      const [ty, tm, td] = o.toDate.split("-").map(Number);
      if (ty === year && tm === month + 1) {
        markers.push({ day: td, kind: o.kind, code: o.code, reason: o.reason });
      }
    }
  }
  return markers;
}

export type { ScheduleAdjustment };
