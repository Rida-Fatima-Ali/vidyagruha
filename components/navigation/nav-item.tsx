"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import type { NavItem as NavItemConfig } from "@/constants/navigation";

export function NavItem({
  item,
  onNavigate,
}: {
  item: NavItemConfig;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (item.comingSoon) {
    const tooltip =
      item.phase === "sih" ? "Coming soon — SIH Phase" : "Coming soon";

    return (
      <span
        aria-disabled="true"
        title={tooltip}
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/40 transition-colors duration-150"
      >
        <item.icon
          className="h-[18px] w-[18px] shrink-0 text-muted-foreground/35"
          aria-hidden="true"
        />
        <span className="flex-1 truncate">{item.title}</span>
        <Badge variant="outline" className="px-1.5 text-[10px] opacity-60">
          {item.phase === "sih" ? "SIH" : "Soon"}
        </Badge>
      </span>
    );
  }

  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-primary/[0.08] text-primary"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground active:bg-surface-3/70",
      )}
    >
      {/* Active indicator bar */}
      {isActive ? (
        <motion.span
          aria-hidden="true"
          layoutId="nav-active-indicator"
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 380, damping: 30 }
          }
        />
      ) : null}

      <item.icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{item.title}</span>
    </Link>
  );
}
