"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Radar, TriangleAlert } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useRoomRadar } from "@/hooks/use-admin";
import { DEMO_WEEK_START } from "@/constants/demo";
import { cn } from "@/utils/cn";
import type { RadarCell, RoomRadarView } from "@/types/admin";

function minutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function addMinutes(time: string, delta: number): string {
  const total = minutes(time) + delta;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return minutes(aStart) < minutes(bEnd) && minutes(bStart) < minutes(aEnd);
}

interface Probe {
  sessionId: string;
  date: string;
  hour: string;
  room: string;
}

export function RoomRadar() {
  const { data, loading, error, refresh } = useRoomRadar(DEMO_WEEK_START);
  const [dayIndex, setDayIndex] = useState("0");
  const [probing, setProbing] = useState(false);
  const [probe, setProbe] = useState<Probe | null>(null);

  const day = data?.days[Number(dayIndex)] ?? null;

  if (loading) {
    return (
      <Panel title="Room-clash radar" description="Rooms × time slots for the week" flush>
        <ListSkeleton rows={5} />
      </Panel>
    );
  }

  if (error || !data || !day) {
    return (
      <Panel title="Room-clash radar" description="Rooms × time slots for the week" flush>
        <ErrorState className="m-5" description={error ?? undefined} onRetry={() => void refresh()} />
      </Panel>
    );
  }

  const session = probe ? data.movable.find((item) => item.id === probe.sessionId) ?? null : null;
  const duration = session ? minutes(session.end) - minutes(session.start) : 60;
  const targetStart = probe?.hour ?? "";
  const targetEnd = probe ? addMinutes(probe.hour, duration) : "";
  const targetDay = probe ? data.days.find((item) => item.date === probe.date) ?? null : null;

  /** Cells the proposed move would collide with — highlighted before saving. */
  const clashingCells = new Set<string>();
  if (probe && session && targetDay) {
    for (const cell of targetDay.cells) {
      if (cell.room !== probe.room) continue;
      const hit = cell.sessions.some(
        (item) =>
          !(item.code === session.code && targetDay.date === session.date) &&
          overlaps(targetStart, targetEnd, item.start, item.end),
      );
      if (hit) clashingCells.add(`${cell.room}-${cell.hour}`);
    }
  }
  const probeClashes = clashingCells.size > 0;
  const showingProbedDay = probe?.date === day.date;

  return (
    <div className="space-y-5">
      <Panel
        title="Room-clash radar"
        description="Occupancy across the week — a red cell is a double-booked room."
        flush
        action={
          <SegmentedControl
            ariaLabel="Day"
            value={dayIndex}
            onChange={setDayIndex}
            options={data.days.map((item, index) => ({
              value: String(index),
              label: item.label.split(",")[0],
              count: item.bookedHours,
            }))}
          />
        }
      >
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[42rem] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-40 text-left text-xs font-medium text-muted-foreground">Room</th>
                {data.hours.map((hour) => (
                  <th key={hour} className="tabular text-xs font-medium text-muted-foreground">
                    {hour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rooms.map((room) => (
                <tr key={room.id}>
                  <th scope="row" className="pr-2 text-left">
                    <span className="block truncate text-xs font-medium">{room.name}</span>
                    <span className="block text-[0.6875rem] text-muted-foreground">
                      {room.block} · {room.capacity} seats
                    </span>
                  </th>
                  {data.hours.map((hour) => {
                    const cell = day.cells.find(
                      (item) => item.room === room.name && item.hour === hour,
                    );
                    const probed =
                      showingProbedDay && probe?.room === room.name
                        ? overlaps(targetStart, targetEnd, hour, addMinutes(hour, 60))
                        : false;
                    const probeClash = probed && clashingCells.has(`${room.name}-${hour}`);
                    return (
                      <RadarTile
                        key={hour}
                        cell={cell}
                        hour={hour}
                        room={room.name}
                        probed={probed}
                        probeClash={probeClash}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <Legend />
        </div>
      </Panel>

      <Panel
        title="Reschedule check"
        description="Pick a lecture and a new slot — clashes light up on the grid before anything is saved."
        action={
          <button
            type="button"
            onClick={() => {
              const next = !probing;
              setProbing(next);
              if (next) {
                const first = data.movable[0];
                if (first) {
                  setProbe({
                    sessionId: first.id,
                    date: data.days[0].date,
                    hour: data.hours[0],
                    room: data.rooms[0].name,
                  });
                }
              } else {
                setProbe(null);
              }
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            {probing ? "Clear" : "Try a move"}
          </button>
        }
      >
        {probing && probe && session ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Lecture" id="radar-session">
                <Select
                  id="radar-session"
                  value={probe.sessionId}
                  onChange={(event) => setProbe({ ...probe, sessionId: event.target.value })}
                >
                  {data.movable.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.subject} · {item.start}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="New day" id="radar-day">
                <Select
                  id="radar-day"
                  value={probe.date}
                  onChange={(event) => {
                    setProbe({ ...probe, date: event.target.value });
                    const index = data.days.findIndex((item) => item.date === event.target.value);
                    if (index >= 0) setDayIndex(String(index));
                  }}
                >
                  {data.days.map((item) => (
                    <option key={item.date} value={item.date}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="New start" id="radar-hour">
                <Select
                  id="radar-hour"
                  value={probe.hour}
                  onChange={(event) => setProbe({ ...probe, hour: event.target.value })}
                >
                  {data.hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Room" id="radar-room">
                <Select
                  id="radar-room"
                  value={probe.room}
                  onChange={(event) => setProbe({ ...probe, room: event.target.value })}
                >
                  {data.rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Verdict
              clash={probeClashes}
              subject={session.subject}
              room={probe.room}
              start={targetStart}
              end={targetEnd}
              collisions={collisionsFor(targetDay, probe.room, targetStart, targetEnd, session.code)}
            />

            <FreeRooms
              data={data}
              date={probe.date}
              start={targetStart}
              end={targetEnd}
              ignoreCode={session.code}
              onPick={(room) => setProbe({ ...probe, room })}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Rescheduling a lab into an occupied room is the classic campus double-booking. Start a
            move to see, live, which rooms are actually free at that hour.
          </p>
        )}
      </Panel>
    </div>
  );
}

function collisionsFor(
  day: RoomRadarView["days"][number] | null,
  room: string,
  start: string,
  end: string,
  ignoreCode: string,
): string[] {
  if (!day) return [];
  const seen = new Map<string, string>();
  for (const cell of day.cells) {
    if (cell.room !== room) continue;
    for (const item of cell.sessions) {
      if (item.code === ignoreCode) continue;
      if (!overlaps(start, end, item.start, item.end)) continue;
      seen.set(item.code, `${item.subject} (${item.start}–${item.end}, ${item.faculty})`);
    }
  }
  return [...seen.values()];
}

function RadarTile({
  cell,
  hour,
  room,
  probed,
  probeClash,
}: {
  cell?: RadarCell;
  hour: string;
  room: string;
  probed: boolean;
  probeClash: boolean;
}) {
  const label = cell
    ? `${room} at ${hour}: ${cell.sessions.map((item) => item.subject).join(", ")}`
    : `${room} at ${hour}: free`;

  return (
    <td className="p-0">
      <div
        title={label}
        aria-label={label}
        className={cn(
          "flex h-9 items-center justify-center rounded-md px-1 text-[0.6875rem] font-medium ring-1 ring-inset transition-colors",
          cell?.clash || probeClash
            ? "bg-destructive/25 text-destructive ring-destructive/50"
            : cell
              ? "bg-primary/12 text-primary ring-primary/20"
              : "bg-surface-2/50 text-muted-foreground/50 ring-border/50",
          probed && !probeClash && "ring-2 ring-success/70",
        )}
      >
        <span className="truncate">
          {cell ? cell.sessions[0].code.replace("CMPN", "") : probed ? "new" : ""}
        </span>
      </div>
    </td>
  );
}

function Legend() {
  const items = [
    { label: "Free", className: "bg-surface-2/60 ring-border/60" },
    { label: "Booked", className: "bg-primary/15 ring-primary/25" },
    { label: "Clash", className: "bg-destructive/25 ring-destructive/50" },
    { label: "Proposed move", className: "bg-surface-2/60 ring-2 ring-success/70" },
  ];
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className={cn("h-3.5 w-6 rounded ring-1 ring-inset", item.className)} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Verdict({
  clash,
  subject,
  room,
  start,
  end,
  collisions,
}: {
  clash: boolean;
  subject: string;
  room: string;
  start: string;
  end: string;
  collisions: string[];
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ring-1 ring-inset",
        clash
          ? "bg-destructive/8 text-destructive ring-destructive/25"
          : "bg-success/8 text-success ring-success/25",
      )}
    >
      {clash ? (
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <p className="font-medium">
          {clash
            ? `${room} is already taken ${start}–${end}`
            : `${room} is free ${start}–${end} — ${subject} can move here`}
        </p>
        {collisions.length > 0 ? (
          <ul className="mt-1 space-y-0.5 text-xs">
            {collisions.map((item) => (
              <li key={item}>Clashes with {item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function FreeRooms({
  data,
  date,
  start,
  end,
  ignoreCode,
  onPick,
}: {
  data: RoomRadarView;
  date: string;
  start: string;
  end: string;
  ignoreCode: string;
  onPick: (room: string) => void;
}) {
  const day = data.days.find((item) => item.date === date) ?? null;
  const free = useMemo(
    () =>
      data.rooms.filter(
        (room) => collisionsFor(day, room.name, start, end, ignoreCode).length === 0,
      ),
    [data.rooms, day, start, end, ignoreCode],
  );

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Radar className="h-3.5 w-3.5" aria-hidden="true" />
        {free.length} of {data.rooms.length} rooms free at that hour
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {free.map((room) => (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onPick(room.name)}
              className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/25 transition-colors hover:bg-success/20"
            >
              {room.name} · {room.capacity}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
