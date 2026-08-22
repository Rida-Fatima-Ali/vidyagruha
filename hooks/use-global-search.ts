"use client";

import { useEffect, useState } from "react";
import { searchService } from "@/services/api/search";
import type { SearchResult } from "@/types/search";
import type { UserRole } from "@/types/auth";

export interface UseGlobalSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 250;

export function useGlobalSearch(
  query: string,
  role: UserRole,
): UseGlobalSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchService.search(trimmed, role);
        if (!cancelled) {
          setResults(data);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setError("Search is unavailable right now. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, role]);

  return { results, loading, error };
}
