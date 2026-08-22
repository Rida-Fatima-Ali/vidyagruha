"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { SubmissionsManager } from "@/components/faculty/submissions-manager";

export default function FacultySubmissionsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Submissions"
          title="Submissions"
          description="Review what's been handed in, grade inline, and leave feedback. Grades land in students' views the moment you save."
        />
        <Suspense fallback={<ListSkeleton rows={6} />}>
          <SubmissionsPageContent />
        </Suspense>
      </div>
    </PageTransition>
  );
}

function SubmissionsPageContent() {
  const searchParams = useSearchParams();
  return <SubmissionsManager initialAssignmentId={searchParams.get("assignment")} />;
}
