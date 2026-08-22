import type { UserRole } from "@/types/auth";
import { SidebarContent } from "./sidebar-content";

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="glass-strong fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border lg:block">
      <SidebarContent role={role} />
    </aside>
  );
}
