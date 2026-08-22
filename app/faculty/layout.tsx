import type { ReactNode } from "react";
import { RoleGuard } from "@/components/layout/role-guard";

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="faculty">{children}</RoleGuard>;
}
