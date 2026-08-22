"use client";

import { getNavigationForRole } from "@/constants/navigation";
import { APP_VERSION } from "@/constants/app";
import type { UserRole } from "@/types/auth";
import { Brand } from "./brand";
import { NavItem } from "@/components/navigation/nav-item";

export function SidebarContent({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const groups = getNavigationForRole(role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Brand />
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scroll-soft"
      >
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItem item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.07] px-2.5 py-0.5 font-medium text-primary ring-1 ring-inset ring-primary/15">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          Dev mode
        </span>
        <span className="tabular text-muted-foreground/60">v{APP_VERSION}</span>
      </div>
    </div>
  );
}
