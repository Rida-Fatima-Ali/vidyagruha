"use client";

import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { StudentsManager } from "@/components/faculty/students-manager";

export default function FacultyStudentsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Students"
          title="Students & risk"
          description="A single, shared roster view — attendance below threshold and missing assignments are flagged from the same stores the workbench writes to."
        />
        <StudentsManager />
      </div>
    </PageTransition>
  );
}
