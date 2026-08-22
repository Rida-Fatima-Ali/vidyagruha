"use client";

import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { MaterialsList } from "@/components/student/materials-list";
import { useMaterials } from "@/hooks/use-student";

export default function StudentMaterialsPage() {
  const { data, loading, error, refresh } = useMaterials();

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Second Year · Semester 3"
          title="Materials"
          description="Notes, slides and reference material shared by your faculty. Downloads open the original file."
        />

        <MaterialsList
          materials={data ?? []}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
        />
      </div>
    </PageTransition>
  );
}
