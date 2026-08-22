"use client";

import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { AssignmentsList } from "@/components/student/assignments-list";
import { useAssignments } from "@/hooks/use-student";

export default function StudentSubmissionsPage() {
  const { data, loading, error, refresh } = useAssignments();

  const submissions = (data ?? []).filter(
    (assignment) =>
      assignment.status === "submitted" || assignment.status === "graded" || assignment.status === "late",
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Second Year · Semester 3"
          title="Submissions"
          description="Work you've submitted — or should have. Grades appear here once your faculty evaluates them."
        />

        <AssignmentsList
          assignments={submissions}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
          showViewAll={false}
          emptyTitle="No submissions yet"
          emptyDescription="When you submit assignments from the assignments page, they'll show up here with their status."
        />
      </div>
    </PageTransition>
  );
}
