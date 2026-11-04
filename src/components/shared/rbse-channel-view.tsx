"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, FileText, Filter, Layers, School, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { kindLabel, routes } from "@/lib/routes";
import { plural } from "@/lib/utils";
import type { PaperSummary } from "@/lib/api/types";
import { RBSE_CHANNELS, cleanSubtypeName, type RbseChannelMeta, type SubtypeGroup } from "@/lib/rbse-channels";

interface Props {
  currentChannel: string; // "class-10" | "class-12" | "class-11" | "class-9" | "model-papers" | "all"
  allChannels: Array<{
    slug: string;
    shortTitle: string;
    paperCount: number;
    badge: string;
  }>;
  subtypeGroups: SubtypeGroup[];
  totalPapers: number;
  availableYears: number[];
  examSlug?: string;
}

export function RbseChannelView({
  currentChannel,
  allChannels,
  subtypeGroups,
  totalPapers,
  availableYears,
  examSlug = "uni-rajasthanboard",
}: Props) {
  const [activeSubtype, setActiveSubtype] = useState<string>("all");
  const [activeYear, setActiveYear] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Flatten and filter papers based on active filters
  const filteredPapers = useMemo(() => {
    const list: Array<{ paper: PaperSummary; subtype: string }> = [];

    for (const group of subtypeGroups) {
      if (activeSubtype !== "all" && group.typeKey !== activeSubtype) {
        continue;
      }

      for (const yg of group.yearGroups) {
        if (activeYear !== "all" && yg.year !== activeYear) {
          continue;
        }

        for (const p of yg.papers) {
          if (search.trim()) {
            const q = search.toLowerCase();
            const matchTitle = p.title.toLowerCase().includes(q);
            const matchCode = p.paper_code?.toLowerCase().includes(q);
            if (!matchTitle && !matchCode) continue;
          }
          list.push({ paper: p, subtype: group.label });
        }
      }
    }

    return list;
  }, [subtypeGroups, activeSubtype, activeYear, search]);

  // Group filtered papers by Year for clean structured browsing
  const papersByYear = useMemo(() => {
    const map = new Map<string, Array<{ paper: PaperSummary; subtype: string }>>();
    for (const item of filteredPapers) {
      const yr = item.paper.year ? String(item.paper.year) : "Other";
      const arr = map.get(yr) ?? [];
      arr.push(item);
      map.set(yr, arr);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return Number(b) - Number(a);
    });
  }, [filteredPapers]);

  const hasFilters = activeSubtype !== "all" || activeYear !== "all" || search.trim() !== "";

  return (
    <div className="space-y-8">
      {/* 1. CHANNEL SELECTOR / LINKAGE FUNNEL BAR */}
      <div className="space-y-2 border-b-2 border-border pb-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <School className="size-3.5" aria-hidden="true" />
            RBSE Rajasthan Board Channels
          </p>
          <span className="text-xs font-bold text-muted-foreground">
            {totalPapers} papers in this channel
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/exams/uni-rajasthanboard"
            className={`inline-flex items-center gap-1.5 border-2 border-border px-3.5 py-1.5 text-xs font-black uppercase tracking-wide transition-all shadow-hard-sm ${
              currentChannel === "all"
                ? "bg-accent text-accent-foreground shadow-hard -translate-y-0.5"
                : "bg-card hover:bg-primary hover:-translate-y-0.5"
            }`}
          >
            <span>Overview &amp; All</span>
          </Link>
          {allChannels.map((ch) => {
            const isActive = currentChannel === ch.slug;
            return (
              <Link
                key={ch.slug}
                href={`/exams/uni-rajasthanboard/${ch.slug}`}
                className={`inline-flex items-center gap-1.5 border-2 border-border px-3.5 py-1.5 text-xs font-black uppercase tracking-wide transition-all shadow-hard-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-hard -translate-y-0.5"
                    : "bg-card hover:bg-primary hover:-translate-y-0.5"
                }`}
              >
                <span>{ch.shortTitle}</span>
                <span className="border border-border/40 bg-background/80 px-1 py-0.2 text-[10px] font-black">
                  {ch.paperCount}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="space-y-4 rounded-none border-2 border-border bg-card p-4 sm:p-5 shadow-hard">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="font-display text-sm uppercase tracking-wider font-bold">
              Filter Papers
            </h3>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setActiveSubtype("all");
                  setActiveYear("all");
                  setSearch("");
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline ml-2"
              >
                <X className="size-3" /> Clear all
              </button>
            )}
          </div>

          {/* Quick Subject / Keyword Search */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by subject or code..."
              className="w-full border-2 border-border bg-background py-1.5 pl-8 pr-3 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-hard-sm"
            />
          </div>
        </div>

        {/* Exam Sub-type Filter Tabs */}
        {subtypeGroups.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">
              Examination Type:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSubtype("all")}
                className={`border border-border px-2.5 py-1 text-xs font-bold uppercase transition-colors shadow-hard-sm ${
                  activeSubtype === "all"
                    ? "bg-primary text-primary-foreground font-black"
                    : "bg-background hover:bg-muted"
                }`}
              >
                All Types ({totalPapers})
              </button>
              {subtypeGroups.map((g) => (
                <button
                  key={g.typeKey}
                  type="button"
                  onClick={() => setActiveSubtype(g.typeKey)}
                  className={`border border-border px-2.5 py-1 text-xs font-bold uppercase transition-colors shadow-hard-sm ${
                    activeSubtype === g.typeKey
                      ? "bg-primary text-primary-foreground font-black"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {g.label} ({g.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Filter Bar */}
        {availableYears.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">
              Filter by Year:
            </span>
            <div className="flex flex-wrap gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveYear("all")}
                className={`border border-border px-2 py-0.5 text-xs font-bold uppercase transition-colors ${
                  activeYear === "all"
                    ? "bg-accent text-accent-foreground font-black"
                    : "bg-background hover:bg-muted"
                }`}
              >
                All Years
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setActiveYear(String(yr))}
                  className={`border border-border px-2 py-0.5 text-xs font-bold uppercase transition-colors ${
                    activeYear === String(yr)
                      ? "bg-accent text-accent-foreground font-black"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. PAPERS RESULTS COUNT */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
        <span>
          Showing {filteredPapers.length} {plural(filteredPapers.length, "paper")}
        </span>
        {activeYear !== "all" && <span>Filtered by Year {activeYear}</span>}
      </div>

      {/* 4. PAPERS LISTING (Grouped neatly by Year) */}
      {papersByYear.length === 0 ? (
        <div className="border-2 border-dashed border-border p-10 text-center space-y-3 bg-card">
          <BookOpen className="size-8 mx-auto text-muted-foreground" />
          <h4 className="font-display text-lg uppercase">No papers match your filters</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try choosing a different year or exam type, or clearing your search keywords.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveSubtype("all");
              setActiveYear("all");
              setSearch("");
            }}
            className="border-2 border-border bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {papersByYear.map(([year, items]) => (
            <div key={year} className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="border-2 border-border bg-primary px-3 py-1 text-xs font-black uppercase tracking-wider shadow-hard-sm">
                  {year === "Other" ? "Other Years" : `Year ${year}`}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {plural(items.length, "paper")} available
                </span>
              </div>

              <ul className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2 w-full min-w-0">
                {items.map(({ paper: p, subtype }, idx) => (
                  <li key={p.slug} className="w-full min-w-0">
                    <Link
                      href={routes.examPaper(examSlug, p.slug)}
                      className="brutal brutal-hover group flex w-full min-w-0 items-center justify-between gap-3.5 p-4 sm:p-5 bg-card transition-all"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        <span className="grid size-11 sm:size-12 shrink-0 place-items-center border-2 border-border bg-primary shadow-hard-sm group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                          <FileText className="size-5 sm:size-6" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1 space-y-1.5 overflow-hidden">
                          <span className="line-clamp-2 block font-bold leading-snug break-words text-sm sm:text-base group-hover:text-link transition-colors">
                            {p.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="border border-border/60 bg-muted px-1.5 py-0.2 text-[10px] font-black uppercase">
                              #{idx + 1}
                            </span>
                            {p.year && <Badge tone="primary">{p.year}</Badge>}
                            <span className="border border-border/60 bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent-foreground uppercase">
                              {subtype}
                            </span>
                            {p.kind !== "question_paper" && (
                              <Badge tone="accent">{kindLabel(p.kind)}</Badge>
                            )}
                            {p.session && <Badge>{p.session}</Badge>}
                            {p.paper_code && <Badge>Code {p.paper_code}</Badge>}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 5. FUNNEL CROSS-LINKAGE CARDS */}
      <section className="border-t-2 border-border pt-10 space-y-4">
        <h3 className="font-display text-xl uppercase tracking-wider">
          Explore Other Rajasthan Board (RBSE) Channels
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allChannels
            .filter((c) => c.slug !== currentChannel)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/exams/uni-rajasthanboard/${c.slug}`}
                className="brutal brutal-hover flex flex-col justify-between p-4 bg-card border-2 border-border group"
              >
                <div>
                  <span className="eyebrow inline-block bg-primary/20 px-2 py-0.5 text-[10px] font-black mb-2">
                    {c.badge}
                  </span>
                  <h4 className="font-display text-base uppercase leading-snug group-hover:text-link transition-colors">
                    {c.shortTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.paperCount} verified papers &amp; solutions
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground mt-3 group-hover:translate-x-1 transition-transform">
                  Open Channel <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
