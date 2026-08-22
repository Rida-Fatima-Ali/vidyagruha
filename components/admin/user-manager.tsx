"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminUsers } from "@/hooks/use-admin";
import { formatShortDate } from "@/utils/date";
import type { AdminUser, AdminUserRole } from "@/types/admin";

type RoleFilter = AdminUserRole | "all";

export function UserManager() {
  const { data, loading, error, refresh } = useAdminUsers();
  const [role, setRole] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  const users = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all" && user.role !== role) return false;
      if (
        query &&
        !user.name.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [users, role, search]);

  return (
    <Panel
      title="Users"
      description="Every account across the institution, in one place"
      flush
      action={
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<RoleFilter>
            ariaLabel="Filter by role"
            value={role}
            onChange={setRole}
            options={[
              { value: "all", label: "All" },
              { value: "student", label: "Students" },
              { value: "faculty", label: "Faculty" },
              { value: "admin", label: "Admins" },
            ]}
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email…"
            aria-label="Search users"
            className="h-8 w-52"
          />
        </div>
      }
    >
      {loading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Search className="h-5 w-5" aria-hidden="true" />}
            title="No users match"
            description="Try a different role filter or search term."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Name</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Joined</TableHeader>
              <TableHeader>Last active</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">{user.email}</span>
                </TableCell>
                <TableCell>
                  <span className="block text-sm">{user.roleName}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="tabular text-sm text-muted-foreground">
                  {formatShortDate(user.joinedAt)}
                </TableCell>
                <TableCell className="tabular text-sm text-muted-foreground">
                  {formatShortDate(user.lastActive)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  if (status === "active") {
    return <Badge variant="success">Active</Badge>;
  }
  if (status === "suspended") {
    return <Badge variant="destructive">Suspended</Badge>;
  }
  return <Badge variant="outline">Invited</Badge>;
}
