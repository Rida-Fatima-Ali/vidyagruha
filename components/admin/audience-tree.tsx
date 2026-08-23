"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronRight, GraduationCap, Layers, Users } from "lucide-react";
import { adminService } from "@/services/api/admin";
import { audienceReach, scopeKindFor } from "@/services/audience";
import { cn } from "@/utils/cn";
import type { AdminNoticeAudience } from "@/types/admin";
import type { OrgNode, OrgNodeKind } from "@/types/org";

const ICON: Record<OrgNodeKind, typeof Building2> = {
  institution: Building2,
  department: Layers,
  year: GraduationCap,
  division: Users,
};

export interface AudienceTreeProps {
  audience: AdminNoticeAudience;
  nodeId: string;
  onNodeChange: (nodeId: string) => void;
}

/**
 * Institution → Department → Year → Division tree with the addressed branch lit
 * up, so an admin sees exactly who a notice lands on before publishing it.
 */
export function AudienceTree({ audience, nodeId, onNodeChange }: AudienceTreeProps) {
  const [tree, setTree] = useState<OrgNode | null>(null);

  useEffect(() => {
    let active = true;
    void adminService.getOrgTree().then((data) => {
      if (active) setTree(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const reach = useMemo(
    () => (tree ? audienceReach(tree, nodeId, audience) : null),
    [tree, nodeId, audience],
  );

  if (!tree || !reach) {
    return (
      <div className="h-56 animate-pulse rounded-xl bg-surface-2/60" aria-hidden="true" />
    );
  }

  const selectableKind = scopeKindFor(audience);
  const lit = new Set(reach.litNodeIds);

  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-4">
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {reach.path.map((node, index) => (
          <span key={node.id} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : null}
            <span className={index === reach.path.length - 1 ? "font-medium text-foreground" : ""}>
              {node.label}
            </span>
          </span>
        ))}
      </p>

      <div className="mt-3 max-h-72 overflow-y-auto pr-1">
        <TreeNode
          node={tree}
          depth={0}
          lit={lit}
          selectedId={reach.nodeId}
          selectableKind={selectableKind}
          onSelect={onNodeChange}
        />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3 text-center">
        <Stat label="Students" value={reach.students} />
        <Stat label="Faculty" value={reach.faculty} />
        <Stat label="Not notified" value={reach.excluded} muted />
      </dl>
    </div>
  );
}

function Stat({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div>
      <dt className="text-[0.6875rem] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "tabular text-lg font-semibold",
          muted ? "text-muted-foreground" : "text-primary",
        )}
      >
        {value.toLocaleString("en-IN")}
      </dd>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  lit,
  selectedId,
  selectableKind,
  onSelect,
}: {
  node: OrgNode;
  depth: number;
  lit: Set<string>;
  selectedId: string;
  selectableKind: OrgNodeKind;
  onSelect: (nodeId: string) => void;
}) {
  const Icon = ICON[node.kind];
  const isLit = lit.has(node.id);
  const isSelected = node.id === selectedId;
  const selectable = node.kind === selectableKind;
  const showChildren = depth < 1 || isLit || node.children?.some((child) => lit.has(child.id));

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 14 }}>
      <button
        type="button"
        disabled={!selectable}
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
          isLit ? "bg-primary/12 text-foreground" : "text-muted-foreground",
          isSelected && "ring-1 ring-inset ring-primary/60",
          selectable ? "cursor-pointer hover:bg-primary/20" : "cursor-default",
        )}
      >
        <Icon
          className={cn("h-3.5 w-3.5 shrink-0", isLit ? "text-primary" : "opacity-60")}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">
          {node.code ? `${node.code} · ${node.label}` : node.label}
        </span>
        <span className="tabular shrink-0 text-xs text-muted-foreground">
          {node.students.toLocaleString("en-IN")}
        </span>
      </button>
      {showChildren && node.children
        ? node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              lit={lit}
              selectedId={selectedId}
              selectableKind={selectableKind}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  );
}
