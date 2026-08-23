import type {
  AttendanceSessionLite,
  ClassAttendanceSnapshot,
  MarkStatus,
  RosterStudent,
  SessionAttendance,
  SessionAttendanceRecord,
  StudentSubjectAggregate,
} from "@/types/attendance";
import { getRoster, getRosterStudent } from "@/mocks/roster";
import { formatShortDate } from "@/utils/date";

/**
 * Shared attendance store. One mutable list of per-(student × subject)
 * aggregates plus the saved per-session records. Faculty marking writes here;
 * the student attendance page reads from here — a single source of truth.
 */

function percent(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 1000) / 10;
}

function agg(
  studentId: string,
  code: string,
  attended: number,
  total: number,
  lateCount = 0,
): StudentSubjectAggregate {
  return {
    studentId,
    code,
    attended,
    total,
    lateCount,
    percent: percent(attended, total),
    threshold: 75,
  };
}

/** Deterministic pseudo-random aggregate for one (student × subject) row so
 *  the admin institution-wide analytics have believable per-subject spread
 *  without the demo student's baseline (above) changing a single value. */
function seedAggregate(studentId: string, code: string): StudentSubjectAggregate {
  let hash = 0;
  for (let index = 0; index < studentId.length; index += 1) {
    hash = (hash * 31 + studentId.charCodeAt(index)) >>> 0;
  }
  hash = (hash ^ (code.charCodeAt(0) * 17 + code.charCodeAt(code.length - 1) * 7)) >>> 0;
  const total = 24 + (hash % 7);
  const absent = 2 + (hash % 9);
  const attended = Math.max(14, total - absent);
  return {
    studentId,
    code,
    attended,
    total,
    lateCount: hash % 3,
    percent: percent(attended, total),
    threshold: 75,
  };
}

/** Subjects beyond the demo faculty's own — aggregated across the full roster
 *  so admin analytics (per-subject attendance, risk) stay honest. */
const OTHER_SUBJECT_CODES = [
  "CMPN302",
  "CMPN303",
  "CMPN304",
  "CMPN305",
  "CMPN306",
  "CMPN307",
  "CMPN308",
];

function generatedAggregates(): StudentSubjectAggregate[] {
  const rows: StudentSubjectAggregate[] = [];
  for (const code of OTHER_SUBJECT_CODES) {
    for (let n = 2; n <= 32; n += 1) {
      rows.push(seedAggregate(`stu-${String(n).padStart(3, "0")}`, code));
    }
  }
  return rows;
}

/**
 * Baseline aggregates. Lakshya (stu-001) matches the values the student app
 * previously shipped so the refactor is output-identical; the rest of the
 * roster carries Python Lab (CMPN309 — the demo faculty's subject) plus
 * generated institution-wide rows for the other subjects (see
 * `generatedAggregates` below) so the admin analytics have real spread.
 */
const SEED: StudentSubjectAggregate[] = [
  agg("stu-001", "CMPN302", 23, 27),
  agg("stu-001", "CMPN303", 22, 29),
  agg("stu-001", "CMPN304", 21, 29),
  agg("stu-001", "CMPN305", 18, 21),
  agg("stu-001", "CMPN306", 21, 25),
  agg("stu-001", "CMPN307", 9, 12),
  agg("stu-001", "CMPN308", 10, 12),
  agg("stu-001", "CMPN309", 11, 13, 1),
  // CMPN-A · Python Lab
  agg("stu-002", "CMPN309", 12, 13),
  agg("stu-003", "CMPN309", 10, 13),
  agg("stu-004", "CMPN309", 8, 13),
  agg("stu-005", "CMPN309", 11, 13),
  agg("stu-006", "CMPN309", 12, 13),
  agg("stu-007", "CMPN309", 9, 13),
  agg("stu-008", "CMPN309", 13, 13),
  agg("stu-009", "CMPN309", 10, 13),
  agg("stu-010", "CMPN309", 11, 13),
  agg("stu-011", "CMPN309", 9, 13),
  agg("stu-012", "CMPN309", 12, 13),
  agg("stu-013", "CMPN309", 10, 13),
  agg("stu-014", "CMPN309", 8, 13),
  agg("stu-015", "CMPN309", 11, 13),
  agg("stu-016", "CMPN309", 13, 13),
  // CMPN-B · Python Lab
  agg("stu-017", "CMPN309", 11, 13),
  agg("stu-018", "CMPN309", 12, 13),
  agg("stu-019", "CMPN309", 10, 13),
  agg("stu-020", "CMPN309", 9, 13),
  agg("stu-021", "CMPN309", 12, 13),
  agg("stu-022", "CMPN309", 11, 13),
  agg("stu-023", "CMPN309", 10, 13),
  agg("stu-024", "CMPN309", 8, 13),
  agg("stu-025", "CMPN309", 13, 13),
  agg("stu-026", "CMPN309", 11, 13),
  agg("stu-027", "CMPN309", 9, 13),
  agg("stu-028", "CMPN309", 12, 13),
  agg("stu-029", "CMPN309", 10, 13),
  agg("stu-030", "CMPN309", 11, 13),
  agg("stu-031", "CMPN309", 12, 13),
  agg("stu-032", "CMPN309", 10, 13),
];

