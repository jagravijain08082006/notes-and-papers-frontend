"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, GraduationCap, History, Search, Trophy } from "lucide-react";

const TRENDING_SEARCHES = [
  "BCA 1st Year",
  "B.Sc Chemistry",
  "B.Com Accountancy",
  "BA History",
  "REET Level 2",
  "Rajasthan Police",
  "SSC CGL",
  "UPSC Prelims",
  "M.Sc Physics",
  "B.Ed Exam",
  "Computer Fundamentals",
  "General English",
];

const POPULAR_COURSES = [
  {
    name: "BCA",
    label: "Bachelor of Computer Apps",
    href: "/universities/rajasthan-university/bca",
    count: "300+ papers",
  },
  {
    name: "B.Sc",
    label: "Bachelor of Science (Bio/Math)",
    href: "/universities/rajasthan-university/bsc",
    count: "800+ papers",
  },
  {
    name: "B.Com",
    label: "Bachelor of Commerce",
    href: "/universities/rajasthan-university/bcom",
    count: "600+ papers",
  },
  {
    name: "B.A.",
    label: "Bachelor of Arts",
    href: "/universities/rajasthan-university/ba",
    count: "1,200+ papers",
  },
  {
    name: "B.Ed",
    label: "Bachelor of Education",
    href: "/universities/rajasthan-university/bed",
    count: "250+ papers",
  },
  {
    name: "M.Com",
    label: "Master of Commerce",
    href: "/universities/rajasthan-university/mcom",
    count: "180+ papers",
  },
  {
    name: "M.Sc",
    label: "Master of Science",
    href: "/universities/rajasthan-university/msc",
    count: "400+ papers",
  },
  {
    name: "M.A.",
    label: "Master of Arts",
    href: "/universities/rajasthan-university/ma",
    count: "900+ papers",
  },
];

const COMPETITIVE_EXAMS = [
  { name: "REET Exam", label: "Teacher Eligibility Test", href: "/exams/reet" },
  { name: "Rajasthan Police", label: "Constable & Sub-Inspector", href: "/exams/rajasthan-police" },
  { name: "SSC CGL & CHSL", label: "Staff Selection Commission", href: "/exams/ssc" },
  { name: "UPSC Civil Services", label: "IAS / IPS / IFS Prelims & Mains", href: "/exams/upsc" },
  { name: "JEE Main & Advanced", label: "Engineering Entrance", href: "/exams/jee" },
  { name: "NEET UG", label: "Medical Entrance Exam", href: "/exams/neet" },
];

export function SearchSuggestionsHub({ onSelectQuery }: { onSelectQuery: (q: string) => void }) {
  const [recentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("notes_recent_searches");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 6);
        }
      }
    } catch {
      // Ignore
    }
    return [];
  });

  return (
    <>
      <section aria-label="Browse papers" className="space-y-5 sm:hidden">
        <h2 className="text-xl">Browse</h2>
        <nav className="grid grid-cols-2 gap-3" aria-label="Paper collections">
          {[
            { href: "/universities/rajasthan-technical-university", label: "RTU" },
            { href: "/universities/rajasthan-university", label: "UNIRAJ" },
            { href: "/rajasthanboard", label: "RBSE" },
            { href: "/exams", label: "Other exams" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-12 items-center border border-border bg-card px-3 text-sm font-bold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <h3 className="text-sm font-bold">Try a search</h3>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SEARCHES.slice(0, 4).map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => onSelectQuery(query)}
              className="min-h-11 border border-border bg-card px-3 text-sm hover:bg-primary"
            >
              {query}
            </button>
          ))}
        </div>
      </section>
      <div className="hidden space-y-10 border-2 border-border bg-card p-6 shadow-hard sm:block sm:p-8">
        {/* HEADER */}
        <div className="space-y-2 border-b-2 border-border pb-4">
          <span className="eyebrow inline-flex items-center gap-1.5 border border-border bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
            <Search className="size-3.5" /> Discovery Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
            Suggested Searches &amp; Browse Shortcuts
          </h2>
          <p className="text-sm text-muted-foreground">
            Click any popular term below to search immediately, or jump straight to verified
            university and exam vaults.
          </p>
        </div>

        {/* RECENT SEARCHES (IF ANY) */}
        {recentSearches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <History className="size-3.5" />
              <span>Your Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSelectQuery(term)}
                  className="inline-flex items-center gap-1.5 border-2 border-border bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TRENDING SEARCHES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent font-bold">
            <Flame className="size-4" />
            <span>🔥 Trending Searches (Popular This Week)</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {TRENDING_SEARCHES.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => onSelectQuery(query)}
                className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>{query}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TOP RAJASTHAN UNIVERSITY COURSES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <GraduationCap className="size-4 text-primary" />
            <span>Explore Rajasthan University Streams</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POPULAR_COURSES.map((course) => (
              <Link
                key={course.name}
                href={course.href}
                className="flex flex-col justify-between border-2 border-border bg-background p-3.5 shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary/20 hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                <div className="space-y-0.5">
                  <span className="font-display text-xl uppercase tracking-wider text-foreground">
                    {course.name}
                  </span>
                  <p className="text-[11px] text-muted-foreground truncate font-medium">
                    {course.label}
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {course.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* COMPETITIVE EXAMS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Trophy className="size-4 text-accent" />
            <span>Popular Competitive Exams</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COMPETITIVE_EXAMS.map((exam) => (
              <Link
                key={exam.name}
                href={exam.href}
                className="flex flex-col justify-between border-2 border-border bg-background p-3.5 shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-accent/20 hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                <span className="font-display text-base uppercase tracking-wider text-foreground">
                  {exam.name}
                </span>
                <p className="text-[11px] text-muted-foreground truncate font-medium">
                  {exam.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
