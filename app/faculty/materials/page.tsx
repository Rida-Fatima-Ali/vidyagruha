"use client";

import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { MaterialsManager } from "@/components/faculty/materials-manager";

export default function FacultyMaterialsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Materials"
          title="Course materials"
          description="Upload notes, lab manuals, assignments and references. Files you share are immediately available under your students' Materials tab."
        />
        <MaterialsManager />
      </div>
    </PageTransition>
  );
}
