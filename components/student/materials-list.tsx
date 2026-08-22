import {
  FileQuestion,
  FileText,
  FlaskConical,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { formatShortDate } from "@/utils/date";
import type { MaterialKind, StudyMaterial } from "@/types/student";

const KIND_CONFIG: Record<
  MaterialKind,
  { label: string; variant: BadgeProps["variant"]; icon: LucideIcon }
> = {
  notes: { label: "Notes", variant: "info", icon: FileText },
  slides: { label: "Slides", variant: "outline", icon: Presentation },
  "question-paper": { label: "Question paper", variant: "warning", icon: FileQuestion },
  "lab-manual": { label: "Lab manual", variant: "success", icon: FlaskConical },
};

export interface MaterialsListProps {
  materials: StudyMaterial[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  limit?: number;
}

export function MaterialsList({
  materials,
  loading,
  error,
  onRetry,
  limit,
}: MaterialsListProps) {
  const visible = materials.slice(0, limit);

  return (
    <Panel
      title="Study materials"
      description="Notes, slides and reference material"
      flush
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState className="border-0 py-10" onRetry={onRetry} description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="border-0 py-10"
          title="No materials uploaded yet"
          description="Files shared by your faculty will appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((material) => {
            const config = KIND_CONFIG[material.kind];
            const Icon = config.icon;

            return (
              <li
                key={material.id}
                className="flex items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface-2/40"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/60",
                    material.kind === "notes"
                      ? "bg-info/10 text-info"
                      : material.kind === "question-paper"
                        ? "bg-warning/10 text-warning"
                        : material.kind === "lab-manual"
                          ? "bg-success/10 text-success"
                          : "bg-surface-2 text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{material.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {material.subject}
                    <span className="tabular ml-1.5">{material.code}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {material.uploadedBy} · {formatShortDate(material.uploadedAt)} ·{" "}
                    {material.pages} pages · {material.sizeKb} KB
                  </p>
                </div>

                <Badge variant={config.variant} className="shrink-0">
                  {config.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
