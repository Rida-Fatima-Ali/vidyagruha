"use client";

import { Info } from "lucide-react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { EventsList } from "@/components/student/events-list";
import { useEvents } from "@/hooks/use-student";

export default function StudentEventsPage() {
  const { data, loading, error, refresh } = useEvents();

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Campus & opportunities"
          title="Events & Opportunities"
          description="Hackathons, workshops, lectures and campus events — with registration deadlines where they apply."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EventsList
              events={data ?? []}
              loading={loading}
              error={error}
              onRetry={() => void refresh()}
              showViewAll={false}
            />
          </div>

          <div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-heading text-sm font-semibold">
                <Info className="h-4 w-4 text-info" aria-hidden="true" />
                Registering for events
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Events with a <span className="font-medium text-warning">Register by</span>{" "}
                date require you to sign up before the deadline. In-person
                events on campus are open to all students.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Notifications for events relevant to you appear on your
                dashboard and in your notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
