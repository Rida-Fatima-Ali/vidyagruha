"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { MOCK_SPOTLIGHT } from "@/mocks/dashboard";
import { Badge } from "@/components/ui/badge";

export function Announcement() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  if (!user) {
    return null;
  }

  const data = MOCK_SPOTLIGHT[user.role];

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="announcement-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info ring-1 ring-inset ring-border/50">
          <Megaphone className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-info">
              {data.eyebrow}
            </p>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {data.meta}
            </Badge>
          </div>
          <h2
            id="announcement-heading"
            className="mt-0.5 font-heading text-base font-semibold tracking-tight"
          >
            {data.title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground lg:hidden">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {data.meta}
          </p>
        </div>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {data.body}
      </p>
    </motion.section>
  );
}
