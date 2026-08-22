"use client";

import { useMemo, useState } from "react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AssignmentsList } from "@/components/student/assignments-list";
import { useAssignments } from "@/hooks/use-student";
import { useToast } from "@/components/ui/toast";
import { studentService } from "@/services/api/student";
import type { AssignmentStatus } from "@/types/student";

type Filter = "all" | "pending" | "late" | "submitted" | "graded";

const FILTER_TO_STATUS: Partial<Record<Filter, AssignmentStatus>> = {
  pending: "pending",
  late: "late",
  submitted: "submitted",
  graded: "graded",
};

export default function StudentAssignmentsPage() {
  const { data, loading, error, refresh } = useAssignments();
  const [filter, setFilter] = useState<Filter>("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const { toast } = useToast();

  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      all: all.length,
      pending: all.filter((item) => item.status === "pending").length,
      late: all.filter((item) => item.status === "late").length,
      submitted: all.filter((item) => item.status === "submitted").length,
      graded: all.filter((item) => item.status === "graded").length,
    };
  }, [data]);

  async function handleSubmit(assignmentId: string) {
    setSubmittingId(assignmentId);
    try {
      await studentService.submitAssignment(assignmentId);
      toast({ title: "Assignment submitted", tone: "success" });
      await refresh();
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", tone: "destructive" });
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Second Year · Semester 3"
          title="Assignments"
          description="Everything due across your subjects, with statuses updated as your faculty grades them."
          actions={
            <SegmentedControl<Filter>
              ariaLabel="Filter assignments"
              value={filter}
              onChange={setFilter}
              className="max-w-full overflow-x-auto"
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "pending", label: "Pending", count: counts.pending },
                { value: "late", label: "Overdue", count: counts.late },
                { value: "submitted", label: "Submitted", count: counts.submitted },
                { value: "graded", label: "Graded", count: counts.graded },
              ]}
            />
          }
        />

        <AssignmentsList
          assignments={data ?? []}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
          onSubmit={handleSubmit}
          submittingId={submittingId}
          statusFilter={FILTER_TO_STATUS[filter]}
          showViewAll={false}
        />
      </div>
    </PageTransition>
  );
}
