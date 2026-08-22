"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/common/modal";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/* Scroll reveal — quiet, once, reduced-motion aware                   */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Section({
  number,
  title,
  note,
  children,
}: {
  number: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-14 first:border-t-0 first:pt-4">
      <Reveal>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="meta text-xs text-primary">{number}</span>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {note ? (
            <p className="w-full max-w-xl text-sm text-muted-foreground sm:ml-auto sm:text-right">
              {note}
            </p>
          ) : null}
        </div>
        <div className="mt-8">{children}</div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sample data — representative of real CampusOne content              */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Dashboard", href: "#", active: true },
  { label: "Schedule", href: "#", active: false },
  { label: "Assignments", href: "#", active: false },
  { label: "Attendance", href: "#", active: false },
];

const SCHEDULE_ITEMS = [
  {
    time: "09:00 – 10:30",
    subject: "Data Structures",
    meta: "CS204 · LAB 204 · Ms. Kavita Rao",
    status: "Completed" as const,
    tone: "outline" as const,
    state: "done" as const,
  },
  {
    time: "10:30 – 12:00",
    subject: "C++ Laboratory",
    meta: "CS206 · LAB 210 · Prof. A. Deshmukh",
    status: "Ongoing" as const,
    tone: "default" as const,
    state: "now" as const,
  },
  {
    time: "13:30 – 15:00",
    subject: "Digital Logic",
    meta: "CS208 · ROOM 112 · Dr. S. Menon",
    status: "Scheduled" as const,
    tone: "secondary" as const,
    state: "next" as const,
  },
];

const ASSIGNMENTS = [
  {
    code: "CS201",
    title: "Loop analysis problem set",
    due: "Due Fri 21 Aug · 17:00",
    status: "Due soon" as const,
    tone: "warning" as const,
    action: true,
  },
  {
    code: "CS204",
    title: "Binary tree traversal report",
    due: "Submitted Mon 18 Aug",
    status: "Submitted" as const,
    tone: "success" as const,
    action: false,
  },
  {
    code: "CS208",
    title: "K-map simplification worksheet",
    due: "Due was Mon 11 Aug",
    status: "Late" as const,
    tone: "destructive" as const,
    action: true,
  },
];

const NOTICES = [
  {
    date: "20 Aug",
    tag: "Examination",
    audience: "Second Year",
    text: "Mid-semester examination schedule published; hall tickets open Monday.",
  },
  {
    date: "19 Aug",
    tag: "Library",
    audience: "All students",
    text: "Library timings extended to 22:00 during the examination period.",
  },
];

const SUBJECT_ATTENDANCE = [
  { subject: "Data Structures", percent: 91.2 },
  { subject: "Digital Logic", percent: 84.6 },
  { subject: "Software Engineering", percent: 68.9 },
];

const ROSTER_ROWS = [
  { name: "Lakshya Sharma", division: "CMPN-A", attendance: "87.4%", status: "Good", tone: "success" as const },
  { name: "Ananya Iyer", division: "CMPN-A", attendance: "72.1%", status: "Watchlist", tone: "warning" as const },
  { name: "Rehan Qureshi", division: "CMPN-B", attendance: "61.8%", status: "At risk", tone: "destructive" as const },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DesignPreviewPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      {/* 01 · Navigation — glass rail, one selected item */}
      <header className="glass-strong sticky top-0 z-30 border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <a href="/design-preview" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-display text-sm italic text-primary-foreground"
            >
              C
            </span>
            <span className="font-display text-lg tracking-tight">
              CampusOne
            </span>
          </a>

          <nav aria-label="Preview navigation" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={
                  link.active
                    ? "rounded-lg bg-primary/[0.08] px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/15"
                    : "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span
              aria-hidden="true"
              className="flex h-9 w-9 select-none items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-muted-foreground"
            >
              LS
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Hero — Level 0 content directly on the page */}
        <div className="pb-16 pt-20 sm:pt-24">
          <p className="kicker text-muted-foreground">
            Design preview · CampusOne visual language
          </p>
          <h1 className="display-hero mt-5 max-w-3xl text-5xl sm:text-6xl lg:text-[4.25rem]">
            Quiet paper, warm ink,{" "}
            <span className="italic text-primary">one line of teal.</span>
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
            Every component below is drawn from the same system: Instrument
            Serif speaks only in headlines, Satoshi runs the product, and a
            restrained teal marks what matters. Depth is earned in levels —
            never everywhere at once.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg">
              Primary action
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="secondary">
              Secondary action
            </Button>
          </div>
        </div>

        {/* Typography specimen */}
        <Section
          number="01"
          title="Typography & scale"
          note="Serif for moments · sans for the product · mono for metadata."
        >
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-8 border-l border-border pl-6 sm:pl-10">
              <p className="display-hero text-5xl">Display 48–64</p>
              <p className="font-heading text-2xl font-semibold tracking-tight">
                Section heading 24
              </p>
              <p className="max-w-[58ch] text-base leading-relaxed">
                Body sixteen. The university product reads best when the type
                is calm: generous line height, warm ink on paper, nothing
                shouting for attention.
              </p>
              <p className="meta text-sm text-muted-foreground">
                CS204 · LAB 204 · 10:30 — metadata fourteen, mono
              </p>
            </div>
            <dl className="space-y-5 self-end text-sm">
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">Display</dt>
                <dd className="font-display text-xl italic">Instrument Serif</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">Product</dt>
                <dd className="font-medium">Satoshi / Inter</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Metadata</dt>
                <dd className="meta">IBM Plex Mono</dd>
              </div>
            </dl>
          </div>
        </Section>

        {/* Buttons & controls */}
        <Section
          number="02"
          title="Buttons"
          note="Tiny lift on hover, half-pixel press. No glow, no gradient."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <span aria-hidden="true" className="mx-2 h-6 w-px bg-border" />
            <Button size="sm">Compact</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* Surfaces — three levels side by side */}
        <Section
          number="03"
          title="Surfaces & depth"
          note="L1 hairline · L2 soft card · L3 floating glass. Hierarchy by level, not by volume."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {/* L1 — hairline only */}
            <Reveal>
              <div className="border-t-2 border-primary pt-5">
                <p className="kicker text-muted-foreground">Level 1 — hairline</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Content that sits directly on the page needs no box at all.
                  A rule above, whitespace below.
                </p>
              </div>
            </Reveal>

            {/* L2 — soft card */}
            <Reveal delay={0.06}>
              <div className="card-hover-depth card-surface h-full rounded-2xl border border-border p-5 shadow-card">
                <p className="kicker text-muted-foreground">Level 2 — surface</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  The default card: soft paper fill, hairline border, a shadow
                  that barely lifts it off the page.
                </p>
                <Badge variant="default" className="mt-4">
                  Hover me
                </Badge>
              </div>
            </Reveal>

            {/* L3 — glass panel */}
            <Reveal delay={0.12}>
              <div className="glass-panel h-full rounded-2xl border border-border p-5 shadow-float">
                <p className="kicker text-muted-foreground">Level 3 — glass</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Reserved for navigation, popovers and hero panels. Translucent
                  white over the page, blurred behind, never neon.
                </p>
                <Badge variant="secondary" className="mt-4">
                  Floating layer
                </Badge>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Stat figures */}
        <Section
          number="04"
          title="Stat figures"
          note="Numbers are set in serif — they are read, not glanced."
        >
          <div className="grid gap-x-14 gap-y-10 sm:grid-cols-3">
            <Reveal>
              <div className="border-t border-border pt-5">
                <p className="kicker text-muted-foreground">Attendance</p>
                <p className="stat-number mt-3 text-6xl tabular">87.4%</p>
                <p className="mt-2 text-sm font-medium text-success">
                  Above the 75% threshold
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="border-t border-border pt-5">
                <p className="kicker text-muted-foreground">Classes today</p>
                <p className="stat-number mt-3 text-6xl tabular">04</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Two laboratories, two lectures
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="border-t border-border pt-5">
                <p className="kicker text-muted-foreground">Need attention</p>
                <p className="stat-number mt-3 text-6xl tabular">03</p>
                <p className="mt-2 text-sm font-medium text-warning">
                  One late · two due this week
                </p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Schedule timeline */}
        <Section
          number="05"
          title="Schedule timeline"
          note="The live lecture holds the strongest hierarchy; the past recedes."
        >
          <ol className="max-w-2xl space-y-0">
            {SCHEDULE_ITEMS.map((item) => (
              <li key={item.subject} className="relative flex gap-5 pb-8 last:pb-0">
                {/* rail */}
                <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
                  <span
                    className={
                      item.state === "now"
                        ? "h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15"
                        : item.state === "done"
                          ? "h-2 w-2 rounded-full bg-surface-4"
                          : "h-2 w-2 rounded-full bg-border"
                    }
                  />
                  <span
                    className={
                      item.state === "now"
                        ? "mt-1.5 w-px flex-1 bg-primary/25"
                        : "mt-1.5 w-px flex-1 bg-border"
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p
                      className={
                        item.state === "done"
                          ? "meta text-sm text-muted-foreground/70"
                          : "meta text-sm text-muted-foreground"
                      }
                    >
                      {item.time}
                    </p>
                    <Badge variant={item.tone}>{item.status}</Badge>
                  </div>
                  <p
                    className={
                      item.state === "done"
                        ? "mt-1.5 text-base font-medium text-muted-foreground"
                        : "mt-1.5 text-base font-medium tracking-tight"
                    }
                  >
                    {item.subject}
                  </p>
                  <p className="meta mt-1 text-sm text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Assignments + notices — asymmetric pairing */}
        <Section
          number="06"
          title="Assignments & notices"
          note="Status is instant; the action stays visible."
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <ul className="divide-y divide-border rounded-2xl border border-border card-surface shadow-card">
                {ASSIGNMENTS.map((assignment) => (
                  <li
                    key={assignment.code}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
                  >
                    <span className="meta w-14 shrink-0 text-sm text-muted-foreground">
                      {assignment.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {assignment.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {assignment.due}
                      </span>
                    </span>
                    <Badge variant={assignment.tone}>{assignment.status}</Badge>
                    {assignment.action ? (
                      <Button size="sm">Submit</Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        Submitted
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="kicker flex items-center gap-2 text-muted-foreground">
                <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
                Notices
              </p>
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {NOTICES.map((notice) => (
                  <li key={notice.text} className="py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <Badge variant="outline">{notice.tag}</Badge>
                      <span className="meta text-xs text-muted-foreground">
                        {notice.date}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{notice.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notice.audience}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Attendance progress */}
        <Section
          number="07"
          title="Progress & thresholds"
          note="Quiet bars with a threshold tick — no gauges, no glow."
        >
          <div className="max-w-xl space-y-6">
            {SUBJECT_ATTENDANCE.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-medium">{subject.subject}</p>
                  <p
                    className={`tabular text-sm font-semibold ${
                      subject.percent >= 75
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {subject.percent.toFixed(1)}%
                  </p>
                </div>
                <Progress
                  value={subject.percent}
                  threshold={75}
                  tone={subject.percent >= 75 ? "success" : "destructive"}
                  className="mt-2"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              The vertical tick marks the institutional 75% requirement.
            </p>
          </div>
        </Section>

        {/* Table */}
        <Section
          number="08"
          title="Table"
          note="Hairline dividers, quiet headers, semantic pills only where needed."
        >
          <div className="card-surface overflow-hidden rounded-2xl border border-border shadow-card">
            <Table>
              <TableHead>
                <TableRow className="hover:bg-transparent">
                  <TableHeader>Student</TableHeader>
                  <TableHeader>Division</TableHeader>
                  <TableHeader>Attendance</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {ROSTER_ROWS.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="meta text-muted-foreground">
                      {row.division}
                    </TableCell>
                    <TableCell className="tabular">{row.attendance}</TableCell>
                    <TableCell>
                      <Badge variant={row.tone}>{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* Dialog + interaction summary */}
        <Section
          number="09"
          title="Dialog & interaction"
          note="Focus moves in, Escape closes, the page dims quietly."
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="card-surface rounded-2xl border border-border p-6 shadow-card">
              <p className="kicker flex items-center gap-2 text-muted-foreground">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                Create flows
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Dialogs float on the elevated glass layer with a dimmed,
                blurred backdrop. Form fields keep hairline borders and a teal
                focus ring.
              </p>
              <Button className="mt-5" onClick={() => setModalOpen(true)}>
                Open dialog
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
              <p className="kicker text-muted-foreground">Hover language</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li className="border-b border-border pb-3">
                  Buttons lift a half pixel and deepen one step of tone.
                </li>
                <li className="border-b border-border pb-3">
                  Cards rise 2–3px; their border warms toward teal.
                </li>
                <li>
                  Rows tint softly. The cursor stays the browser&apos;s own.
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <footer className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            This laboratory validates the visual language before it scales to
            Student, Faculty and Admin surfaces.
          </p>
        </footer>
      </main>

      {/* Modal demo */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eyebrow="Assignments"
        title="Create assignment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="dp-subject" className="text-sm font-medium">
              Subject
            </label>
            <Input id="dp-subject" placeholder="Data Structures" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="dp-due" className="text-sm font-medium">
              Due date
            </label>
            <Input id="dp-due" type="date" />
          </div>
          <p className="text-xs text-muted-foreground">
            Fields use hairline borders; focus draws the teal ring.
          </p>
        </div>
      </Modal>
    </div>
  );
}
