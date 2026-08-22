"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface ModuleGridItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
}

export interface ModuleGridProps {
  title: string;
  description?: string;
  modules: ModuleGridItem[];
}

function ModuleCard({ module }: { module: ModuleGridItem }) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground ring-1 ring-inset ring-border/50 transition-colors duration-200 group-hover:bg-primary/[0.08] group-hover:text-primary">
        <module.icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-heading text-sm font-semibold tracking-tight">
          {module.title}
          {module.comingSoon ? (
            <Badge variant="outline" className="px-1.5 text-[10px]">
              Soon
            </Badge>
          ) : null}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {module.description}
        </span>
      </span>
    </>
  );

  const sharedClasses =
    "group flex items-start gap-3.5 rounded-xl border border-border card-surface p-4 text-left shadow-card transition-colors duration-200 hover:border-primary/30";

  return module.href ? (
    <Link href={module.href} className={sharedClasses}>
      {content}
    </Link>
  ) : (
    <span className={sharedClasses}>{content}</span>
  );
}

export function ModuleGrid({ title, description, modules }: ModuleGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="module-grid-heading">
      <header>
        <h2
          id="module-grid-heading"
          className="font-heading text-base font-semibold tracking-tight"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </header>

      <motion.div
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.045 } },
        }}
      >
        {modules.map((module) => (
          <motion.div
            key={module.title}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <ModuleCard module={module} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
