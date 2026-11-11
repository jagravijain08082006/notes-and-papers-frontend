"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSearch } from "@/services/queries";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const RECENT_KEY = "notespapers_recent_searches";
const MAX_RECENTS = 6;

import { useDebounce } from "@/hooks/use-debounce";

function getStoredRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveStoredRecents(recents: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
  } catch {
    // ignore quota errors
  }
}

interface SearchBarProps {
  defaultValue?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
  className?: string;
}

/**
 * Enhanced SearchBar:
 * - Dropdown positioned directly beneath the input on both mobile and desktop
 * - Opens instantly on focus/click
 * - Saves recent searches to localStorage
 * - 800ms debounce with animated shimmer skeleton while typing/fetching
 */
export function SearchBar({
  defaultValue = "",
  size = "md",
  autoFocus,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recents, setRecents] = useState<string[]>(() => getStoredRecents());

  const trimmed = value.trim();
  const debounced = useDebounce(trimmed, 450);
  const isDebouncing = trimmed.length >= 2 && debounced !== trimmed;

  const { data, isFetching } = useQuery({
    queryKey: ["suggest", debounced],
    enabled: open && debounced.length >= 2,
    queryFn: async ({ signal }) =>
      (await fetchSearch({ q: debounced, size: 1 }, signal)).suggestions,
  });

  const suggestions = open && debounced.length >= 2 ? (data ?? []).slice(0, 6) : [];
  const showShimmer = open && trimmed.length >= 2 && (isDebouncing || isFetching);
  const showRecents = open && trimmed.length === 0 && recents.length > 0;
  const showEmptyNotice = open && !showShimmer && debounced.length >= 2 && suggestions.length === 0;
  const hasDropdownContent = showShimmer || suggestions.length > 0 || showEmptyNotice || showRecents;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addRecent(q: string) {
    const clean = q.trim();
    if (!clean) return;
    const updated = [clean, ...recents.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(
      0,
      MAX_RECENTS,
    );
    setRecents(updated);
    saveStoredRecents(updated);
  }

  // The rows search on mouse PRESS (so the click is not lost when the input loses focus). The remove and clear buttons therefore
  // act on the press too and stop it from reaching the row; otherwise pressing the cross searched for that term instead.
  // (The click handler stays for keyboard use: Enter or Space on a focused button sends a click but no press.)
  function removeRecent(item: string, e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    const updated = recents.filter((r) => r !== item);
    setRecents(updated);
    saveStoredRecents(updated);
  }

  function clearAllRecents(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRecents([]);
    saveStoredRecents([]);
  }

  function go(q: string) {
    const term = q.trim();
    if (!term) return;
    addRecent(term);
    setOpen(false);
    router.push(routes.search(term));
  }

  return (
    <form
      action="/search"
      role="search"
      className={cn("w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const selected = active >= 0 && suggestions[active] ? suggestions[active] : value;
        go(selected);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search question papers
      </label>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
        {/* Input Wrapper: Dropdown is relative to THIS box, never displaced by button on mobile */}
        <div ref={wrapperRef} className="relative min-w-0 flex-1">
          <div
            className={cn(
              "flex min-w-0 items-center gap-2.5 border-2 border-border bg-card px-3.5 transition-all focus-within:border-foreground focus-within:shadow-hard",
              size === "lg" ? "h-12 sm:h-14" : "h-10 sm:h-11",
            )}
          >
            <Search className="size-4 shrink-0 text-muted-foreground sm:size-5" aria-hidden="true" />
            <input
              id={`${listId}-input`}
              name="q"
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoFocus={autoFocus}
              maxLength={120}
              role="combobox"
              aria-expanded={open && hasDropdownContent}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              placeholder="Search subject, course, or exam..."
              value={value}
              onFocus={() => {
                setOpen(true);
                setActive(-1);
              }}
              onClick={() => setOpen(true)}
              onChange={(e) => {
                setValue(e.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (suggestions.length > 0) {
                    setActive((a) => Math.min(a + 1, suggestions.length - 1));
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (suggestions.length > 0) {
                    setActive((a) => Math.max(a - 1, -1));
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              className={cn(
                "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-base font-medium shadow-none outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-none",
              )}
            />
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setOpen(true);
                  setActive(-1);
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search input"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
            {showShimmer && (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
          </div>

          {/* Instant Dropdown: Placed directly below input container ONLY when there is actual content */}
          {open && hasDropdownContent && (
            <div
              id={listId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden border-2 border-border bg-card shadow-hard"
            >
              {/* Case 1: Shimmer skeleton while typing (debouncing / fetching) */}
              {showShimmer && (
                <div className="space-y-2 p-3" aria-label="Searching catalog">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" /> Searching question papers...
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="h-9 w-full animate-pulse border border-border/40 bg-muted/60" />
                    <div className="h-9 w-3/4 animate-pulse border border-border/40 bg-muted/60" />
                    <div className="h-9 w-5/6 animate-pulse border border-border/40 bg-muted/60" />
                  </div>
                </div>
              )}

              {/* Case 2: Live suggestions from API */}
              {!showShimmer && suggestions.length > 0 && (
                <ul className="divide-y divide-border/20">
                  {suggestions.map((s, i) => (
                    <li
                      key={s}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setValue(s);
                        go(s);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary",
                        i === active && "bg-primary",
                      )}
                    >
                      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{s}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Case 3: Empty results notice */}
              {showEmptyNotice && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <p className="font-semibold">No direct suggestions found</p>
                  <p className="mt-1 text-xs">Press Enter or click &quot;Find papers&quot; to search the whole vault.</p>
                </div>
              )}

              {/* Case 4: Recent searches when input is empty */}
              {showRecents && (
                <div className="p-1">
                  <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden="true" /> Recent searches
                    </span>
                    <button
                      type="button"
                      onMouseDown={clearAllRecents}
                      onClick={clearAllRecents}
                      className="flex items-center gap-1 hover:text-destructive"
                      aria-label="Clear all recent searches"
                    >
                      <Trash2 className="size-3" aria-hidden="true" /> Clear all
                    </button>
                  </div>
                  <ul className="divide-y divide-border/20">
                    {recents.map((item) => (
                      <li
                        key={item}
                        className="group flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-primary"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setValue(item);
                          go(item);
                        }}
                      >
                        <span className="flex min-w-0 items-center gap-2.5 truncate">
                          <Clock className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                          <span className="truncate">{item}</span>
                        </span>
                        <button
                          type="button"
                          onMouseDown={(e) => removeRecent(item, e)}
                          onClick={(e) => removeRecent(item, e)}
                          className="-mr-1 ml-2 grid size-9 shrink-0 place-items-center text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${item} from history`}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          size={size === "lg" ? "lg" : "md"}
          className="h-12 w-full font-bold uppercase tracking-wider shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 sm:h-14 sm:w-auto sm:px-8"
        >
          Find papers
        </Button>
      </div>
    </form>
  );
}

