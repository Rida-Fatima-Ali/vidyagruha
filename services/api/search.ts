import { apiClient, registerMock } from "./client";
import { searchMockIndex } from "@/mocks/search";
import type { SearchResult } from "@/types/search";

registerMock("/api/search", (request) =>
  searchMockIndex(request.query.q ?? "", request.query.role ?? ""),
);

export const searchService = {
  search: (query: string, role: string) =>
    apiClient.get<SearchResult[]>(
      `/api/search?q=${encodeURIComponent(query.trim())}&role=${encodeURIComponent(role)}`,
    ),
};
