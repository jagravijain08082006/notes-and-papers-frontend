"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, SearchX } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { ExamSummary } from "@/lib/api/types";
import { cleanExamTitle, EXAM_DOMAINS, getExamDomain } from "@/lib/exam-categories";
import { routes, yearRange } from "@/lib/routes";
import { cn, plural } from "@/lib/utils";

interface ExamsCatalogViewProps {
  exams: ExamSummary[];
}

export function ExamsCatalogView({ exams }: ExamsCatalogViewProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery.trim().toLowerCase(), 250);

  // Categorize exams and compute counts per domain
  const categorized = useMemo(() => {
    return exams.map((e) => {
      const domain = getExamDomain(e);
      const cleanName = cleanExamTitle(e.name, e.slug);
      return {
        ...e,
        displayName: cleanName,
        domainId: domain.id,
        domainLabel: domain.label,
        domainIcon: domain.icon,
      };
    });
  }, [exams]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { all: categorized.length };
    for (const item of categorized) {
      counts[item.domainId] = (counts[item.domainId] ?? 0) + 1;
    }
    return counts;
  }, [categorized]);

  // Filter based on debounced search and active category
  const filtered = useMemo(() => {
    return categorized.filter((e) => {
      const matchesCategory = activeCategory === "all" || e.domainId === activeCategory;
      if (!matchesCategory) return false;
      if (!debouncedQuery) return true;
      return (
        e.displayName.toLowerCase().includes(debouncedQuery) ||
        e.slug.toLowerCase().includes(debouncedQuery) ||
        e.domainLabel.toLowerCase().includes(debouncedQuery)
      );
    });
  }, [categorized, activeCategory, debouncedQuery]);

  // Group filtered results by domain if "all" is active and no search query
  const groupedSections = useMemo(() => {
    if (activeCategory !== "all" || debouncedQuery.length > 0) {
      return null;
    }
    const map = new Map<string, typeof categorized>();
    for (const item of categorized) {
      const list = map.get(item.domainId) ?? [];
      list.push(item);
      map.set(item.domainId, list);
    }
    return EXAM_DOMAINS.filter((d) => d.id !== "all" && (map.get(d.id)?.length ?? 0) > 0).map(
      (d) => ({
        domain: d,
        items: map.get(d.id) ?? [],
      }),
    );
  }, [categorized, activeCategory, debouncedQuery]);

  return (
    <div className="space-y-10">
      {/* CONTROLS: SEARCH & CATEGORY FILTER PILLS */}
      <div className="space-y-4">
        {/* Search within exams */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 max-w-md">
            <div className="flex h-12 items-center gap-2.5 border-2 border-border bg-card px-3.5 shadow-hard-sm focus-within:border-foreground focus-within:shadow-hard">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter exams by name (e.g. SBI, SSC, CBSE, Police, TET)..."
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Showing {filtered.length} of {exams.length} examinations & boards
          </div>
        </div>

        {/* Category Filter Pills with Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {EXAM_DOMAINS.map((domain) => {
            const count = domainCounts[domain.id] ?? 0;
            if (domain.id !== "all" && count === 0) return null;
            const isSelected = activeCategory === domain.id;
            const DomainIcon = domain.icon;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setActiveCategory(domain.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-2 border-border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-hard-sm hover:-translate-x-px hover:-translate-y-px",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-hard"
                    : "bg-card text-foreground hover:bg-primary/20",
                )}
              >
                <DomainIcon className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{domain.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] font-black border border-border/40",
                    isSelected ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CASE 1: GROUPED BY DOMAINS ("ALL" VIEW WITHOUT SEARCH) */}
      {groupedSections ? (
        <div className="space-y-14">
          {groupedSections.map(({ domain, items }) => {
            const SectionIcon = domain.icon;
            return (
              <section key={domain.id} id={domain.id} className="scroll-mt-24 space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-border pb-3">
                  <div className="space-y-1">
                    <span className="eyebrow inline-flex items-center gap-1.5 bg-accent px-2.5 py-1 text-accent-foreground font-bold tracking-wider shadow-hard-sm">
                      <SectionIcon className="size-3.5" aria-hidden="true" />
                      {domain.id === "school-boards" ? "School Boards & Entrance" : "Competitive Category"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
                      {domain.label}
                    </h2>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {plural(items.length, "examination")}
                  </span>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((e, idx) => {
                    const DomainIcon = e.domainIcon;
                    return (
                      <li key={e.slug}>
                        <Link
                          href={routes.exam(e.slug)}
                          className="brutal brutal-hover group flex h-full flex-col justify-between gap-5 p-5 bg-card transition-all"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={cn(
                                  "grid size-11 place-items-center border-2 border-border shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground",
                                  idx % 2 === 0
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-accent text-accent-foreground",
                                )}
                              >
                                <DomainIcon className="size-5 shrink-0" aria-hidden="true" />
                              </span>
                              <span className="eyebrow border border-border/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {e.kind === "board" ? "School Board" : domain.label}
                              </span>
                            </div>
                            <span className="line-clamp-2 block font-display text-2xl uppercase leading-snug text-foreground">
                              {e.displayName}
                            </span>
                          </div>
                          <span className="eyebrow flex items-center justify-between border-t-2 border-border pt-3 text-muted-foreground">
                            <span className="font-bold text-foreground">{plural(e.paper_count, "paper")}</span>
                            <span className="flex items-center gap-2">
                              {e.year_min && (
                                <span className="border border-border bg-background px-1.5 py-0.5 font-bold">
                                  {yearRange(e.year_min, e.year_max)}
                                </span>
                              )}
                              <ArrowRight
                                className="size-4 shrink-0 transition-transform group-hover:translate-x-1 text-muted-foreground group-hover:text-foreground"
                                aria-hidden="true"
                              />
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        /* CASE 2: FILTERED FLAT LIST */
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="border-2 border-border bg-card p-12 text-center shadow-hard space-y-3">
              <span className="inline-grid size-14 place-items-center border-2 border-border bg-muted shadow-hard-sm mx-auto">
                <SearchX className="size-7 text-muted-foreground" aria-hidden="true" />
              </span>
              <p className="font-display text-2xl uppercase">No matching exams or boards found</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No examination matches &quot;{searchQuery}&quot;. Try searching for another keyword or switch category filter tabs.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="mt-3 inline-flex items-center gap-2 border-2 border-border bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-hard-sm hover:shadow-hard"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e, idx) => {
                const DomainIcon = e.domainIcon;
                return (
                  <li key={e.slug}>
                    <Link
                      href={routes.exam(e.slug)}
                      className="brutal brutal-hover group flex h-full flex-col justify-between gap-5 p-5 bg-card transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "grid size-11 place-items-center border-2 border-border shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground",
                              idx % 2 === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent text-accent-foreground",
                            )}
                          >
                            <DomainIcon className="size-5 shrink-0" aria-hidden="true" />
                          </span>
                          <span className="eyebrow border border-border/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {e.kind === "board" ? "School Board" : e.domainLabel}
                          </span>
                        </div>
                        <span className="line-clamp-2 block font-display text-2xl uppercase leading-snug text-foreground">
                          {e.displayName}
                        </span>
                      </div>
                      <span className="eyebrow flex items-center justify-between border-t-2 border-border pt-3 text-muted-foreground">
                        <span className="font-bold text-foreground">{plural(e.paper_count, "paper")}</span>
                        <span className="flex items-center gap-2">
                          {e.year_min && (
                            <span className="border border-border bg-background px-1.5 py-0.5 font-bold">
                              {yearRange(e.year_min, e.year_max)}
                            </span>
                          )}
                          <ArrowRight
                            className="size-4 shrink-0 transition-transform group-hover:translate-x-1 text-muted-foreground group-hover:text-foreground"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

