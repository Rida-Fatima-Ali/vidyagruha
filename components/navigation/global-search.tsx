"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPin,
  Search,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { SearchResultType } from "@/types/search";

const RESULT_ICON: Record<SearchResultType, LucideIcon> = {
  notice: Bell,
  material: FileText,
  assignment: ClipboardList,
  event: CalendarDays,
  faculty: User,
  subject: BookOpen,
  campus: MapPin,
  group: Users,
};

export function GlobalSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, loading, error } = useGlobalSearch(query, user?.role ?? "student");
  const showPanel = open && query.trim().length > 0;

  const [resetKey, setResetKey] = useState("");
  const nextResetKey = `${query}\u0000${results.length}`;
  if (nextResetKey !== resetKey) {
    setResetKey(nextResetKey);
    setActiveIndex(-1);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function activateResult(index: number) {
    if (index < 0 || index >= results.length) {
      return;
    }
    const result = results[index];
    if (!result.available || !result.href) {
      return;
    }
    setOpen(false);
    setQuery("");
    void router.push(result.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showPanel) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current < results.length - 1 ? current + 1 : current,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current > 0 ? current - 1 : -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateResult(activeIndex);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search campus…"
        aria-label="Search campus"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-activedescendant={
          showPanel && activeIndex >= 0
            ? `global-search-option-${results[activeIndex]?.id}`
            : undefined
        }
        className="h-10 w-full rounded-xl border border-input bg-card/60 pl-9 pr-16 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 hover:bg-card focus-visible:border-primary focus-visible:bg-card focus-visible:shadow-inset-highlight focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border/80 bg-surface-3/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70 sm:inline-flex"
      >
        Ctrl K
      </kbd>

      {showPanel ? (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="glass-strong absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border shadow-float"
        >
          {loading ? (
            <div className="space-y-2 p-3" aria-busy="true">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : error ? (
            <div className="p-3 text-sm text-muted-foreground">{error}</div>
          ) : results.length === 0 ? (
            <EmptyState
              className="rounded-none border-0 py-8"
              title="No results found"
              description={`Nothing matched "${query}". Try a different search term.`}
            />
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.map((result, index) => {
                const Icon = RESULT_ICON[result.type];
                const isActive = index === activeIndex;
                const interactive = result.available && result.href;
                return (
                  <li
                    key={result.id}
                    id={`global-search-option-${result.id}`}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-150",
                      isActive && "bg-primary/[0.06]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/50 transition-colors duration-150",
                        isActive
                          ? "bg-primary/[0.08] text-primary"
                          : "bg-surface-2 text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {result.title}
                      </span>
                      {result.subtitle ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      ) : null}
                    </span>
                    {interactive ? null : (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground/60">
                        Coming soon
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