const AGGREGATES: StudentSubjectAggregate[] = [
  ...SEED.map((row) => ({ ...row })),
  ...generatedAggregates(),
];

/* ------------------------------------------------------------------ */
/* Saved session records                                               */
/* ------------------------------------------------------------------ */

type RecordSeed = { absent?: number[]; late?: number[] };

function buildRecords(groupSlug: string, seed: RecordSeed): SessionAttendanceRecord[] {
  return getRoster(groupSlug).map((student) => {
    let status: MarkStatus = "present";
    if (seed.absent?.includes(Number(student.rollNo))) status = "absent";
    if (seed.late?.includes(Number(student.rollNo))) status = "late";
    return { studentId: student.id, status };
  });
}

/**
 * Recent Python Lab sessions already marked, so the analytics panel and trend
 * have believable history. Today's sessions are deliberately unmarked.
 */
const SEED_SESSIONS: SessionAttendance[] = [
  {
    id: "py-2026-08-06-a",
    date: "2026-08-06",
    code: "CMPN309",
    groupSlug: "cmpn-a",
    group: "CMPN-A · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-06T14:45:00",
    records: buildRecords("cmpn-a", { absent: [4, 11] }),
  },
  {
    id: "py-2026-08-08-a",
    date: "2026-08-08",
    code: "CMPN309",
    groupSlug: "cmpn-a",
    group: "CMPN-A · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-08T14:40:00",
    records: buildRecords("cmpn-a", { absent: [7], late: [14] }),
  },
  {
    id: "py-2026-08-11-a",
    date: "2026-08-11",
    code: "CMPN309",
    groupSlug: "cmpn-a",
    group: "CMPN-A · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-11T14:42:00",
    records: buildRecords("cmpn-a", { absent: [4, 14] }),
  },
  {
    id: "py-2026-08-13-a",
    date: "2026-08-13",
    code: "CMPN309",
    groupSlug: "cmpn-a",
    group: "CMPN-A · Sem 3",
    subject: "Python Lab",
    start: "14:00",
    end: "15:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-13T15:45:00",
    records: buildRecords("cmpn-a", { late: [1, 7] }),
  },
  {
    id: "py-2026-08-14-a",
    date: "2026-08-14",
    code: "CMPN309",
    groupSlug: "cmpn-a",
    group: "CMPN-A · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-14T14:41:00",
    records: buildRecords("cmpn-a", { absent: [11], late: [3, 9] }),
  },
  {
    id: "py-2026-08-06-b",
    date: "2026-08-06",
    code: "CMPN309",
    groupSlug: "cmpn-b",
    group: "CMPN-B · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-06T14:45:00",
    records: buildRecords("cmpn-b", { absent: [20, 27] }),
  },
  {
    id: "py-2026-08-08-b",
    date: "2026-08-08",
    code: "CMPN309",
    groupSlug: "cmpn-b",
    group: "CMPN-B · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-08T14:40:00",
    records: buildRecords("cmpn-b", { absent: [24], late: [27] }),
  },
  {
    id: "py-2026-08-11-b",
    date: "2026-08-11",
    code: "CMPN309",
    groupSlug: "cmpn-b",
    group: "CMPN-B · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-11T14:42:00",
    records: buildRecords("cmpn-b", { absent: [20, 24] }),
  },
  {
    id: "py-2026-08-13-b",
    date: "2026-08-13",
    code: "CMPN309",
    groupSlug: "cmpn-b",
    group: "CMPN-B · Sem 3",
    subject: "Python Lab",
    start: "14:00",
    end: "15:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-13T15:45:00",
    records: buildRecords("cmpn-b", { late: [27, 17] }),
  },
  {
    id: "py-2026-08-14-b",
    date: "2026-08-14",
    code: "CMPN309",
    groupSlug: "cmpn-b",
    group: "CMPN-B · Sem 3",
    subject: "Python Lab",
    start: "13:00",
    end: "14:40",
    room: "Lab 3 · Block C",
    marked: true,
    savedAt: "2026-08-14T14:41:00",
    records: buildRecords("cmpn-b", { absent: [24], late: [20] }),
  },
];

