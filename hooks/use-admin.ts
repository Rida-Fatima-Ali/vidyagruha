"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminService } from "@/services/api/admin";
import { useAsyncResource } from "@/hooks/use-async-resource";
import type {
  AdminAnalyticsData,
  AdminClass,
  AdminDashboardData,
  AdminEventDraft,
  AdminFaculty,
  AdminNotice,
  AdminNoticeDraft,
  AdminNoticeStatus,
  AdminRoom,
  AdminStudent,
  AdminSubject,
  AdminUser,
  ApprovalDecision,
  AttendanceRiskView,
  InstitutionalActivity,
  PendingApproval,
} from "@/types/admin";
import type { CreateScheduleOverrideInput } from "@/types/faculty";

export function useAdminDashboard(): ReturnType<
  typeof useAsyncResource<AdminDashboardData>
> {
  return useAsyncResource(
    adminService.getDashboard,
    "Unable to load the administration dashboard. Please try again.",
  );
}

/* ------------------------------------------------------------------ */
/* Shared guarded resource hook (refetches when deps change)           */
/* ------------------------------------------------------------------ */

function useAdminResource<T>(
  fetcher: () => Promise<T>,
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
    setLoading(true);
    setError(null);
    try {
      setData(await fetcherRef.current());
    } catch {
      setError(errorMessageRef.current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, depsKey]);

  return { data, loading, error, refresh };
}

export function useAdminUsers() {
  return useAdminResource(
    () => adminService.getUsers(),
    "Unable to load the user directory. Please try again.",
    [],
  );
}

export function useAdminStudents(group: string) {
  return useAdminResource(
    () => adminService.getStudents(group || undefined),
    "Unable to load students. Please try again.",
    [group],
  );
}

export function useAdminFaculty() {
  return useAdminResource(
    () => adminService.getFaculty(),
    "Unable to load the faculty directory. Please try again.",
    [],
  );
}

export function useAdminClasses() {
  return useAdminResource(
    () => adminService.getClasses(),
    "Unable to load classes. Please try again.",
    [],
  );
}

export function useAdminSubjects() {
  return useAdminResource(
    () => adminService.getSubjects(),
    "Unable to load subjects. Please try again.",
    [],
  );
}

export function useAdminRooms() {
  return useAdminResource(
    () => adminService.getRooms(),
    "Unable to load rooms. Please try again.",
    [],
  );
}

export function useRoomRadar(weekStart: string, days = 6) {
  return useAdminResource(
    () => adminService.getRoomRadar(weekStart, days),
    "Unable to load the room radar. Please try again.",
    [weekStart, days],
  );
}

export function useAdminSchedule(start: string, days: number) {
  return useAdminResource(
    () => adminService.getSchedule(start, days),
    "Unable to load the institution schedule. Please try again.",
    [start, days],
  );
}

export interface AdminOverrideManagerResult {
  busy: boolean;
  error: string | null;
  createOverride: (input: CreateScheduleOverrideInput) => Promise<boolean>;
  removeOverride: (overrideId: string) => Promise<boolean>;
}

export function useAdminOverrideManager(): AdminOverrideManagerResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOverride = useCallback(async (input: CreateScheduleOverrideInput) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.createScheduleOverride(input);
      return true;
    } catch {
      setError("Unable to save the schedule change. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const removeOverride = useCallback(async (overrideId: string) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.removeScheduleOverride(overrideId);
      return true;
    } catch {
      setError("Unable to remove the schedule change. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, createOverride, removeOverride };
}

export function useAdminNotices() {
  return useAdminResource(
    () => adminService.getNotices(),
    "Unable to load notices. Please try again.",
    [],
  );
}

export interface AdminNoticeManagerResult {
  busy: boolean;
  error: string | null;
  save: (draft: AdminNoticeDraft) => Promise<boolean>;
  setStatus: (id: string, status: AdminNoticeStatus) => Promise<boolean>;
}

export function useAdminNoticeManager(): AdminNoticeManagerResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (draft: AdminNoticeDraft) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.saveNotice(draft);
      return true;
    } catch {
      setError("Unable to save the notice. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const setStatus = useCallback(async (id: string, status: AdminNoticeStatus) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.setNoticeStatus(id, status);
      return true;
    } catch {
      setError("Unable to update the notice. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, save, setStatus };
}

export function useAdminEvents() {
  return useAdminResource(
    () => adminService.getEvents(),
    "Unable to load events. Please try again.",
    [],
  );
}

export interface AdminEventManagerResult {
  busy: boolean;
  error: string | null;
  save: (draft: AdminEventDraft) => Promise<boolean>;
}

export function useAdminEventManager(): AdminEventManagerResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (draft: AdminEventDraft) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.saveEvent(draft);
      return true;
    } catch {
      setError("Unable to save the event. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, save };
}

export interface AdminApprovalsResult {
  pending: PendingApproval[];
  resolved: PendingApproval[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminApprovals(): AdminApprovalsResult {
  const resource = useAdminResource(
    () => adminService.getApprovals(),
    "Unable to load approvals. Please try again.",
    [],
  );
  return {
    pending: resource.data?.pending ?? [],
    resolved: resource.data?.resolved ?? [],
    loading: resource.loading,
    error: resource.error,
    refresh: resource.refresh,
  };
}

export interface AdminApprovalManagerResult {
  busy: boolean;
  error: string | null;
  decide: (id: string, decision: ApprovalDecision) => Promise<boolean>;
}

export function useAdminApprovalManager(): AdminApprovalManagerResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decide = useCallback(async (id: string, decision: ApprovalDecision) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.decideApproval(id, decision);
      return true;
    } catch {
      setError("Unable to update the approval. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, decide };
}

export function useAdminAnalytics() {
  return useAdminResource(
    () => adminService.getAnalytics(),
    "Unable to load analytics. Please try again.",
    [],
  );
}

export function useAdminRisk() {
  return useAdminResource(
    () => adminService.getRisk(),
    "Unable to load attendance risk. Please try again.",
    [],
  );
}

export function useAdminActivity() {
  return useAdminResource(
    () => adminService.getActivity(),
    "Unable to load institutional activity. Please try again.",
    [],
  );
}

export type { AdminAnalyticsData, AdminClass, AdminFaculty, AdminNotice, AdminRoom, AdminStudent, AdminSubject, AdminUser, AttendanceRiskView, InstitutionalActivity };
