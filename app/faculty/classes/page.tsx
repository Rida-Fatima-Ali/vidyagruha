"use client";

import { PageHeader } from "@/components/common/page-header";
import { PageTransition } from "@/components/common/page-transition";
import { FacultySchedule } from "@/components/faculty/faculty-schedule";

export default function FacultyClassesPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Computer Engineering"
          title="Manage lectures"
          description="Reschedule, cancel, change rooms or add extra lectures for sessions you teach. Changes appear in students' timetables immediately."
        />
        <FacultySchedule />
      </div>
    </PageTransition>
  );
}
