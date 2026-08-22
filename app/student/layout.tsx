import type { ReactNode } from "react";
import { RoleGuard } from "@/components/layout/role-guard";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="student">{children}</RoleGuard>;
}
