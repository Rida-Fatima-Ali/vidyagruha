"use client";

import { useEffect, useState } from "react";
import {
  Ban,
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
import { useLectureManager } from "@/hooks/use-faculty";
import { useAuth } from "@/hooks/use-auth";
import { allFacultyNames, availableRooms, facultyFor } from "@/services/schedule";
import { formatDayLabel, weekDates } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { FacultyLectureOverview } from "@/types/faculty";
import type { CreateScheduleOverrideInput } from "@/types/faculty";

type Action = "reschedule" | "cancel" | "room" | "extra" | "substitute";

const TYPE_LABEL: Record<FacultyLectureOverview["type"], string> = {
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

export interface ManageLectureDialogProps {
  lecture: FacultyLectureOverview | null;
  weekStart: string;
  onClose: () => void;
  onSaved: () => void;
}

export function ManageLectureDialog({
  lecture,
  weekStart,
  onClose,
  onSaved,
}: ManageLectureDialogProps) {
  const { user } = useAuth();
  const manager = useLectureManager(user);

  const [action, setAction] = useState<Action | null>(null);
  const [date, setDate] = useState(lecture?.date ?? weekStart);
  const [start, setStart] = useState(lecture?.start ?? "");
  const [end, setEnd] = useState(lecture?.end ?? "");
  const [room, setRoom] = useState(lecture?.room ?? "");
  const [substitute, setSubstitute] = useState(
    lecture?.faculty && lecture?.faculty !== facultyFor(lecture.code)
      ? lecture.faculty
      : "",
  );
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const owner = lecture ? facultyFor(lecture.code) : "";
  const days = lecture ? weekDates(weekStart, 7) : [];
  const rooms = availableRooms();
  const substitutes = allFacultyNames().filter((name) => name !== owner);

  useEffect(() => {
    if (!lecture) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [lecture, onClose]);

  if (!lecture) return null;

  const isCancelled = lecture.status === "cancelled";
  const isExtra = lecture.status === "extra";
  const isMovingDay = date !== lecture.date;

  function buildInput(): CreateScheduleOverrideInput | null {
    if (!lecture) return null;
    switch (action) {
      case "reschedule":
        if (!start || !end) {
          setFormError("Enter a start and end time.");
          return null;
        }
        return {
          date: lecture.date,
          code: lecture.code,
          kind: "rescheduled",
          fromTime: lecture.start,
          toTime: start,
          endTime: end,
          toDate: isMovingDay ? date : undefined,
          reason: reason.trim() || undefined,
        };
      case "cancel":
        return {
          date: lecture.date,
          code: lecture.code,
          kind: "cancelled",
          reason: reason.trim() || undefined,
        };
      case "room":
        if (!room) {
          setFormError("Choose a room.");
          return null;
        }
        return {
          date: lecture.date,
          code: lecture.code,
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
          code: lecture.code,
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
          date: lecture.date,
          code: lecture.code,
          kind: "faculty_changed",
          newFaculty: substitute,
          reason: reason.trim() || undefined,
        };
      default:
        return null;
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!lecture) return;
    setFormError(null);

    // Restore a cancelled lecture / drop an extra session by reverting its override.
    if (action === "cancel" && (isCancelled || isExtra)) {
      if (lecture.overrideId) {
        const ok = await manager.removeOverride(lecture.overrideId);
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
    if (!lecture?.overrideId) return;
    const ok = await manager.removeOverride(lecture.overrideId);
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
        aria-labelledby="manage-lecture-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lifted"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/90 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {formatDayLabel(lecture.date)} · {TYPE_LABEL[lecture.type]}
            </p>
            <h2
              id="manage-lecture-title"
              className="mt-1 flex flex-wrap items-center gap-x-2 font-heading text-lg font-semibold tracking-tight"
            >
              <span className="truncate">{lecture.subject}</span>
              <span className="tabular text-xs font-normal text-muted-foreground">
                {lecture.code}
              </span>
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
              <span className="tabular">{lecture.start}–{lecture.end}</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span>{lecture.room}</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span>{lecture.group}</span>
            </p>
            {lecture.adjustment && lecture.status !== "normal" ? (
              <p className="mt-1 text-xs font-medium text-warning">
                {lecture.adjustment.note}
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
                    setFormError(null);
                    setDate(lecture.date);
                    setStart(lecture.start);
                    setEnd(lecture.end);
                    setRoom(lecture.room);
                    setSubstitute("");
                    setReason("");
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
                  <div className="relative">
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
                  <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    Currently {lecture.room}
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

              {action !== "cancel" || (!isCancelled && !isExtra) ? (
                <div className="space-y-1.5">
                  <Label htmlFor="lecture-reason">Reason (optional)</Label>
                  <Input
                    id="lecture-reason"
                    placeholder="Shown to students"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </div>
              ) : null}

              {formError || manager.error ? (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {formError ?? manager.error}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant={action === "cancel" ? "destructive" : "default"}
                  size="sm"
                  disabled={manager.busy}
                  onClick={() => void handleSubmit()}
                >
                  {manager.busy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {action === "cancel"
                    ? isCancelled
                      ? "Restore lecture"
                      : isExtra
                        ? "Remove extra"
                        : "Cancel lecture"
                    : "Save change"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-surface-2/20 px-4 py-3 text-sm text-muted-foreground">
              Pick an action above. Changes are applied immediately and reflected
              in student timetables.
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border/90 px-5 py-3.5">
          <div>
            {lecture.status === "normal" ? (
              <Badge variant="outline">Base timetable</Badge>
            ) : (
              <Badge variant={isCancelled ? "destructive" : "warning"}>
                {lecture.adjustment?.note}
              </Badge>
            )}
          </div>
          {lecture.overrideId ? (
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
      </div>
    </div>
  );
}
