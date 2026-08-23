import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";

export interface ModuleComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Planned capabilities for this module. */
  planned: string[];
  backHref: string;
  backLabel?: string;
  phase?: string;
}

export function ModuleComingSoon({
  title,
  description,
  icon: Icon,
  planned,
  backHref,
  backLabel = "Back to dashboard",
  phase = "Development in progress",
}: ModuleComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col items-start gap-5 rounded-xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:p-7">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-primary shadow-inset-highlight ring-1 ring-inset ring-border/60">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  {title} is being built
                </h2>
                <Badge variant="info">{phase}</Badge>
              </div>
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                This area of VidyaGruha is still under development. When it
                ships, it will replace this page without any change to how you
                get here — your navigation and data stay the same.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-heading text-sm font-semibold">What&apos;s planned</h3>
            <ul className="mt-3 space-y-2.5">
              {planned.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-heading text-sm font-semibold">Until it ships</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Everything related to this module is already reflected on your
              dashboard and in your notifications.
            </p>
            <Link
              href={backHref}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-2/60"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
