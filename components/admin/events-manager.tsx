"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, LoaderCircle, Plus, Ticket, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useAdminEvents, useAdminEventManager } from "@/hooks/use-admin";
import { formatDayLabel } from "@/utils/date";
import type { AdminEvent, AdminEventDraft, AdminEventStatus, AdminNoticeAudience } from "@/types/admin";

type StatusFilter = AdminEventStatus | "all";

const STATUS_LABEL: Record<AdminEventStatus, string> = {
  upcoming: "Upcoming",
  open: "Open",
  closed: "Closed",
  past: "Past",
};

const STATUS_VARIANT: Record<AdminEventStatus, "info" | "success" | "warning" | "secondary"> = {
  upcoming: "info",
  open: "success",
  closed: "warning",
  past: "secondary",
};

const EVENT_TYPES = ["Hackathon", "Workshop", "Seminar", "Sports", "Fest", "Lecture"];

const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecomm.",
  "Artificial Intelligence & ML",
  "Mechanical Engineering",
  "Civil Engineering",
];

const AUDIENCE_LABEL: Record<AdminNoticeAudience, string> = {
  institution: "Whole institution",
  department: "Department",
  class: "Class",
  students: "Students only",
  faculty: "Faculty only",
};

export function EventsManager() {
  const { data, loading, error, refresh } = useAdminEvents();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [creating, setCreating] = useState(false);

  const events = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((event) => event.status === filter)),
    [events, filter],
  );

  return (
    <Panel
      title="Events"
      description="Campus events with registrations at a glance"
      flush
      action={
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<StatusFilter>
            ariaLabel="Filter events by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "upcoming", label: "Upcoming" },
              { value: "open", label: "Open" },
              { value: "past", label: "Past" },
            ]}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New event
          </Button>
        </div>
      }
    >
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<CalendarHeart className="h-5 w-5" aria-hidden="true" />}
            title="No events here"
            description="Create an event to share it with the campus."
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((event) => (
            <li key={event.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="truncate">{event.title}</span>
                  <Badge variant={STATUS_VARIANT[event.status]}>{STATUS_LABEL[event.status]}</Badge>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{event.type}</span>
                  <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                  <span className="tabular">{formatDayLabel(event.date)}</span>
                  <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                  <span>{event.location}</span>
                  {event.department ? (
                    <>
                      <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                      <span>{event.department}</span>
                    </>
                  ) : null}
                  {event.audience && event.audience !== "institution" ? (
                    <>
                      <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                      <span className="capitalize">{AUDIENCE_LABEL[event.audience]}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex w-36 shrink-0 flex-col gap-1 sm:items-end">
                <span className="tabular text-xs text-muted-foreground">
                  {event.registrations}
                  {event.capacity ? ` / ${event.capacity}` : ""} registered
                </span>
                {event.capacity ? (
                  <Progress
                    value={Math.min(100, Math.round((event.registrations / event.capacity) * 100))}
                    tone={regTone(event.registrations, event.capacity)}
                    className="w-full sm:w-28"
                  />
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(event)}>
                  Edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing || creating ? (
        <AdminEventDialog
          key={editing?.id ?? "create"}
          event={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            void refresh();
          }}
        />
      ) : null}
    </Panel>
  );
}

function regTone(registrations: number, capacity: number): ProgressTone {
  const ratio = registrations / capacity;
  if (ratio >= 0.9) return "success";
  if (ratio >= 0.5) return "warning";
  return "default";
}

function AdminEventDialog({
  event,
  onClose,
  onSaved,
}: {
  event: AdminEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const manager = useAdminEventManager();
  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState(event?.type ?? "Workshop");
  const [date, setDate] = useState(event?.date ? event.date.slice(0, 16) : "2026-08-20T14:00");
  const [location, setLocation] = useState(event?.location ?? "");
  const [deadline, setDeadline] = useState(event?.deadline ? event.deadline.slice(0, 16) : "");
  const [capacity, setCapacity] = useState(event?.capacity?.toString() ?? "");
  const [department, setDepartment] = useState(event?.department ?? "");
  const [audience, setAudience] = useState<AdminNoticeAudience>(
    event?.audience ?? "institution",
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [onClose]);

  async function handleSave(): Promise<void> {
    setFormError(null);
    if (!title.trim() || !date || !location.trim()) {
      setFormError("Title, date and location are required.");
      return;
    }
    const draft: AdminEventDraft = {
      id: event?.id,
      title: title.trim(),
      type: type.trim() || "Workshop",
      date,
      location: location.trim(),
      deadline: deadline ? deadline : undefined,
      capacity: capacity ? Number(capacity) : undefined,
      registrations: event?.registrations,
      department: department || undefined,
      audience,
    };
    const ok = await manager.save(draft);
    if (ok) onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lifted"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/90 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {event ? "Edit event" : "New event"}
            </p>
            <h2 id="event-dialog-title" className="mt-1 font-heading text-lg font-semibold tracking-tight">
              {event ? event.title : "Create a campus event"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 -mr-1 -mt-1" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input id="event-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-type">Type</Label>
              <Select id="event-type" value={type} onChange={(event) => setType(event.target.value)}>
                {EVENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-department">Department (optional)</Label>
              <Select id="event-department" value={department} onChange={(event) => setDepartment(event.target.value)}>
                <option value="">All departments</option>
                {DEPARTMENTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-date">Date & time</Label>
            <Input id="event-date" type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-location">Location</Label>
              <Input id="event-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Seminar Hall 1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-deadline">Registration deadline (optional)</Label>
              <Input id="event-deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-audience">Audience</Label>
              <Select id="event-audience" value={audience} onChange={(event) => setAudience(event.target.value as AdminNoticeAudience)}>
                {(Object.keys(AUDIENCE_LABEL) as AdminNoticeAudience[]).map((key) => (
                  <option key={key} value={key}>
                    {AUDIENCE_LABEL[key]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-capacity">Capacity (optional)</Label>
              <Input id="event-capacity" type="number" min={1} value={capacity} onChange={(event) => setCapacity(event.target.value)} />
            </div>
          </div>

          {event ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              {event.registrations} students already registered — kept unchanged.
            </p>
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
            <Button size="sm" disabled={manager.busy} onClick={() => void handleSave()}>
              {manager.busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {event ? "Save changes" : "Create event"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
