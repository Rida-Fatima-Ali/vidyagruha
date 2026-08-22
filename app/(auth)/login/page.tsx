"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Presentation,
  ShieldCheck,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { ROLE_DASHBOARD_PATH } from "@/constants/roles";
import { APP_TAGLINE } from "@/constants/app";
import type { UserRole } from "@/types/auth";

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "student",
    title: "Student",
    description: "Attendance, assignments, materials, notices and more.",
    icon: GraduationCap,
  },
  {
    role: "faculty",
    title: "Faculty",
    description: "Take attendance and manage assignments and submissions.",
    icon: Presentation,
  },
  {
    role: "admin",
    title: "Administrator",
    description: "Manage users, departments, notices and analytics.",
    icon: ShieldCheck,
  },
];

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: CalendarDays,
    title: "Live schedule & attendance",
    description: "Your day at a glance, with attendance tracked per subject.",
  },
  {
    icon: ClipboardList,
    title: "All your work in one place",
    description: "Assignments, materials and submissions — no more hunting.",
  },
  {
    icon: Users,
    title: "One campus, three views",
    description: "Distinct experiences for students, faculty and administrators.",
  },
];

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (ready && user) {
      void router.replace(ROLE_DASHBOARD_PATH[user.role]);
    }
  }, [ready, user, router]);

  function handleSelectRole(role: UserRole) {
    login(role);
    void router.push(ROLE_DASHBOARD_PATH[role]);
  }

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="relative flex min-h-dvh overflow-hidden">
      <section className="relative hidden w-1/2 flex-col justify-between border-r border-border p-12 xl:p-16 lg:flex">
        <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Brand />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 xl:mt-20">
            <p className="kicker text-muted-foreground">
              Smart India Hackathon 2026 · Frontend preview
            </p>
            <h1 className="display-hero mt-6 text-5xl xl:text-6xl">
              Your campus,
              <br />
              connected.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              {APP_TAGLINE} A single place for students, faculty and
              administrators to work together.
            </p>
          </motion.div>

          <motion.ul variants={itemVariants} className="mt-10 space-y-3.5">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary ring-1 ring-inset ring-primary/15">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{feature.title}</span>
                  <span className="block text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </span>
                </span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.p
          variants={itemVariants}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          className="text-xs text-muted-foreground/60"
        >
          Mock authentication — no credentials required.
        </motion.p>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <Brand />
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-center font-heading text-2xl font-semibold tracking-tight">
              Enter your campus
            </h2>
            <p className="mt-1.5 text-center text-sm text-muted-foreground">
              Choose a role to preview that view.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 space-y-3">
            {ROLE_OPTIONS.map((option) => (
              <motion.button
                key={option.role}
                type="button"
                onClick={() => handleSelectRole(option.role)}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-colors duration-200 hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary ring-1 ring-inset ring-primary/15 transition-colors duration-200 group-hover:bg-primary/[0.12]">
                  <option.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight">
                    {option.title}
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            role="note"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-warning/20 bg-warning/[0.06] px-3.5 py-2.5"
          >
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-medium">Development build.</span> Mock
              authentication only — not secure. Real sign-in arrives with the
              backend.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 flex items-center justify-center gap-2">
            <Badge variant="secondary">SIH 2026</Badge>
            <Badge variant="secondary">Frontend preview</Badge>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
