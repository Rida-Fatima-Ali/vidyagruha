"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CircleAlert,
  Clock,
  DoorOpen,
  LoaderCircle,
  MapPin,
  Plus,
  Undo2,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAdminOverrideManager } from "@/hooks/use-admin";
import { ACADEMIC_SUBJECTS } from "@/mocks/academic";
import { conflictsForProposedSlot } from "@/services/admin";
import { allFacultyNames, availableRooms, facultyFor } from "@/services/schedule";
import { DEMO_WEEK_START } from "@/constants/demo";
import { formatDayLabel, weekDates } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { AdminScheduleSlot } from "@/types/admin";
import type { CreateScheduleOverrideInput } from "@/types/faculty";

type Action = "reschedule" | "cancel" | "room" | "extra" | "substitute";

const TYPE_LABEL: Record<AdminScheduleSlot["type"], string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
};

const ACTIONS: Array<{
  key: Action;
  label: string;
  description: string;
  icon: typeof Clock;
}> = [
  { key: "reschedule", label: "Reschedule", description: "New time or day", icon: Clock },
  { key: "cancel", label: "Cancel", description: "Remove the session", icon: Ban },
  { key: "room", label: "Change room", description: "Move to another room", icon: DoorOpen },
  { key: "extra", label: "Add extra lecture", description: "Additional session", icon: Plus },
  { key: "substitute", label: "Faculty substitute", description: "Assign a covering faculty", icon: Users },
];

