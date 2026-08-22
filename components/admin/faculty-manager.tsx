"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useAdminFaculty } from "@/hooks/use-admin";
import type { AdminFacultySubject } from "@/types/admin";

export function FacultyManager() {
  const { data, loading, error, refresh } = useAdminFaculty();
  const [search, setSearch] = useState("");

  const faculty = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faculty;
    return faculty.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.subjects.some((subject) => subject.name.toLowerCase().includes(query)),
    );
  }, [faculty, search]);

  return (
    <Panel
      title="Faculty"
      description="Derived from the canonical subject → instructor mapping"
      flush
      action={
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or subject…"
          aria-label="Search faculty"
          className="h-8 w-52"
        />
      }
    >
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
            title="No faculty match"
            description="Try a different name or subject."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Faculty</TableHeader>
              <TableHeader>Department</TableHeader>
              <TableHeader>Subjects</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <span className="block text-sm font-medium">{member.name}</span>
                  <span className="block text-xs text-muted-foreground">{member.email}</span>
                </TableCell>
                <TableCell className="text-sm">{member.department}</TableCell>
                <TableCell>
                  <div className="flex max-w-72 flex-wrap gap-1">
                    {member.subjects.map((subject) => (
                      <SubjectChip key={subject.code} subject={subject} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === "active" ? "success" : "outline"}>
                    {member.status === "active" ? "Active" : "Invited"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}

function SubjectChip({ subject }: { subject: AdminFacultySubject }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-xs text-muted-foreground ring-1 ring-inset ring-border/60">
      <span className="tabular">{subject.code}</span>
      <span className="text-muted-foreground/70">·</span>
      <span className="font-medium">{subject.name}</span>
    </span>
  );
}
