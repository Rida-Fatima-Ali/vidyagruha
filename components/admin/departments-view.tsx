"use client";

import { useMemo } from "react";
import { DepartmentPerformance } from "@/components/admin/department-performance";
import { useAdminDashboard } from "@/hooks/use-admin";
import { StatTiles, type StatTileItem } from "@/components/dashboard/stat-tiles";
import { Building2, GraduationCap, Percent, Users } from "lucide-react";

export function DepartmentsView() {
  const { data, loading, error, refresh } = useAdminDashboard();
  const departments = useMemo(() => data?.departments ?? [], [data]);

  const tiles: StatTileItem[] = departments.length
    ? [
        {
          id: "depts",
          label: "Departments",
          value: departments.length,
          icon: Building2,
          tone: "primary",
        },
        {
          id: "students",
          label: "Students",
          value: departments.reduce((sum, d) => sum + d.students, 0),
          icon: GraduationCap,
          tone: "info",
        },
        {
          id: "faculty",
          label: "Faculty",
          value: departments.reduce((sum, d) => sum + d.faculty, 0),
          icon: Users,
          tone: "success",
        },
        {
          id: "avg",
          label: "Avg attendance",
          value: Math.round(
            departments.reduce((sum, d) => sum + d.attendanceRate, 0) / departments.length,
          ),
          suffix: "%",
          icon: Percent,
          tone: "warning",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <StatTiles items={tiles} />
      <DepartmentPerformance
        departments={departments}
        loading={loading}
        error={error}
        onRetry={() => void refresh()}
      />
    </div>
  );
}
