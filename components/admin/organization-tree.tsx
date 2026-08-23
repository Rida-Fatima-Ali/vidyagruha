"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { cn } from "@/utils/cn";

export interface OrgNode {
  id: string;
  label: string;
  count?: { students?: number; faculty?: number };
  children?: OrgNode[];
}

const INSTITUTION: OrgNode = {
  id: "institution",
  label: "Institution",
  count: { students: 1240, faculty: 84 },
  children: [
    {
      id: "ce",
      label: "Computer Engineering",
      count: { students: 360, faculty: 22 },
      children: [
        { id: "ce-sy", label: "Second Year", count: { students: 120, faculty: 8 },
          children: [
            { id: "ce-sy-a", label: "Division A", count: { students: 60, faculty: 4 } },
            { id: "ce-sy-b", label: "Division B", count: { students: 60, faculty: 4 } },
          ]},
        { id: "ce-ty", label: "Third Year", count: { students: 120, faculty: 8 },
          children: [
            { id: "ce-ty-a", label: "Division A", count: { students: 60, faculty: 4 } },
            { id: "ce-ty-b", label: "Division B", count: { students: 60, faculty: 4 } },
          ]},
        { id: "ce-fy", label: "Final Year", count: { students: 120, faculty: 6 },
          children: [
            { id: "ce-fy-a", label: "Division A", count: { students: 60, faculty: 3 } },
            { id: "ce-fy-b", label: "Division B", count: { students: 60, faculty: 3 } },
          ]},
      ],
    },
    {
      id: "it",
      label: "Information Technology",
      count: { students: 300, faculty: 18 },
      children: [
        { id: "it-sy", label: "Second Year", count: { students: 100, faculty: 6 },
          children: [
            { id: "it-sy-a", label: "Division A", count: { students: 50, faculty: 3 } },
            { id: "it-sy-b", label: "Division B", count: { students: 50, faculty: 3 } },
          ]},
        { id: "it-ty", label: "Third Year", count: { students: 100, faculty: 6 },
          children: [
            { id: "it-ty-a", label: "Division A", count: { students: 50, faculty: 3 } },
            { id: "it-ty-b", label: "Division B", count: { students: 50, faculty: 3 } },
          ]},
      ],
    },
    {
      id: "extc",
      label: "Electronics & Telecomm.",
      count: { students: 280, faculty: 20 },
      children: [
        { id: "extc-sy", label: "Second Year", count: { students: 90, faculty: 6 } },
        { id: "extc-ty", label: "Third Year", count: { students: 90, faculty: 6 } },
      ],
    },
    {
      id: "mech",
      label: "Mechanical Engineering",
      count: { students: 300, faculty: 24 },
      children: [
        { id: "mech-sy", label: "Second Year", count: { students: 100, faculty: 8 } },
        { id: "mech-ty", label: "Third Year", count: { students: 100, faculty: 8 } },
      ],
    },
  ],
};

function isAncestorOf(node: OrgNode, targetId: string): boolean {
  if (node.id === targetId) return true;
  return node.children?.some(c => isAncestorOf(c, targetId)) ?? false;
}

function collectDescendantIds(node: OrgNode): string[] {
  const ids = [node.id];
  node.children?.forEach(c => ids.push(...collectDescendantIds(c)));
  return ids;
}

function OrgNodeRow({
  node, depth, selectedId, onSelect, expandedIds, onToggle,
}: {
  node: OrgNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isAncestor = selectedId ? isAncestorOf(node, selectedId) && node.id !== selectedId : false;
  const descendantIds = selectedId ? collectDescendantIds(INSTITUTION).includes(node.id) && selectedId !== null ? collectDescendantIds(
    findNode(INSTITUTION, selectedId) ?? node
  ).includes(node.id) : false : false;
  // Check if this node is a descendant of the selected node
  const isDescendant = selectedId && selectedId !== node.id && findNode(INSTITUTION, selectedId) ? collectDescendantIds(findNode(INSTITUTION, selectedId)!).includes(node.id) : false;

  const isHighlighted = isSelected || isDescendant;
  const isPathHighlighted = isAncestor;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors group",
          isHighlighted && "bg-primary/10 text-primary",
          isPathHighlighted && !isHighlighted && "text-foreground",
          !isHighlighted && !isPathHighlighted && "text-muted-foreground hover:text-foreground hover:bg-surface-2/60",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Tree line indicator */}
        {depth > 0 && (
          <span
            className={cn(
              "shrink-0 w-3 h-px",
              isHighlighted ? "bg-primary/40" : isPathHighlighted ? "bg-border" : "bg-border/50"
            )}
          />
        )}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className="shrink-0 p-0.5 rounded hover:bg-surface-3/60"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded
              ? <ChevronDown className="h-3.5 w-3.5" />
              : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="shrink-0 w-5" />
        )}
        <span className="flex-1 text-sm leading-tight font-medium truncate">{node.label}</span>
        {node.count && (
          <span className={cn(
            "text-[11px] tabular shrink-0",
            isHighlighted ? "text-primary/70" : "text-muted-foreground/60"
          )}>
            {node.count.students ? `${node.count.students}s` : ""}
            {node.count.faculty ? ` · ${node.count.faculty}f` : ""}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && node.children!.map(child => (
        <OrgNodeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

function findNode(root: OrgNode, id: string): OrgNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const result = findNode(child, id);
    if (result) return result;
  }
  return null;
}

function sumCounts(node: OrgNode): { students: number; faculty: number } {
  if (!node.children?.length) {
    return { students: node.count?.students ?? 0, faculty: node.count?.faculty ?? 0 };
  }
  return node.children.reduce(
    (acc, c) => {
      const sub = sumCounts(c);
      return { students: acc.students + sub.students, faculty: acc.faculty + sub.faculty };
    },
    { students: 0, faculty: 0 }
  );
}

interface OrganizationTreeProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OrganizationTree({ selectedId, onSelect }: OrganizationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["institution", "ce"]));

  function handleToggle(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedNode = selectedId ? findNode(INSTITUTION, selectedId) : null;
  const audience = selectedNode ? sumCounts(selectedNode) : null;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-3 py-2.5 border-b border-border/60 bg-surface-2/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Institution Hierarchy</p>
        </div>
        <div className="px-1 py-1.5 max-h-56 overflow-y-auto scroll-soft">
          <OrgNodeRow
            node={INSTITUTION}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggle={handleToggle}
          />
        </div>
      </div>
      {audience && selectedNode && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/6 px-3 py-2.5">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary">Audience: {selectedNode.label}</p>
            <p className="text-[11px] text-primary/70 mt-0.5">
              {audience.students > 0 ? `${audience.students} students` : ""}
              {audience.students > 0 && audience.faculty > 0 ? " · " : ""}
              {audience.faculty > 0 ? `${audience.faculty} faculty` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
