export type OrgNodeKind = "institution" | "department" | "year" | "division";

export interface OrgNode {
  id: string;
  label: string;
  kind: OrgNodeKind;
  /** Department short code, e.g. "CMPN". */
  code?: string;
  students: number;
  faculty: number;
  children?: OrgNode[];
}

/** Reach of a notice addressed to a node in the institutional tree. */
export interface AudienceReach {
  /** Node the notice is addressed to. */
  nodeId: string;
  /** Institution → … → node, for the breadcrumb above the tree. */
  path: { id: string; label: string; kind: OrgNodeKind }[];
  /** The addressed node plus every descendant. */
  litNodeIds: string[];
  students: number;
  faculty: number;
  total: number;
  /** Head count the notice deliberately does not reach. */
  excluded: number;
}
