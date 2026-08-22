"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/common/empty-state";
import { scheduleOverrideMarkers, subjectName } from "@/services/schedule";
import { DEMO_NOW } from "@/constants/demo";
import type { StudentEvent } from "@/types/student";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

const SHORT_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

export function MonthCalendar({
  events,
  loading,
}: {
  events: StudentEvent[];
  loading: boolean;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  const eventByDay = new Map<number, StudentEvent[]>();
  const monthEvents: StudentEvent[] = [];
  for (const event of events) {
    const date = new Date(event.date);
    if (date.getFullYear() === year && date.getMonth() === month) {
      monthEvents.push(event);
      const day = date.getDate();
      const bucket = eventByDay.get(day) ?? [];
      bucket.push(event);
      eventByDay.set(day, bucket);
    }
  }

  const markerByDay = new Map<number, ReturnType<typeof scheduleOverrideMarkers>>();
  for (const marker of scheduleOverrideMarkers(year, month)) {
    const bucket = markerByDay.get(marker.day) ?? [];
    bucket.push(marker);
    markerByDay.set(marker.day, bucket);
  }

  const today = DEMO_NOW;
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  function moveMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            {MONTH_FORMATTER.format(cursor)}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => moveMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => moveMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {weekday}
            </div>
          ))}
          {Array.from({ length: totalCells }).map((_, index) => {
            const day = index - offset + 1;
            if (day < 1 || day > daysInMonth) {
              return <div key={index} className="min-h-14 sm:min-h-16" />;
            }
            const dayEvents = eventByDay.get(day) ?? [];
            const dayMarkers = markerByDay.get(day) ?? [];
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={index}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-start rounded-lg border p-1 sm:min-h-16 sm:p-1.5",
                  isToday
                    ? "border-primary/50 bg-primary/[0.07]"
                    : "border-border bg-surface-2/40",
                )}
              >
                <span
                  className={cn(
                    "tabular text-xs font-medium",
                    isToday ? "text-primary" : "text-foreground/90",
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <span
                      key={event.id}
                      aria-hidden="true"
                      title={event.title}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ))}
                  {dayMarkers.slice(0, 2).map((marker) => (
                    <span
                      key={`${marker.day}-${marker.code}`}
                      aria-hidden="true"
                      title={`Timetable change: ${subjectName(marker.code)}`}
                      className="h-1.5 w-1.5 rounded-full bg-warning"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          Events and deadlines
          <span
            aria-hidden="true"
            className="ml-2 h-1.5 w-1.5 rounded-full bg-warning"
          />
          Days with timetable changes.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="font-heading text-sm font-semibold tracking-tight">
            Events this month
          </h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-5" aria-busy="true">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
          </div>
        ) : monthEvents.length === 0 ? (
          <EmptyState
            className="rounded-none border-0 py-10"
            title="Nothing this month"
            description="No campus events are scheduled in this month."
          />
        ) : (
          <ul className="divide-y divide-border">
            {monthEvents.map((event) => {
              const date = new Date(event.date);
              return (
                <li key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex w-11 shrink-0 flex-col items-center rounded-lg border border-border bg-surface-2 py-1.5">
                    <span className="tabular text-sm font-semibold leading-none text-primary">
                      {date.getDate()}
                    </span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {SHORT_FORMATTER.format(date).split(" ")[1]}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{event.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {event.location}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
