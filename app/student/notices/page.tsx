"use client";

import { useMemo, useState } from "react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { NoticesList } from "@/components/student/notices-list";
import { useNotices } from "@/hooks/use-student";
import type { NoticeCategory } from "@/types/student";

type Filter = "all" | NoticeCategory;

export default function StudentNoticesPage() {
  const { data, loading, error, refresh } = useNotices();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      all: all.length,
      important: all.filter((item) => item.category === "important").length,
      academic: all.filter((item) => item.category === "academic").length,
      general: all.filter((item) => item.category === "general").length,
      event: all.filter((item) => item.category === "event").length,
    };
  }, [data]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Institution, department and class"
          title="Notices"
          description="Official updates from your institution, department and class."
          actions={
            <SegmentedControl<Filter>
              ariaLabel="Filter notices"
              value={filter}
              onChange={setFilter}
              className="max-w-full overflow-x-auto"
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "important", label: "Important", count: counts.important },
                { value: "academic", label: "Academic", count: counts.academic },
                { value: "general", label: "General", count: counts.general },
                { value: "event", label: "Events", count: counts.event },
              ]}
            />
          }
        />

        <NoticesList
          notices={data ?? []}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
          categoryFilter={filter === "all" ? undefined : filter}
          showViewAll={false}
        />
      </div>
    </PageTransition>
  );
}