export interface AdminScheduleDialogProps {
  slot: AdminScheduleSlot | null;
  createMode?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AdminScheduleDialog({
  slot,
  createMode = false,
  onClose,
  onSaved,
}: AdminScheduleDialogProps) {
  const manager = useAdminOverrideManager();
  const days = weekDates(DEMO_WEEK_START, 7);
  const rooms = availableRooms();
  const allFaculty = allFacultyNames();

  const [action, setAction] = useState<Action | null>(createMode ? "extra" : null);
  const [subjectCode, setSubjectCode] = useState("");
  const [date, setDate] = useState(slot?.date ?? DEMO_WEEK_START);
  const [start, setStart] = useState(slot?.start ?? "");
  const [end, setEnd] = useState(slot?.end ?? "");
  const [room, setRoom] = useState(slot?.room ?? "");
  const [faculty, setFaculty] = useState(slot?.faculty ?? "");
  const [substitute, setSubstitute] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const subject = ACADEMIC_SUBJECTS.find((s) => s.code === subjectCode);
  const owner = slot ? facultyFor(slot.code) : subject?.facultyName ?? "";
  const substitutes = allFaculty.filter((name) => name !== owner);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const conflicts = useMemo(() => {
    const code = slot ? slot.code : subjectCode;
    const effectiveFaculty = slot
      ? action === "substitute" && substitute
        ? substitute
        : slot.faculty
      : faculty;
    const effectiveStart = action === "extra" || action === "reschedule" ? start : slot?.start ?? start;
    const effectiveEnd = action === "extra" || action === "reschedule" ? end : slot?.end ?? end;
    const effectiveRoom = action === "room" && room ? room : slot?.room ?? room;
    if (!code || !effectiveStart || !effectiveEnd || !effectiveRoom || !effectiveFaculty) {
      return [];
    }
    return conflictsForProposedSlot(date, {
      code,
      start: effectiveStart,
      end: effectiveEnd,
      room: effectiveRoom,
      faculty: effectiveFaculty,
    });
  }, [action, slot, subjectCode, date, start, end, room, faculty, substitute]);

  const isCancelled = slot?.status === "cancelled";
  const isExtra = slot?.status === "extra";
  const title = createMode ? "Add an extra lecture" : `${slot?.subject ?? ""}`;
  const eyebrow = createMode
    ? "New institution session"
    : slot
      ? `${formatDayLabel(slot.date)} · ${TYPE_LABEL[slot.type]}`
      : "";

  function resetForm(): void {
    setFormError(null);
    setDate(slot?.date ?? DEMO_WEEK_START);
    setStart(slot?.start ?? "");
    setEnd(slot?.end ?? "");
    setRoom(slot?.room ?? "");
    setSubstitute("");
    setReason("");
  }

  function buildInput(): CreateScheduleOverrideInput | null {
    if (createMode) {
      if (!subjectCode) {
        setFormError("Choose a subject for the extra lecture.");
        return null;
      }
      if (!start || !end || !room || !faculty) {
        setFormError("Set the time, room and faculty for the session.");
        return null;
      }
      return {
        date,
        code: subjectCode,
        kind: "extra",
        toTime: start,
        endTime: end,
        newRoom: room,
        newFaculty: faculty,
        reason: reason.trim() || undefined,
      };
    }
    if (!slot) return null;
    switch (action) {
      case "reschedule":
        if (!start || !end) {
          setFormError("Enter a start and end time.");
          return null;
        }
        return {
          date: slot.date,
          code: slot.code,
          kind: "rescheduled",
          fromTime: slot.start,
          toTime: start,
          endTime: end,
          toDate: date !== slot.date ? date : undefined,
          reason: reason.trim() || undefined,
        };
      case "cancel":
        return {
          date: slot.date,
          code: slot.code,
          kind: "cancelled",
          reason: reason.trim() || undefined,
        };
      case "room":
        if (!room) {
          setFormError("Choose a room.");
          return null;
        }
        return {
          date: slot.date,
          code: slot.code,
          kind: "room_changed",
          newRoom: room,
          reason: reason.trim() || undefined,
        };
      case "extra":
        if (!start || !end || !room) {
          setFormError("Choose a time slot and a room.");
          return null;
        }
        return {
          date,
          code: slot.code,
          kind: "extra",
          toTime: start,
          endTime: end,
          newRoom: room,
          reason: reason.trim() || undefined,
        };
      case "substitute":
        if (!substitute) {
          setFormError("Choose a covering faculty member.");
          return null;
        }
        return {
          date: slot.date,
          code: slot.code,
          kind: "faculty_changed",
          newFaculty: substitute,
          reason: reason.trim() || undefined,
        };
      default:
        return null;
    }
  }

  async function handleSubmit(): Promise<void> {
    setFormError(null);
    if (!createMode && slot && action === "cancel" && (isCancelled || isExtra)) {
      if (slot.overrideId) {
        const ok = await manager.removeOverride(slot.overrideId);
        if (ok) onSaved();
      }
      return;
    }
    const input = buildInput();
    if (!input) return;
    const ok = await manager.createOverride(input);
    if (ok) onSaved();
  }

  async function handleRevert(): Promise<void> {
    if (!slot?.overrideId) return;
    const ok = await manager.removeOverride(slot.overrideId);
    if (ok) onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-schedule-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lifted"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/90 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="admin-schedule-title"
              className="mt-1 flex flex-wrap items-center gap-x-2 font-heading text-lg font-semibold tracking-tight"
            >
              <span className="truncate">{title}</span>
              {slot ? (
                <span className="tabular text-xs font-normal text-muted-foreground">
                  {slot.code}
                </span>
              ) : null}
            </h2>
            {slot ? (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                <span className="tabular">{slot.start}–{slot.end}</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                <span>{slot.room}</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                <span>{slot.group}</span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Create a brand-new session on the institution timetable.
              </p>
            )}
            {slot?.adjustment && slot.status !== "normal" ? (
              <p className="mt-1 text-xs font-medium text-warning">
                {slot.adjustment.note}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mr-1 -mt-1"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {createMode ? (
            <div className="space-y-4 rounded-xl border border-border bg-surface-2/30 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-subject">Subject</Label>
                <Select
                  id="create-subject"
                  value={subjectCode}
                  onChange={(event) => {
                    setSubjectCode(event.target.value);
                    const chosen = ACADEMIC_SUBJECTS.find(
                      (subjectItem) => subjectItem.code === event.target.value,
                    );
                    setFaculty(chosen?.facultyName ?? "");
                    setFormError(null);
                  }}
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {ACADEMIC_SUBJECTS.map((subjectItem) => (
                    <option key={subjectItem.code} value={subjectItem.code}>
                      {subjectItem.name} · {subjectItem.code}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="create-date">Date</Label>
                  <Select
                    id="create-date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {formatDayLabel(day)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-room">Room</Label>
                  <Select
                    id="create-room"
                    value={room}
                    onChange={(event) => setRoom(event.target.value)}
                  >
                    <option value="" disabled>
                      Select a room
                    </option>
                    {rooms.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="create-start">Start time</Label>
                  <Input
                    id="create-start"
                    type="time"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-end">End time</Label>
                  <Input
                    id="create-end"
                    type="time"
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-faculty">Faculty</Label>
                <Select
                  id="create-faculty"
                  value={faculty}
                  onChange={(event) => setFaculty(event.target.value)}
                >
                  <option value="" disabled>
                    Select faculty
                  </option>
                  {allFaculty.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ACTIONS.map((item) => {
                  const isActive = action === item.key;
                  const cancelLabel =
                    item.key === "cancel"
                      ? isCancelled
                        ? "Restore lecture"
                        : isExtra
                          ? "Remove extra"
                          : item.label
                      : item.label;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setAction(item.key);
                        resetForm();
                      }}
                      aria-pressed={isActive}
                      className={cn(
                        "group flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        isActive
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-card/60 hover:border-border hover:bg-surface-2/60",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium leading-tight">
                        {cancelLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {action ? (
                <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface-2/30 p-4">
                  {action === "cancel" && (isCancelled || isExtra) ? (
                    <p className="text-sm text-muted-foreground">
                      {isCancelled
                        ? "This lecture is currently cancelled. Saving will restore it to the base timetable."
                        : "This is an additional lecture. Saving will remove it from students' timetables."}
                    </p>
                  ) : null}

                  {action === "cancel" && !isCancelled && !isExtra ? (
                    <p className="text-sm text-muted-foreground">
                      Students will see this lecture marked as cancelled in their
                      timetable.
                    </p>
                  ) : null}

                  {action === "reschedule" ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="lecture-date">Date</Label>
                        <Select
                          id="lecture-date"
                          value={date}
                          onChange={(event) => setDate(event.target.value)}
                        >
                          {days.map((day) => (
                            <option key={day} value={day}>
                              {formatDayLabel(day)}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="lecture-start">Start time</Label>
                          <Input
                            id="lecture-start"
                            type="time"
                            value={start}
                            onChange={(event) => setStart(event.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lecture-end">End time</Label>
                          <Input
                            id="lecture-end"
                            type="time"
                            value={end}
                            onChange={(event) => setEnd(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {action === "extra" ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="lecture-date">Date</Label>
                          <Select
                            id="lecture-date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                          >
                            {days.map((day) => (
                              <option key={day} value={day}>
                                {formatDayLabel(day)}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lecture-room">Room</Label>
                          <Select
                            id="lecture-room"
                            value={room}
                            onChange={(event) => setRoom(event.target.value)}
                          >
                            {rooms.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="lecture-start">Start time</Label>
                          <Input
                            id="lecture-start"
                            type="time"
                            value={start}
                            onChange={(event) => setStart(event.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lecture-end">End time</Label>
                          <Input
                            id="lecture-end"
                            type="time"
                            value={end}
                            onChange={(event) => setEnd(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {action === "room" ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="lecture-room">Room</Label>
                      <Select
                        id="lecture-room"
                        value={room}
                        onChange={(event) => setRoom(event.target.value)}
                      >
                        {rooms.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                      <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        Currently {slot?.room}
                      </p>
                    </div>
                  ) : null}

                  {action === "substitute" ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="lecture-substitute">Covering faculty</Label>
                      <Select
                        id="lecture-substitute"
                        value={substitute}
                        onChange={(event) => setSubstitute(event.target.value)}
                      >
                        <option value="" disabled>
                          Select a faculty member
                        </option>
                        {substitutes.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </Select>
                      <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        Assigned to {owner}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}

          {action !== "cancel" || (slot && !isCancelled && !isExtra) ? (
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="lecture-reason">Reason (optional)</Label>
              <Input
                id="lecture-reason"
                placeholder="Shown to students"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          ) : null}

          {conflicts.length > 0 ? (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                {conflicts.length === 1 ? "1 double-booking" : `${conflicts.length} double-bookings`} would be created
              </p>
              <ul className="mt-2 space-y-1.5">
                {conflicts.map((clash) => (
                  <li key={`${clash.type}-${clash.code}-${clash.start}`} className="text-xs text-foreground/80">
                    {clash.type === "room" ? "Room" : "Faculty"} {clash.room || clash.faculty} ·{" "}
                    {clash.subject} ({clash.start}–{clash.end})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {formError || manager.error ? (
            <p className="mt-4 text-sm font-medium text-destructive" role="alert">
              {formError ?? manager.error}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={action === "cancel" && !isCancelled && !isExtra ? "destructive" : "default"}
              size="sm"
              disabled={manager.busy}
              onClick={() => void handleSubmit()}
            >
              {manager.busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {createMode
                ? "Add lecture"
                : action === "cancel"
                  ? isCancelled
                    ? "Restore lecture"
                    : isExtra
                      ? "Remove extra"
                      : "Cancel lecture"
                  : "Save change"}
            </Button>
          </div>
        </div>

        {slot ? (
          <footer className="flex items-center justify-between gap-3 border-t border-border/90 px-5 py-3.5">
            <div>
              {slot.status === "normal" ? (
                <Badge variant="outline">Base timetable</Badge>
              ) : (
                <Badge variant={isCancelled ? "destructive" : "warning"}>
                  {slot.adjustment?.note}
                </Badge>
              )}
            </div>
            {slot.overrideId ? (
              <Button
                variant="outline"
                size="sm"
                disabled={manager.busy}
                onClick={() => void handleRevert()}
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                Revert to base timetable
              </Button>
            ) : null}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
