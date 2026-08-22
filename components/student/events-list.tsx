import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { formatShortDate, formatTime } from "@/utils/date";
import type { StudentEvent } from "@/types/student";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", { month: "short" });

function dateBlock(date: string): { month: string; day: string } {
  const parsed = new Date(date);
  return {
    month: MONTH_FORMATTER.format(parsed),
    day: String(parsed.getDate()),
  };
}

export interface EventsListProps {
  events: StudentEvent[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  limit?: number;
  showViewAll?: boolean;
}

export function EventsList({
  events,
  loading,
  error,
  onRetry,
  limit,
  showViewAll = true,
}: EventsListProps) {
  const visible = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  return (
    <Panel
      title="Upcoming events"
      description="Campus and opportunity calendar"
      flush
      action={
        showViewAll ? (
          <Link
            href="/student/events"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="Nothing scheduled yet"
          description="Upcoming campus events and opportunities will show up here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((event, index) => {
            const block = dateBlock(event.date);
            const isNext = index === 0;
            return (
              <li
                key={event.id}
                className="flex items-start gap-3.5 px-5 py-3.5 transition-colors duration-200 hover:bg-surface-2/50"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg ring-1 ring-inset",
                    isNext
                      ? "bg-primary/[0.07] text-primary ring-primary/20"
                      : "bg-surface-2 text-muted-foreground ring-border/60",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase leading-none">
                    {block.month}
                  </span>
                  <span className="tabular mt-0.5 text-base font-semibold leading-none">
                    {block.day}
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{formatShortDate(event.date)} · {formatTime(event.date)}</span>
                    <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {event.location}
                    </span>
                  </p>
                  {event.deadline ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-warning">
                      <CalendarClock className="h-3 w-3" aria-hidden="true" />
                      Register by {formatShortDate(event.deadline)}
                    </p>
                  ) : null}
                </div>

                <Badge variant="outline" className="shrink-0">
                  {event.type}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
