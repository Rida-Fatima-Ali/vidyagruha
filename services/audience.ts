import { buildOrgTree } from "@/mocks/org-tree";
import type { AudienceReach, OrgNode } from "@/types/org";
import type { AdminNoticeAudience } from "@/types/admin";

/** Institutional tree used by the notice audience preview. */
export function orgTree(): OrgNode {
  return buildOrgTree();
}

function findPath(node: OrgNode, nodeId: string, trail: OrgNode[] = []): OrgNode[] | null {
  const next = [...trail, node];
  if (node.id === nodeId) return next;
  for (const child of node.children ?? []) {
    const found = findPath(child, nodeId, next);
    if (found) return found;
  }
  return null;
}

function collectIds(node: OrgNode, into: string[] = []): string[] {
  into.push(node.id);
  for (const child of node.children ?? []) collectIds(child, into);
  return into;
}

/**
 * Head count a notice actually reaches when addressed to `nodeId`. The audience
 * also filters by role: a students-only notice never lands in a faculty feed.
 */
export function audienceReach(
  tree: OrgNode,
  nodeId: string,
  audience: AdminNoticeAudience,
): AudienceReach {
  const path = findPath(tree, nodeId) ?? [tree];
  const target = path[path.length - 1];
  const students = audience === "faculty" ? 0 : target.students;
  const faculty = audience === "students" ? 0 : target.faculty;
  const total = students + faculty;
  const everyone =
    (audience === "faculty" ? 0 : tree.students) +
    (audience === "students" ? 0 : tree.faculty);

  return {
    nodeId: target.id,
    path: path.map((node) => ({ id: node.id, label: node.label, kind: node.kind })),
    litNodeIds: collectIds(target),
    students,
    faculty,
    total,
    excluded: Math.max(0, everyone - total),
  };
}

/** The tree depth a given audience scope is allowed to address. */
export function scopeKindFor(audience: AdminNoticeAudience): OrgNode["kind"] {
  if (audience === "department") return "department";
  if (audience === "class") return "division";
  return "institution";
}
