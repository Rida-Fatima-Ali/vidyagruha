"use client";

import { useMemo, useState } from "react";
import { Info, RefreshCw } from "lucide-react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import { AttendanceSummary } from "@/components/student/attendance-summary";
import { useAttendance } from "@/hooks/use-student";

type Filter = "all" | "at-risk";

export default function StudentAttendancePage() {
  const { data, loading, error, refresh } = useAttendance();
  const [filter, setFilter] = useState<Filter>("all");

  const subjects = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((subject) => subject.status !== "good");
  }, [data, filter]);

  const atRiskCount = data?.filter((subject) => subject.status !== "good").length ?? 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Second Year · Semester 3"
          title="Attendance"
          description="Track your attendance by subject against the 75% eligibility threshold."
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refresh()}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Refresh
              </Button>
              <SegmentedControl<Filter>
                ariaLabel="Filter attendance"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: "All subjects", count: data?.length ?? 0 },
                  { value: "at-risk", label: "At risk", count: atRiskCount },
                ]}
              />
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttendanceSummary
              subjects={subjects}
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
                How eligibility works
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="text-foreground/90">
                    You must maintain at least <span className="font-medium">75%</span> attendance in every subject to sit the end-semester exam.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="text-foreground/90">
                    Medical leave can be claimed through your class advisor within seven days.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="text-foreground/90">
                    Your faculty marks attendance at the start of every session.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
