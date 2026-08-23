"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Handshake,
  LoaderCircle,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/common/modal";
import { Panel } from "@/components/common/panel";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useCoverActions, useCoverBoard } from "@/hooks/use-cover";
import { formatDayLabel, formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type {
  CoverCandidate,
  CoverRequestWithCandidates,
  CoverableSession,
} from "@/types/cover";

const REASONS = [
  "Medical leave",
  "FDP / workshop",
  "University duty",
  "Personal emergency",
  "Conference travel",
] as const;

export function CoverBoard() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useCoverBoard();
  const actions = useCoverActions();
  const { toast } = useToast();
  const [composing, setComposing] = useState(false);

  const me = user?.name ?? "";
  const inbox = data?.inbox ?? [];
  const mine = data?.mine ?? [];
  const settled = data?.settled ?? [];

  async function handleAccept(request: CoverRequestWithCandidates): Promise<void> {
    const ok = await actions.accept(request.id);
    if (ok) {
      toast({
        title: `You're covering ${request.subject}`,
        description: `${formatDayLabel(request.date)} · ${request.start}–${request.end} · ${request.room}. The timetable is already updated.`,
        tone: "success",
      });
      await refresh();
    } else if (actions.error) {
      toast({ title: "Could not accept", description: actions.error, tone: "destructive" });
    }
  }

  async function handleCancel(request: CoverRequestWithCandidates): Promise<void> {
    const ok = await actions.cancel(request.id);
    if (ok) {
      toast({ title: "Cover request withdrawn", tone: "default" });
      await refresh();
    }
  }

  return (
    <div className="space-y-6">
      <StatStrip stats={data?.stats} loading={loading} />

      <Panel
        title="Needs cover — you're free"
        description="Colleagues in your department with a clash-free slot see this list."
        flush
        action={
          <Button size="sm" onClick={() => setComposing(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Request cover
          </Button>
        }
      >
        {loading ? (
          <ListSkeleton rows={3} />
        ) : error ? (
          <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
        ) : inbox.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Handshake className="h-5 w-5" aria-hidden="true" />}
              title="Nothing needs you right now"
              description="Open requests you can take without a clash land here instantly."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {inbox.map((request) => (
              <li key={request.id} className="px-5 py-4">
                <RequestSummary request={request} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={actions.busy}
                    onClick={() => void handleAccept(request)}
                  >
                    {actions.pendingId === request.id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    Accept cover
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    One tap — the substitute lands in the student timetable straight away.
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Your requests"
        description="Who was reached, who is free, and who has taken the slot."
        flush
      >
        {loading ? (
          <ListSkeleton rows={2} />
        ) : mine.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
              title="No cover requests raised"
              description="Post one instead of chasing the department WhatsApp group."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {mine.map((request) => (
              <li key={request.id} className="px-5 py-4">
                <RequestSummary request={request} />
                <ReachStrip candidates={request.candidates} />
                {request.status === "open" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 -ml-2"
                    disabled={actions.busy}
                    onClick={() => void handleCancel(request)}
                  >
                    Withdraw request
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recently settled" description="Department history — how fast slots got picked up" flush>
        {loading ? (
          <ListSkeleton rows={2} />
        ) : settled.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No settled requests yet" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {settled.map((request) => (
              <li key={request.id} className="px-5 py-4">
                <RequestSummary request={request} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {composing ? (
        <CoverRequestDialog
          sessions={data?.coverable ?? []}
          facultyName={me}
          onClose={() => setComposing(false)}
          onCreated={() => {
            setComposing(false);
            void refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function StatStrip({
  stats,
  loading,
}: {
  stats?: { open: number; coveringForOthers: number; awaitingCover: number; medianFillMinutes: number | null };
  loading: boolean;
}) {
  const items = [
    { label: "Open in department", value: stats ? String(stats.open) : "—" },
    { label: "You're covering", value: stats ? String(stats.coveringForOthers) : "—" },
    { label: "Awaiting cover", value: stats ? String(stats.awaitingCover) : "—" },
    {
      label: "Median time to fill",
      value:
        stats?.medianFillMinutes != null ? `${stats.medianFillMinutes} min` : "—",
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="card-surface rounded-xl border border-border px-4 py-3.5 shadow-card"
        >
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className={cn("tabular mt-1 font-heading text-xl font-semibold", loading && "opacity-50")}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function RequestSummary({ request }: { request: CoverRequestWithCandidates }) {
  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <span className="truncate">{request.subject}</span>
        <Badge variant="outline" className="px-1.5">
          {request.code}
        </Badge>
        {request.status === "open" ? (
          <Badge variant="warning">Open</Badge>
        ) : request.status === "accepted" ? (
          <Badge variant="success">Covered by {request.acceptedBy}</Badge>
        ) : (
          <Badge variant="secondary">Withdrawn</Badge>
        )}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
        <span className="tabular flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDayLabel(request.date)} · {request.start}–{request.end}
        </span>
        <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {request.room}
        </span>
        <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
        <span>
          {request.requestedBy} · {request.reason}
        </span>
        <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
        <span>{formatRelativeTime(request.requestedAt)}</span>
      </p>
      {request.note ? (
        <p className="mt-1.5 rounded-lg border border-border/70 bg-surface-2/50 px-3 py-2 text-xs text-foreground/90">
          {request.note}
        </p>
      ) : null}
    </div>
  );
}

function ReachStrip({ candidates }: { candidates: CoverCandidate[] }) {
  const free = candidates.filter((candidate) => candidate.free);
  return (
    <div className="mt-2.5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" aria-hidden="true" />
        {candidates.length} colleagues notified · {free.length} free at that hour
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {candidates.map((candidate) => (
          <li
            key={candidate.name}
            title={
              candidate.free
                ? candidate.teachesSubject
                  ? "Free · already teaches this subject"
                  : `Free · ${candidate.loadThatDay} sessions that day`
                : `Busy · ${candidate.clashSubject}`
            }
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
              candidate.free
                ? candidate.teachesSubject
                  ? "bg-success/10 text-success ring-success/25"
                  : "bg-surface-2/70 text-foreground/80 ring-border"
                : "text-muted-foreground/70 ring-border/60 line-through",
            )}
          >
            {candidate.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoverRequestDialog({
  sessions,
  facultyName,
  onClose,
  onCreated,
}: {
  sessions: CoverableSession[];
  facultyName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const actions = useCoverActions();
  const { toast } = useToast();
  const available = useMemo(
    () => sessions.filter((session) => !session.requested),
    [sessions],
  );
  const [sessionId, setSessionId] = useState(available[0]?.id ?? "");
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [note, setNote] = useState("");
  const selected = available.find((session) => session.id === sessionId) ?? null;

  async function handleSubmit(): Promise<void> {
    if (!selected) return;
    const ok = await actions.request({
      code: selected.code,
      date: selected.date,
      reason,
      note: note.trim() || undefined,
    });
    if (ok) {
      toast({
        title: "Cover request posted",
        description: `Department colleagues free at ${selected.start} were notified.`,
        tone: "success",
      });
      onCreated();
    }
  }

  return (
    <Modal
      open
      eyebrow="Cover request"
      title="Hand over one of your lectures"
      onClose={onClose}
      footer={
        available.length === 0 ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={actions.busy || !selected} onClick={() => void handleSubmit()}>
              {actions.busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Post request
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
          {available.length === 0 ? (
            <EmptyState
              title="No sessions to hand over"
              description="Every lecture you own this week already has a live request."
            />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="cover-session">Session</Label>
                <Select
                  id="cover-session"
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                >
                  {available.map((session) => (
                    <option key={session.id} value={session.id}>
                      {formatDayLabel(session.date)} · {session.start} · {session.subject}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cover-reason">Reason</Label>
                <Select id="cover-reason" value={reason} onChange={(event) => setReason(event.target.value)}>
                  {REASONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cover-note">Note for whoever takes it</Label>
                <Input
                  id="cover-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Topic, slides to use, anything they need…"
                />
              </div>

              {selected ? (
                <p className="rounded-lg border border-border/70 bg-surface-2/50 px-3 py-2 text-xs text-muted-foreground">
                  Posting as <span className="font-medium text-foreground">{facultyName}</span> ·{" "}
                  {selected.room} · {selected.start}–{selected.end}. Colleagues with a clash are
                  skipped, so nobody gets a notification they can&apos;t act on.
                </p>
              ) : null}

              {actions.error ? (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {actions.error}
                </p>
              ) : null}
            </>
          )}
      </div>
    </Modal>
  );
}
