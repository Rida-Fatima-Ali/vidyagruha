"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CheckCheck,
  LoaderCircle,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useSaveAttendance } from "@/hooks/use-faculty";
import { formatShortDate } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { MarkStatus, SessionAttendance } from "@/types/attendance";
import type { AttendanceSessionLite } from "@/types/attendance";
import { AttendanceUndoPortal } from "@/components/ui/undo-toast";

export interface WorkbenchRow {
  student: {
    id: string;
    rollNo: string;
    name: string;
    group: string;
    groupSlug: string;
  };
  percent: number;
  threshold: number;
  missingAssignments: number;
}

export interface AttendanceWorkbenchProps {
  session: AttendanceSessionLite;
  /** Saved records for this session, when already marked. */
  saved: SessionAttendance | null;
  rows: WorkbenchRow[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onSaved: () => void;
}

const STATUS_META: Record<MarkStatus, { label: string; active: string }> = {
  present: { label: "Present", active: "bg-success/12 text-success ring-1 ring-inset ring-success/30" },
  late: { label: "Late", active: "bg-warning/12 text-warning ring-1 ring-inset ring-warning/30" },
  absent: { label: "Absent", active: "bg-destructive/12 text-destructive ring-1 ring-inset ring-destructive/30" },
};

const ORDER: MarkStatus[] = ["present", "late", "absent"];

export function AttendanceWorkbench({
  session,
  saved,
  rows,
  loading,
  error,
  onRetry,
  onSaved,
}: AttendanceWorkbenchProps) {
  const { user } = useAuth();
  const saveManager = useSaveAttendance(user);
  const [query, setQuery] = useState("");

  const [records, setRecords] = useState<Record<string, MarkStatus>>(() => {
    const initial: Record<string, MarkStatus> = {};
    for (const row of rows) initial[row.student.id] = "present";
    if (saved) {
      for (const record of saved.records) initial[record.studentId] = record.status;
    }
    return initial;
  });
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [undoMessage, setUndoMessage] = useState<string | null>(null);
  const pendingPayloadRef = useRef<{ date: string; code: string; groupSlug: string; payload: { studentId: string; status: MarkStatus }[] } | null>(null);
  const previousRecordsRef = useRef<Record<string, MarkStatus> | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.student.name.toLowerCase().includes(term) ||
        row.student.rollNo.includes(term),
    );
  }, [rows, query]);

  const summary = useMemo(() => {
    const counts = { present: 0, late: 0, absent: 0 };
    for (const row of rows) {
      const status = records[row.student.id] ?? "present";
      counts[status] += 1;
    }
    return counts;
  }, [records, rows]);

  const allPresent = summary.absent === 0 && summary.late === 0;

  function setStatus(studentId: string, status: MarkStatus) {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
    setDirty(true);
    setJustSaved(false);
  }

  function markAllPresent() {
    const next: Record<string, MarkStatus> = {};
    for (const row of rows) next[row.student.id] = "present";
    setRecords(next);
    setDirty(true);
    setJustSaved(false);
  }

  async function handleSave(): Promise<void> {
    const payload = rows.map((row) => ({
      studentId: row.student.id,
      status: records[row.student.id] ?? "present",
    }));
    // Store previous records for potential undo
    previousRecordsRef.current = { ...records };
    pendingPayloadRef.current = { date: session.date, code: session.code, groupSlug: session.groupSlug, payload };
    const presentCount = payload.filter((p) => p.status === "present").length;
    setUndoMessage(`Attendance marked for ${presentCount} students`);
  }

  const commitSave = useCallback(async () => {
    const pending = pendingPayloadRef.current;
    if (!pending) return;
    const ok = await saveManager.save(pending.date, pending.code, pending.groupSlug, pending.payload);
    if (ok) {
      setDirty(false);
      setJustSaved(true);
      onSaved();
    }
    setUndoMessage(null);
    pendingPayloadRef.current = null;
  }, [saveManager, onSaved]);

  const handleUndo = useCallback(() => {
    if (previousRecordsRef.current) {
      setRecords(previousRecordsRef.current);
      previousRecordsRef.current = null;
    }
    pendingPayloadRef.current = null;
    setUndoMessage(null);
    setDirty(true);
    setJustSaved(false);
  }, []);

  return (
    <>
    <Panel
      title={session.subject}
      description={`${session.start}–${session.end} · ${session.room} · ${formatShortDate(session.date)}`}
      action={
        saved || justSaved ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Saved
          </Badge>
        ) : null
      }
      flush
    >
      {/* Toolbar */}
      <div className="border-b border-border/90 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or roll number"
              className="pl-9"
              aria-label="Search students"
            />
          </div>
          <Button
            variant={allPresent ? "outline" : "secondary"}
            size="sm"
            onClick={markAllPresent}
            disabled={rows.length === 0}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            All present
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={rows.length === 0 || (!dirty && !saved) || saveManager.busy}
            onClick={() => void handleSave()}
          >
            {saveManager.busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            {saved && !dirty ? "Update" : "Save attendance"}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {rows.length} students
          </span>
          <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
          <span className="font-medium text-success">{summary.present} present</span>
          <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
          <span className="font-medium text-warning">{summary.late} late</span>
          <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
          <span className="font-medium text-destructive">{summary.absent} absent</span>
          {saveManager.error ? (
            <span className="font-medium text-destructive" role="alert">
              {saveManager.error}
            </span>
          ) : null}
        </div>
      </div>

      {/* Rows */}
      {loading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          No students match “{query}”.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((row) => {
            const status = records[row.student.id] ?? "present";
            const atRisk = row.percent > 0 && row.percent < row.threshold;
            return (
              <li
                key={row.student.id}
                className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={row.student.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="truncate text-sm font-medium">{row.student.name}</p>
                      <span className="tabular text-xs text-muted-foreground">
                        {row.student.rollNo}
                      </span>
                      {atRisk ? (
                        <Badge variant="destructive">below 75%</Badge>
                      ) : row.missingAssignments > 0 ? (
                        <Badge variant="warning">
                          {row.missingAssignments} missing
                        </Badge>
                      ) : null}
                    </div>
                    {row.percent > 0 ? (
                      <p className="tabular mt-0.5 text-xs text-muted-foreground">
                        Subject attendance {row.percent}%
                      </p>
                    ) : null}
                  </div>
                </div>

                <div
                  role="radiogroup"
                  aria-label={`Mark attendance for ${row.student.name}`}
                  className="grid shrink-0 grid-cols-3 gap-1 rounded-lg border border-border bg-surface-2/60 p-1"
                >
                  {ORDER.map((option) => {
                    const isActive = status === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setStatus(row.student.id, option)}
                        className={cn(
                          "h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                          isActive
                            ? STATUS_META[option].active
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {STATUS_META[option].label}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/90 px-5 py-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {session.group} · {session.room}
        </p>
        <p className="text-xs text-muted-foreground">
          {dirty ? (
            <span className="font-medium text-warning">Unsaved changes</span>
          ) : saved || justSaved ? (
            <span className="font-medium text-success">Attendance recorded</span>
          ) : (
            "Not recorded yet"
          )}
        </p>
      </footer>
    </Panel>
    <AttendanceUndoPortal
      message={undoMessage}
      onUndo={handleUndo}
      onExpire={() => void commitSave()}
    />
    </>
  );
}
