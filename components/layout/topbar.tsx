"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/navigation/global-search";
import { NotificationsPopover } from "@/components/navigation/notifications-popover";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { UserMenu } from "@/components/navigation/user-menu";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="glass-strong sticky top-0 z-20 border-b border-border">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="max-w-md flex-1">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggle />
          <NotificationsPopover />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
