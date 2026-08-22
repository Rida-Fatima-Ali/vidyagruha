"use client";

import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { AssignmentsManager } from "@/components/faculty/assignments-manager";

export default function FacultyAssignmentsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Assignments"
          title="Assignments"
          description="Publish assignments and watch them appear in your students' assignments tab instantly. Deadlines, marks and attached materials are all shared from one store."
        />
        <AssignmentsManager />
      </div>
    </PageTransition>
  );
}
