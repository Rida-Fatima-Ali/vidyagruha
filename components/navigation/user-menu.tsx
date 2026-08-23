"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, WifiLow, WifiHigh } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL } from "@/constants/roles";
import { useBandwidth } from "@/components/provider/bandwidth-provider";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { lowBandwidth, setLowBandwidth } = useBandwidth();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  if (!user) {
    return null;
  }

  function handleSignOut() {
    setOpen(false);
    logout();
    void router.replace("/login");
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        className="gap-2 rounded-xl px-2 sm:px-3"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-sm font-medium leading-tight flex items-center gap-1.5">
            {user.name}
            {lowBandwidth && <span title="Lite mode active" className="inline-block h-2 w-2 rounded-full bg-success"></span>}
          </span>
          <span className="block text-[11px] leading-tight text-muted-foreground">
            {ROLE_LABEL[user.role]}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="hidden h-4 w-4 text-muted-foreground sm:block"
        />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Account menu"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border shadow-float"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Avatar name={user.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="p-1.5 border-b border-border/50">
              <button
                role="menuitem"
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors text-sm"
                onClick={() => setLowBandwidth(!lowBandwidth)}
              >
                <span className="flex items-center gap-2">
                  {lowBandwidth ? <WifiLow className="h-4 w-4" /> : <WifiHigh className="h-4 w-4" />}
                  Low-bandwidth mode
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {lowBandwidth ? "ON" : "OFF"}
                </span>
              </button>
            </div>
            <div className="p-1.5">
              <Button
                role="menuitem"
                variant="ghost"
                className="w-full justify-start gap-2 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
