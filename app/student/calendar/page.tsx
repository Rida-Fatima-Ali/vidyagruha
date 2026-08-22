"use client";

import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { MonthCalendar } from "@/components/student/month-calendar";
import { useEvents } from "@/hooks/use-student";

export default function StudentCalendarPage() {
  const { data, loading, error, refresh } = useEvents();

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Second Year · Semester 3"
          title="Calendar"
          description="Your month at a glance — classes run on your timetable, dots mark campus events and deadlines, and amber dots mark days with timetable changes."
          actions={
            error ? (
              <button
                type="button"
                onClick={() => void refresh()}
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                Retry
              </button>
            ) : null
          }
        />

        <MonthCalendar events={data ?? []} loading={loading} />
      </div>
    </PageTransition>
  );
}