const SAVED_SESSIONS: SessionAttendance[] = SEED_SESSIONS.map((session) => ({
  ...session,
  records: session.records.map((record) => ({ ...record })),
}));

/* ------------------------------------------------------------------ */
/* Public store API                                                    */
/* ------------------------------------------------------------------ */

export function sessionKey(date: string, code: string, groupSlug: string): string {
  return `${date}-${code}-${groupSlug}`;
}

export function getAggregate(
  studentId: string,
  code: string,
): StudentSubjectAggregate | undefined {
  return AGGREGATES.find(
    (row) => row.studentId === studentId && row.code === code,
  );
}

export function getStudentAggregates(studentId: string): StudentSubjectAggregate[] {
  return AGGREGATES.filter((row) => row.studentId === studentId).map((row) => ({
    ...row,
  }));
}

export function getSavedSession(
  date: string,
  code: string,
  groupSlug: string,
): SessionAttendance | undefined {
  return SAVED_SESSIONS.find(
    (session) =>
      session.date === date &&
      session.code === code &&
      session.groupSlug === groupSlug,
  );
}

export function getSavedSessionById(id: string): SessionAttendance | undefined {
  return SAVED_SESSIONS.find((session) => session.id === id);
}

/** All saved sessions for a subject, newest first. */
export function getSavedSessionsForCode(code: string): SessionAttendance[] {
  return SAVED_SESSIONS.filter((session) => session.code === code).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/**
 * Persist a marking run for one (date × code × group). Mutates the shared
 * aggregates so the student attendance page reflects the faculty's save.
 */
export function saveSessionAttendance(
  date: string,
  code: string,
  groupSlug: string,
  subject: string,
  start: string,
  end: string,
  room: string,
  records: SessionAttendanceRecord[],
  savedAt: string,
): SessionAttendance {
  const group = getRoster(groupSlug)[0]?.group ?? groupSlug.toUpperCase();
  const existing = getSavedSession(date, code, groupSlug);
  const session: SessionAttendance = {
    id: existing?.id ?? `session-${sessionKey(date, code, groupSlug)}`,
    date,
    code,
    groupSlug,
    group,
    subject,
    start,
    end,
    room,
    marked: true,
    savedAt,
    records: records.map((record) => ({ ...record })),
  };

  if (existing) {
    const index = SAVED_SESSIONS.findIndex((s) => s.id === existing.id);
    SAVED_SESSIONS[index] = session;
  } else {
    SAVED_SESSIONS.unshift(session);
  }

  if (existing) rollbackAggregates(code, existing.records);
  applyAggregates(code, records);

  return session;
}

/**
 * Drop a marking run entirely — used by the undo window so a mistaken save
 * leaves no session and no aggregate trace behind.
 */
export function clearSessionAttendance(
  date: string,
  code: string,
  groupSlug: string,
): boolean {
  const existing = getSavedSession(date, code, groupSlug);
  if (!existing) return false;
  SAVED_SESSIONS.splice(
    SAVED_SESSIONS.findIndex((session) => session.id === existing.id),
    1,
  );
  rollbackAggregates(code, existing.records);
  return true;
}

function applyAggregates(code: string, records: SessionAttendanceRecord[]): void {
  for (const record of records) {
    const row = getAggregate(record.studentId, code);
    if (!row) continue;
    row.total += 1;
    if (record.status !== "absent") {
      row.attended += 1;
      if (record.status === "late") row.lateCount += 1;
    }
    row.percent = percent(row.attended, row.total);
  }
}

function rollbackAggregates(code: string, records: SessionAttendanceRecord[]): void {
  for (const record of records) {
    const row = getAggregate(record.studentId, code);
    if (!row) continue;
    row.total = Math.max(0, row.total - 1);
    if (record.status !== "absent") {
      row.attended = Math.max(0, row.attended - 1);
      if (record.status === "late") row.lateCount = Math.max(0, row.lateCount - 1);
    }
    row.percent = percent(row.attended, row.total);
  }
}

/* ------------------------------------------------------------------ */
/* Snapshot + risk helpers                                             */
/* ------------------------------------------------------------------ */

function countStatus(
  records: SessionAttendanceRecord[],
  status: MarkStatus,
): number {
  return records.filter((record) => record.status === status).length;
}

/** Present %, absent count, late count for the class's most recent session —
 *  falls back to the average of per-student aggregates when nothing saved yet. */
export function getClassSnapshot(code: string, groupSlug: string): ClassAttendanceSnapshot {
  const roster = getRoster(groupSlug);
  const subject = getAggregate(roster[0]?.id ?? "", code) ? code : "";
  const latest = getSavedSessionsForCode(code).find(
    (session) => session.groupSlug === groupSlug,
  );

  if (latest) {
    const present = countStatus(latest.records, "present");
    const late = countStatus(latest.records, "late");
    return {
      code,
      subject,
      group: latest.group,
      groupSlug,
      total: latest.records.length,
      present,
      absent: countStatus(latest.records, "absent"),
      late,
      percent: percent(present + late, latest.records.length),
    };
  }

  const rows = roster
    .map((student) => getAggregate(student.id, code))
    .filter((row): row is StudentSubjectAggregate => Boolean(row));
  const avg = rows.length
    ? rows.reduce((sum, row) => sum + row.percent, 0) / rows.length
    : 0;
  return {
    code,
    subject: "",
    group: roster[0]?.group ?? groupSlug.toUpperCase(),
    groupSlug,
    total: roster.length,
    present: 0,
    absent: 0,
    late: 0,
    percent: Math.round(avg * 10) / 10,
  };
}

/** Students below the threshold for a subject, optionally per group. */
export function studentsBelowThreshold(
  code: string,
  groupSlug?: string,
): { student: RosterStudent; aggregate: StudentSubjectAggregate }[] {
  return getRoster(groupSlug)
    .map((student) => ({ student, aggregate: getAggregate(student.id, code) }))
    .filter(
      (row): row is { student: RosterStudent; aggregate: StudentSubjectAggregate } =>
        row.aggregate !== undefined &&
        row.aggregate.percent < row.aggregate.threshold,
    )
    .sort((a, b) => a.aggregate.percent - b.aggregate.percent);
}

/** Every roster student for a subject (with aggregate when available) — the
 *  backing rows for the marking workbench. */
export function studentsForSubject(
  code: string,
  groupSlug?: string,
): { student: RosterStudent; aggregate: StudentSubjectAggregate | undefined }[] {
  return getRoster(groupSlug).map((student) => ({
    student,
    aggregate: getAggregate(student.id, code),
  }));
}

/** Trend points (up to 6) from the saved sessions for a subject. */
export function attendanceTrend(code: string): { label: string; percent: number }[] {
  return getSavedSessionsForCode(code)
    .slice(0, 6)
    .reverse()
    .map((session) => {
      const present = countStatus(session.records, "present");
      const late = countStatus(session.records, "late");
      return {
        label: formatShortDate(session.date),
        percent: Math.round(((present + late) / session.records.length) * 100),
      };
    });
}

/** The demo student's roster row (used by the workbench to pre-mark defaults). */
export function getRosterForSession(
  _session: Pick<AttendanceSessionLite, "date" | "code" | "groupSlug">,
): RosterStudent[] {
  return getRoster(_session.groupSlug);
}

export { getRosterStudent };
