"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CalendarCheck,
  ClipboardList,
  FolderOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const ACTIONS: QuickAction[] = [
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Materials", href: "/student/materials", icon: FolderOpen },
  { label: "Notices", href: "/student/notices", icon: Bell },
  { label: "Calendar", href: "/student/calendar", icon: CalendarDays },
  { label: "Events", href: "/student/events", icon: Sparkles },
];

export function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="border-t border-border pt-5">
      <p className="kicker text-muted-foreground">Shortcuts</p>
      <div className="mt-3 flex flex-wrap gap-x-1 gap-y-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-surface-2 hover:text-primary active:bg-surface-3"
          >
            <action.icon className="h-4 w-4" aria-hidden="true" />
            {action.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
