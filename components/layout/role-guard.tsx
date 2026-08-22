"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_DASHBOARD_PATH } from "@/constants/roles";
import type { UserRole } from "@/types/auth";
import { AppShell } from "./app-shell";

export function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!user) {
      void router.replace("/login");
      return;
    }
    if (user.role !== role) {
      void router.replace(ROLE_DASHBOARD_PATH[user.role]);
    }
  }, [ready, user, role, router]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">
          Loading your campus…
        </p>
      </div>
    );
  }

  return <AppShell role={role}>{children}</AppShell>;
}
