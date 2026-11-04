"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  LayoutGrid,
  ListFilter,
  School,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { kindLabel, routes } from "@/lib/routes";
import { plural } from "@/lib/utils";
import type { PaperSummary } from "@/lib/api/types";
import type {
  RbseClassSubjectSummary,
  StreamKey,
  SubtypeGroup,
} from "@/lib/rbse-channels";

interface Props {
  currentChannel: string; // "class-10" | "class-12" | "class-11" | "class-9" | "model-papers" | "all"
  allChannels: Array<{
    slug: string;
    shortTitle: string;
    paperCount: number;
    badge: string;
  }>;
  subjects?: RbseClassSubjectSummary[];
  subtypeGroups: SubtypeGroup[];
  totalPapers: number;
  availableYears: number[];
  examSlug?: string;
}

export function RbseChannelView({
  currentChannel,
  allChannels,
  subjects = [],
  subtypeGroups,
  totalPapers,
  availableYears,
  examSlug = "uni-rajasthanboard",
}: Props) {
  // If subjects are available, default to "subjects" funnel view; otherwise direct list
  const [viewMode, setViewMode] = useState<"subjects" | "papers">(
    subjects.length > 0 ? "subjects" : "papers"
  );

  // Subject filtering
  const [activeStream, setActiveStream] = useState<string>("all");
  const [subjectSearch, setSubjectSearch] = useState<string>("");

  // Direct papers filtering
  const [activeSubtype, setActiveSubtype] = useState<string>("all");
  const [activeYear, setActiveYear] = useState<string>("all");
  const [paperSearch, setPaperSearch] = useState<string>("");

  // Available streams for this class
  const availableStreams = useMemo(() => {
    const streamsSet = new Set<string>();
    for (const sub of subjects) {
      for (const st of sub.streams) {
        streamsSet.add(st);
      }
    }
    const order = ["core", "science", "commerce", "arts", "language", "vocational", "other"];
    return order.filter((s) => streamsSet.has(s));
  }, [subjects]);

  const streamLabels: Record<string, string> = {
    core: "Core Subjects",
    science: "Science Stream",
    commerce: "Commerce Stream",
    arts: "Arts & Humanities",
    language: "Languages & Lit.",
    vocational: "Vocational & Skill",
    other: "Other Subjects",
  };

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      if (activeStream !== "all" && !sub.streams.includes(activeStream as StreamKey)) {
        return false;
      }
      if (subjectSearch.trim()) {
        const q = subjectSearch.toLowerCase().trim();
        const matchName = sub.name.toLowerCase().includes(q);
        const matchHindi = sub.hindiName.toLowerCase().includes(q);
        const matchSlug = sub.slug.toLowerCase().includes(q);
        if (!matchName && !matchHindi && !matchSlug) return false;
      }
      return true;
    });
  }, [subjects, activeStream, subjectSearch]);

  // Flatten and filter direct papers
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
          if (paperSearch.trim()) {
            const q = paperSearch.toLowerCase();
            const matchTitle = p.title.toLowerCase().includes(q);
            const matchCode = p.paper_code?.toLowerCase().includes(q);
            if (!matchTitle && !matchCode) continue;
          }
          list.push({ paper: p, subtype: group.label });
        }
      }
    }

    return list;
  }, [subtypeGroups, activeSubtype, activeYear, paperSearch]);

  // Group filtered papers by Year
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

  const hasPaperFilters =
    activeSubtype !== "all" || activeYear !== "all" || paperSearch.trim() !== "";

  return (
    <div className="space-y-8">
      {/* 1. CHANNEL SELECTOR / HIERARCHICAL NAVIGATION */}
      <div className="space-y-2 border-b-2 border-border pb-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <School className="size-3.5" aria-hidden="true" />
            Rajasthan Board (RBSE) Classes &amp; Streams
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
                href={`/rajasthanboard/${ch.slug}`}
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

      {/* 2. FUNNEL VIEW MODE SWITCHER (Subjects vs All Papers) */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-border bg-card p-2 sm:p-3 shadow-hard-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setViewMode("subjects")}
              className={`inline-flex items-center gap-2 border-2 border-border px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === "subjects"
                  ? "bg-primary text-primary-foreground shadow-hard-sm"
                  : "bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Choose Subject ({subjects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("papers")}
              className={`inline-flex items-center gap-2 border-2 border-border px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === "papers"
                  ? "bg-primary text-primary-foreground shadow-hard-sm"
                  : "bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              <ListFilter className="size-3.5" />
              <span>All Papers Directly ({totalPapers})</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground">
            {viewMode === "subjects"
              ? "Select a subject to view papers organized by year"
              : `Browsing all ${totalPapers} papers with filters`}
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE A: SUBJECTS GRID (THE PRIMARY NESTED FUNNEL)     */}
      {/* ========================================================= */}
      {viewMode === "subjects" && subjects.length > 0 && (
        <div className="space-y-6">
          {/* Stream Filter Pills & Search */}
          <div className="space-y-4 rounded-none border-2 border-border bg-card p-4 sm:p-5 shadow-hard">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-muted-foreground" />
                <h3 className="font-display text-sm uppercase tracking-wider font-bold">
                  Filter by Stream / Category
                </h3>
                {(activeStream !== "all" || subjectSearch.trim() !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStream("all");
                      setSubjectSearch("");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline ml-2"
                  >
                    <X className="size-3" /> Clear filters
                  </button>
                )}
              </div>

              {/* Subject Search */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Find subject (e.g. Maths, Science)..."
                  className="w-full border-2 border-border bg-background py-1.5 pl-8 pr-3 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-hard-sm"
                />
              </div>
            </div>

            {/* Stream tabs */}
            {availableStreams.length > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveStream("all")}
                  className={`border border-border px-3 py-1 text-xs font-bold uppercase transition-colors shadow-hard-sm ${
                    activeStream === "all"
                      ? "bg-primary text-primary-foreground font-black"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  All Subjects ({subjects.length})
                </button>
                {availableStreams.map((st) => {
                  const count = subjects.filter((s) => s.streams.includes(st as StreamKey)).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setActiveStream(st)}
                      className={`border border-border px-3 py-1 text-xs font-bold uppercase transition-colors shadow-hard-sm ${
                        activeStream === st
                          ? "bg-primary text-primary-foreground font-black"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      {streamLabels[st] ?? st} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subjects Grid Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((sub) => (
              <Link
                key={sub.slug}
                href={sub.href}
                className="brutal brutal-hover group flex flex-col justify-between border-2 border-border bg-card p-5 transition-all shadow-hard hover:shadow-hard-lg"
              >
                <div className="space-y-3">
                  {/* Category Pill + Paper Count */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="border border-border/70 bg-accent px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent-foreground shadow-hard-sm">
                      {streamLabels[sub.category] ?? "Subject"}
                    </span>
                    <span className="border border-border/80 bg-primary px-2.5 py-0.5 text-xs font-black uppercase text-primary-foreground shadow-hard-sm">
                      {sub.paperCount} Papers
                    </span>
                  </div>

                  {/* Subject Name & Hindi Name */}
                  <div>
                    <h3 className="font-display text-xl uppercase tracking-tight group-hover:text-link transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground mt-0.5">
                      {sub.hindiName}
                    </p>
                  </div>

                  {/* Years Span */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>Years Available: {sub.yearsSpan}</span>
                  </div>

                  {/* Subtypes Breakdown */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {sub.subtypes.slice(0, 3).map((st) => (
                      <span
                        key={st.label}
                        className="border border-border/50 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        {st.label} ({st.count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Call to Action */}
                <div className="mt-5 pt-3 border-t-2 border-border/40 flex items-center justify-between text-xs font-black uppercase tracking-wider text-foreground group-hover:text-link">
                  <span>Browse {sub.name} Papers</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="border-2 border-dashed border-border p-10 text-center space-y-3 bg-card">
              <BookOpen className="size-8 mx-auto text-muted-foreground" />
              <h4 className="font-display text-lg uppercase">No subjects found</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No subjects matched &quot;{subjectSearch}&quot;. Try resetting your search or stream filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveStream("all");
                  setSubjectSearch("");
                }}
                className="border-2 border-border bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard transition-all"
              >
                Reset Subject Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE B: DIRECT PAPERS LIST (FILTER & SEARCH)         */}
      {/* ========================================================= */}
      {(viewMode === "papers" || subjects.length === 0) && (
        <div className="space-y-6">
          {/* Controls Box */}
          <div className="space-y-4 rounded-none border-2 border-border bg-card p-4 sm:p-5 shadow-hard">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="font-display text-sm uppercase tracking-wider font-bold">
                  Filter Papers Directly
                </h3>
                {hasPaperFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubtype("all");
                      setActiveYear("all");
                      setPaperSearch("");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline ml-2"
                  >
                    <X className="size-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Quick Keyword Search */}
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={paperSearch}
                  onChange={(e) => setPaperSearch(e.target.value)}
                  placeholder="Filter by title, year, or code..."
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

          {/* Direct Paper List */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            <span>
              Showing {filteredPapers.length} {plural(filteredPapers.length, "paper")}
            </span>
            {activeYear !== "all" && <span>Filtered by Year {activeYear}</span>}
          </div>

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
                  setPaperSearch("");
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
        </div>
      )}

      {/* 3. FUNNEL CROSS-LINKAGE CARDS (Explore other RBSE Channels) */}
      <section className="border-t-2 border-border pt-10 space-y-4">
        <h3 className="font-display text-xl uppercase tracking-wider">
          Explore Other Rajasthan Board (RBSE) Classes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allChannels
            .filter((c) => c.slug !== currentChannel)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/rajasthanboard/${c.slug}`}
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
