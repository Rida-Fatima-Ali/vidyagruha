"use client";

import { useState } from "react";
import {
  BookOpen,
  FileQuestion,
  FileText,
  FlaskConical,
  Library,
  Presentation,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialDialog } from "@/components/faculty/material-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  useCreateMaterial,
  useFacultyAssignments,
  useFacultyMaterials,
} from "@/hooks/use-faculty";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { MaterialKind } from "@/types/faculty";

const KIND_META: Record<
  MaterialKind,
  { label: string; icon: typeof BookOpen; iconClass: string }
> = {
  notes: { label: "Notes", icon: BookOpen, iconClass: "text-info" },
  slides: { label: "Slides", icon: Presentation, iconClass: "text-primary" },
  "question-paper": { label: "Question paper", icon: FileQuestion, iconClass: "text-destructive" },
  "lab-manual": { label: "Lab manual", icon: FlaskConical, iconClass: "text-warning" },
  assignment: { label: "Assignment", icon: FileText, iconClass: "text-success" },
  reference: { label: "Reference", icon: Library, iconClass: "text-primary" },
};

export function MaterialsManager() {
  const { user } = useAuth();
  const { data: materials, loading, error, refresh } = useFacultyMaterials(user);
  const { data: assignments } = useFacultyAssignments(user);
  const createManager = useCreateMaterial(user);
  const [dialogOpen, setDialogOpen] = useState(false);

  const subjects = [...new Set((assignments ?? []).map((a) => a.code))].map((code) => ({
    code,
    subject: assignments?.find((a) => a.code === code)?.subject ?? code,
  }));

  return (
    <>
      <Panel
        title="Course materials"
        description="Upload notes, lab manuals, assignments and references for your classes"
        flush
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload
            </Button>
          </>
        }
      >
        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            className="m-5"
            description={error}
            onRetry={() => void refresh()}
          />
        ) : !materials || materials.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
              title="No materials yet"
              description="Uploaded files will appear here and in your students' Materials tab."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {materials.map((material) => {
              const meta = KIND_META[material.kind];
              return (
                <li
                  key={material.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 ring-1 ring-inset ring-border",
                      meta.iconClass,
                    )}
                  >
                    <meta.icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{material.title}</p>
                      <Badge variant="secondary">{meta.label}</Badge>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {material.subject}
                      </span>
                      <span className="tabular">{material.code}</span>
                      <span
                        aria-hidden="true"
                        className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                      />
                      <span>{material.fileName}</span>
                      <span className="tabular">
                        {Math.round(material.sizeKb)} KB · {material.pages} pages
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60"
                      />
                      <span>{formatRelativeTime(material.uploadedAt)}</span>
                    </p>
                    {material.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {material.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <MaterialDialog
        open={dialogOpen}
        subjects={subjects}
        busy={createManager.busy}
        error={createManager.error}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (input) => {
          const ok = await createManager.create(input);
          if (ok) void refresh();
          return ok;
        }}
      />
    </>
  );
}
