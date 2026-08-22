export type SearchResultType =
  | "notice"
  | "material"
  | "assignment"
  | "event"
  | "faculty"
  | "subject"
  | "campus"
  | "group";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  /** Route for the result; omitted until the page is implemented. */
  href?: string;
  /** Whether the destination page is implemented yet. */
  available: boolean;
}
