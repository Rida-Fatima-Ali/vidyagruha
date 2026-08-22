"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CircleAlert, Clock, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import {
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminScheduleDialog } from "@/components/admin/schedule-dialog";
import { useAdminSchedule } from "@/hooks/use-admin";
import { DEMO_TODAY, DEMO_WEEK_START } from "@/constants/demo";
import { formatDayLabel } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { AdminScheduleSlot, ScheduleConflict } from "@/types/admin";

const STATUS_META: Record<AdminScheduleSlot["status"], { label: string; variant: "warning" | "destructive" | "info" }> = {
  cancelled: { label: "Cancelled", variant: "destructive" },
  rescheduled: { label: "Rescheduled", variant: "warning" },
  swapped: { label: "Swapped", variant: "warning" },
  room_changed: { label: "Room changed", variant: "warning" },
  faculty_changed: { label: "Faculty changed", variant: "warning" },
  extra: { label: "Additional", variant: "info" },
  normal: { label: "Scheduled", variant: "info" },
};

const TYPE_LABEL: Record<AdminScheduleSlot["type"], string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
};

function StatusBadge({ status }: { status: AdminScheduleSlot["status"] }) {
  if (status === "normal") return null;
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function conflictSummary(conflict: ScheduleConflict): string {
  const clash = conflict.clashesWith[0];
  if (conflict.type === "room") {
    return `${conflict.subject} (${conflict.start}) and ${clash?.subject ?? "another class"} (${clash?.start ?? ""}) are both booked in ${conflict.room}.`;
  }
  return `${conflict.subject} (${conflict.start}) and ${clash?.subject ?? "another class"} (${clash?.start ?? ""}) overlap for ${conflict.faculty}.`;
}

export function AdminScheduleOverview() {
  const [mode, setMode] = useState<"day" | "week">("day");
  const [tab, setTab] = useState<"timetable" | "changes" | "conflicts">("timetable");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminScheduleSlot | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const start = mode === "day" ? DEMO_TODAY : DEMO_WEEK_START;
  const days = mode === "day" ? 1 : 7;
  const { data, loading, error, refresh } = useAdminSchedule(start, days);
  const slots = useMemo(() => data?.slots ?? [], [data]);
  const conflicts = useMemo(() => data?.conflicts ?? [], [data]);

  const facultyOptions = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.faculty))).sort(),
    [slots],
  );
  const roomOptions = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.room))).sort(),
    [slots],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return slots.filter((slot) => {
      if (facultyFilter !== "all" && slot.faculty !== facultyFilter) return false;
      if (roomFilter !== "all" && slot.room !== roomFilter) return false;
      if (
        query &&
        !slot.subject.toLowerCase().includes(query) &&
        !slot.code.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [slots, facultyFilter, roomFilter, search]);

  const changes = useMemo(() => {
    const byOverride = new Map<string, AdminScheduleSlot>();
    for (const slot of slots) {
      if (slot.overrideId) byOverride.set(slot.overrideId, slot);
    }
    return Array.from(byOverride.values());
  }, [slots]);

  const byDay = useMemo(() => {
    const grouped = new Map<string, AdminScheduleSlot[]>();
    for (const slot of filtered) {
      const list = grouped.get(slot.date) ?? [];
      list.push(slot);
      grouped.set(slot.date, list);
    }
    return grouped;
  }, [filtered]);

  const dateLabel =
    mode === "day" ? formatDayLabel(DEMO_TODAY) : `${formatDayLabel(DEMO_WEEK_START)} – ${formatDayLabel("2026-08-16")}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<"day" | "week">
            ariaLabel="Schedule range"
            value={mode}
            onChange={setMode}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
            ]}
          />
          <SegmentedControl<"timetable" | "changes" | "conflicts">
            ariaLabel="Schedule view"
            value={tab}
            onChange={setTab}
            options={[
              { value: "timetable", label: "Timetable" },
              { value: "changes", label: "Changes", count: changes.length },
              { value: "conflicts", label: "Conflicts", count: conflicts.length },
            ]}
          />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add extra lecture
        </Button>
      </div>

      <Panel
        title={tab === "timetable" ? `Effective timetable · ${dateLabel}` : tab === "changes" ? "Schedule changes" : "Conflict detection"}
        description={
          tab === "timetable"
            ? "Resolved from the weekly timetable plus every schedule change — the same source students see."
            : tab === "changes"
              ? "Date-specific changes applied in this range. Revert any change to restore the base timetable."
              : "Double-bookings by room or faculty, detected live from the effective schedule."
        }
        flush
        action={
          tab === "timetable" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subject or code…"
                aria-label="Search schedule"
                className="h-8 w-44 sm:w-52"
              />
              <Select
                value={facultyFilter}
                onChange={(event) => setFacultyFilter(event.target.value)}
                aria-label="Filter by faculty"
                className="h-8 w-44"
              >
                <option value="all">All faculty</option>
                {facultyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
              <Select
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                aria-label="Filter by room"
                className="h-8 w-44"
              >
                <option value="all">All rooms</option>
                {roomOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => void refresh()}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Refresh
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" disabled={loading} onClick={() => void refresh()}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
          )
        }
      >
        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
        ) : tab === "conflicts" ? (
          <ConflictsList conflicts={conflicts} />
        ) : tab === "changes" ? (
          <ChangesList changes={changes} onManage={setSelected} />
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
              title="No sessions match"
              description="Try clearing the faculty, room or search filters."
            />
          </div>
        ) : (
          <ScheduleTable byDay={byDay} mode={mode} onManage={setSelected} />
        )}
      </Panel>

      {tab === "timetable" && conflicts.length > 0 ? (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-warning">
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
            {conflicts.length} double-booking{conflicts.length === 1 ? "" : "s"} in this range
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open the Conflicts tab to review, or edit a session from the timetable.
          </p>
        </div>
      ) : null}

      {selected ? (
        <AdminScheduleDialog
          key={selected.id}
          slot={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            void refresh();
          }}
        />
      ) : null}

      {createOpen ? (
        <AdminScheduleDialog
          key="create"
          slot={null}
          createMode
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            void refresh();
          }}
        />
      ) : null}
    </>
  );
}

function ScheduleTable({
  byDay,
  mode,
  onManage,
}: {
  byDay: Map<string, AdminScheduleSlot[]>;
  mode: "day" | "week";
  onManage: (slot: AdminScheduleSlot) => void;
}) {
  const days = Array.from(byDay.keys()).sort();

  if (mode === "day") {
    const slots = byDay.get(DEMO_TODAY) ?? [];
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-2/60">
            <tr>
              <TableHeader>Time</TableHeader>
              <TableHeader>Subject</TableHeader>
              <TableHeader>Faculty</TableHeader>
              <TableHeader>Room</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slots.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell>
                  <span className="tabular block text-sm font-medium">{slot.start}–{slot.end}</span>
                </TableCell>
                <TableCell>
                  <span className={cn("block text-sm font-medium", slot.status === "cancelled" && "line-through")}>
                    {slot.subject}
                  </span>
                  <span className="tabular block text-xs text-muted-foreground">{slot.code}</span>
                </TableCell>
                <TableCell className="text-sm">{slot.faculty}</TableCell>
                <TableCell className="text-sm">{slot.room}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{TYPE_LABEL[slot.type]}</TableCell>
                <TableCell>
                  <StatusBadge status={slot.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onManage(slot)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      {days.map((day) => {
        const daySlots = byDay.get(day) ?? [];
        if (daySlots.length === 0) return null;
        return (
          <section key={day} className="border-t border-border/80 first:border-t-0">
            <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {formatDayLabel(day)}
              </h3>
              <span className="text-xs text-muted-foreground">
                {daySlots.length} session{daySlots.length === 1 ? "" : "s"}
              </span>
            </header>
            <ul className="divide-y divide-border">
              {daySlots.map((slot) => (
                <li
                  key={slot.id}
                  className={cn(
                    "flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4",
                    slot.status === "cancelled" && "opacity-70",
                  )}
                >
                  <div className="w-16 shrink-0">
                    <p className="tabular text-sm font-medium">{slot.start}</p>
                    <p className="tabular text-xs text-muted-foreground">{slot.end}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <span className={cn("truncate", slot.status === "cancelled" && "line-through")}>
                        {slot.subject}
                      </span>
                      <span className="tabular shrink-0 text-xs text-muted-foreground">{slot.code}</span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{slot.room}</span>
                      <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                      <span>{slot.faculty}</span>
                      <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                      <span>{TYPE_LABEL[slot.type]}</span>
                    </p>
                    {slot.adjustment && slot.status !== "cancelled" ? (
                      <p className="mt-1 text-xs font-medium text-warning">{slot.adjustment.note}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:ml-2">
                    <StatusBadge status={slot.status} />
                    <Button variant="outline" size="sm" onClick={() => onManage(slot)}>
                      Manage
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ChangesList({
  changes,
  onManage,
}: {
  changes: AdminScheduleSlot[];
  onManage: (slot: AdminScheduleSlot) => void;
}) {
  if (changes.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No changes in this range"
          description="The base timetable is running as scheduled."
        />
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {changes.map((slot) => {
        const meta = STATUS_META[slot.status];
        return (
          <li key={slot.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>{slot.subject}</span>
                <span className="tabular text-xs text-muted-foreground">{slot.code}</span>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDayLabel(slot.date)} · {slot.adjustment?.note ?? slot.room} · {slot.faculty}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onManage(slot)}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Manage
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function ConflictsList({ conflicts }: { conflicts: ScheduleConflict[] }) {
  if (conflicts.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={<CircleAlert className="h-5 w-5" aria-hidden="true" />}
          title="No conflicts detected"
          description="No room or faculty double-bookings found in this range."
        />
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {conflicts.map((conflict) => (
        <li key={conflict.id} className="flex items-start gap-3.5 px-5 py-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25">
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span>{formatDayLabel(conflict.date)}</span>
              <Badge variant={conflict.type === "room" ? "warning" : "destructive"}>
                {conflict.type === "room" ? "Room clash" : "Faculty clash"}
              </Badge>
            </p>
            <p className="mt-0.5 text-sm text-foreground/90">{conflictSummary(conflict)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
