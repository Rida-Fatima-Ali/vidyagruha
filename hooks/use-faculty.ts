"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { facultyService } from "@/services/api/faculty";
import { useAsyncResource } from "@/hooks/use-async-resource";
import type { AuthUser } from "@/types/auth";
import type {
  CreateScheduleOverrideInput,
  FacultyAssignmentDraft,
  FacultyDashboardData,
  FacultyLectureOverview,
  FacultyMaterialDraft,
} from "@/types/faculty";
import type {
  AttendanceSessionLite,
  SessionAttendance,
} from "@/types/attendance";

export function useFacultyDashboard(): ReturnType<
  typeof useAsyncResource<FacultyDashboardData>
> {
  return useAsyncResource(
    facultyService.getDashboard,
    "Unable to load your teaching dashboard. Please try again.",
  );
}

export interface FacultyLecturesResult {
  lectures: FacultyLectureOverview[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * The faculty member's effective lectures for the week. Loads once the auth
 * user is resolved and reloads whenever the week or user changes.
 */
export function useFacultyLectures(
  user: AuthUser | null,
  weekStart: string,
): FacultyLecturesResult {
  const [lectures, setLectures] = useState<FacultyLectureOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setLectures(await facultyService.getLectures(user, weekStart));
    } catch {
      setError("Unable to load your lectures. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, weekStart]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, user]);

  return { lectures, loading, error, refresh };
}

export interface LectureManagerResult {
  busy: boolean;
  error: string | null;
  createOverride: (input: CreateScheduleOverrideInput) => Promise<boolean>;
  removeOverride: (overrideId: string) => Promise<boolean>;
}

/** Mutations behind the Manage Lecture workflow. */
export function useLectureManager(user: AuthUser | null): LectureManagerResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOverride = useCallback(
    async (input: CreateScheduleOverrideInput): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.createOverride(user, input);
        return true;
      } catch {
        setError("Unable to save the change. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  const removeOverride = useCallback(
    async (overrideId: string): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.removeOverride(user, overrideId);
        return true;
      } catch {
        setError("Unable to remove the change. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  return { busy, error, createOverride, removeOverride };
}

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

export interface FacultySessionsResult {
  sessions: AttendanceSessionLite[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** The faculty member's effective sessions for a day, per batch. */
export function useFacultySessions(user: AuthUser | null, date: string): FacultySessionsResult {
  const [sessions, setSessions] = useState<AttendanceSessionLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setSessions(await facultyService.getSessions(user, date));
    } catch {
      setError("Unable to load today's sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, user]);

  return { sessions, loading, error, refresh };
}

export interface SessionAttendanceResult {
  session: SessionAttendance | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSessionAttendance(
  user: AuthUser | null,
  sessionId: string | null,
): SessionAttendanceResult {
  const [session, setSession] = useState<SessionAttendance | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await facultyService.getSession(user, sessionId);
      setSession(result && "records" in result ? result : null);
    } catch {
      setError("Unable to load attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    if (!user || !sessionId) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, user, sessionId]);

  return { session, loading, error, refresh };
}

export interface SaveAttendanceResult {
  busy: boolean;
  error: string | null;
  save: (
    date: string,
    code: string,
    groupSlug: string,
    records: { studentId: string; status: "present" | "absent" | "late" }[],
  ) => Promise<boolean>;
  /** Undo a save — restores `records` when given, otherwise unmarks the session. */
  undo: (
    date: string,
    code: string,
    groupSlug: string,
    records?: { studentId: string; status: "present" | "absent" | "late" }[],
  ) => Promise<boolean>;
}

/** Mutation that persists a marking run into the shared attendance store. */
export function useSaveAttendance(user: AuthUser | null): SaveAttendanceResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (
      date: string,
      code: string,
      groupSlug: string,
      records: { studentId: string; status: "present" | "absent" | "late" }[],
    ): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.saveAttendance(user, {
          date,
          code,
          groupSlug,
          records,
        });
        return true;
      } catch {
        setError("Unable to save attendance. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  const undo = useCallback(
    async (
      date: string,
      code: string,
      groupSlug: string,
      records?: { studentId: string; status: "present" | "absent" | "late" }[],
    ): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.undoAttendance(user, {
          date,
          code,
          groupSlug,
          records: records ?? [],
        });
        return true;
      } catch {
        setError("Unable to undo this save. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  return { busy, error, save, undo };
}

export interface AttendanceAnalyticsResult {
  data: {
    snapshot: {
      code: string;
      subject: string;
      group: string;
      groupSlug: string;
      total: number;
      present: number;
      absent: number;
      late: number;
      percent: number;
    };
    trend: { label: string; percent: number }[];
    atRisk: {
      student: { id: string; rollNo: string; name: string; group: string; groupSlug: string };
      code: string;
      subject: string;
      percent: number;
      threshold: number;
      missingAssignments: number;
      reasons: string[];
    }[];
    rows: {
      student: { id: string; rollNo: string; name: string; group: string; groupSlug: string };
      percent: number;
      threshold: number;
      missingAssignments: number;
    }[];
  } | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAttendanceAnalytics(
  user: AuthUser | null,
  code: string | null,
  group: string,
): AttendanceAnalyticsResult {
  const [data, setData] = useState<AttendanceAnalyticsResult["data"]>(null);
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !code) return;
    setLoading(true);
    setError(null);
    try {
      setData(await facultyService.getAnalytics(user, code, group));
    } catch {
      setError("Unable to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, code, group]);

  useEffect(() => {
    if (!user || !code) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, user, code, group]);

  return { data, loading, error, refresh };
}

/* ------------------------------------------------------------------ */
/* Assignments + submissions                                           */
/* ------------------------------------------------------------------ */

function useFacultyResource<T>(
  user: AuthUser | null,
  fetcher: (u: AuthUser) => Promise<T>,
  errorMessage: string,
  deps: unknown[],
): { data: T | null; loading: boolean; error: string | null; refresh: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const errorMessageRef = useRef(errorMessage);
  const depsKey = deps.map(String).join("|");

  useEffect(() => {
    fetcherRef.current = fetcher;
    errorMessageRef.current = errorMessage;
  }, [fetcher, errorMessage]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setData(await fetcherRef.current(user));
    } catch {
      setError(errorMessageRef.current);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, user, depsKey]);

  return { data, loading, error, refresh };
}

export function useFacultyAssignments(user: AuthUser | null) {
  return useFacultyResource(
    user,
    (u) => facultyService.getAssignments(u),
    "Unable to load your assignments. Please try again.",
    [],
  );
}

export function useAssignmentStats(user: AuthUser | null) {
  return useFacultyResource(
    user,
    (u) => facultyService.getAssignmentStats(u),
    "Unable to load assignment stats. Please try again.",
    [],
  );
}

export interface CreateAssignmentResult {
  busy: boolean;
  error: string | null;
  create: (input: FacultyAssignmentDraft) => Promise<boolean>;
}

export function useCreateAssignment(user: AuthUser | null): CreateAssignmentResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = useCallback(
    async (input: FacultyAssignmentDraft): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.createAssignment(user, input);
        return true;
      } catch {
        setError("Unable to publish the assignment. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );
  return { busy, error, create };
}

export function useSubmissions(user: AuthUser | null, assignmentId: string | null) {
  return useFacultyResource(
    user,
    (u) => facultyService.getSubmissions(u, assignmentId!),
    "Unable to load submissions. Please try again.",
    [assignmentId],
  );
}

export interface GradeSubmissionResult {
  busy: boolean;
  error: string | null;
  grade: (submissionId: string, grade: number, feedback?: string) => Promise<boolean>;
}

export function useGradeSubmission(user: AuthUser | null): GradeSubmissionResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const grade = useCallback(
    async (submissionId: string, value: number, feedback?: string): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.gradeSubmission(user, submissionId, value, feedback);
        return true;
      } catch {
        setError("Unable to save the grade. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );
  return { busy, error, grade };
}

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

export function useFacultyMaterials(user: AuthUser | null) {
  return useFacultyResource(
    user,
    (u) => facultyService.getMaterials(u),
    "Unable to load course materials. Please try again.",
    [],
  );
}

export interface CreateMaterialResult {
  busy: boolean;
  error: string | null;
  create: (input: FacultyMaterialDraft) => Promise<boolean>;
}

export function useCreateMaterial(user: AuthUser | null): CreateMaterialResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = useCallback(
    async (input: FacultyMaterialDraft): Promise<boolean> => {
      if (!user) return false;
      setBusy(true);
      setError(null);
      try {
        await facultyService.createMaterial(user, input);
        return true;
      } catch {
        setError("Unable to upload the material. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user],
  );
  return { busy, error, create };
}

/* ------------------------------------------------------------------ */
/* Students / risk                                                     */
/* ------------------------------------------------------------------ */

export function useStudents(user: AuthUser | null, group?: string) {
  return useFacultyResource(
    user,
    (u) => facultyService.getStudents(u, group),
    "Unable to load your students. Please try again.",
    [group],
  );
}
