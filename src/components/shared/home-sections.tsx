"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, GraduationCap, RefreshCw, School, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExams, useLatestPapers, useUniversities } from "@/hooks/use-catalog";
import type { ExamSummary, Paginated, PaperSummary, UniversityListItem } from "@/lib/api/types";
import { cleanExamTitle, getExamDomain } from "@/lib/exam-categories";
import { routes, yearRange } from "@/lib/routes";
import { cn, plural } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { PaperList, PaperListSkeleton } from "./paper-list";

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 border-2 border-destructive bg-card p-8 text-center"
    >
      <p className="text-sm font-medium text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" /> Try again
      </Button>
    </div>
  );
}

/** Section title with a small eyebrow, an optional link on the right, and room to breathe. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 w-full min-w-0">
      <div className="space-y-2 min-w-0">
        <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
          {eyebrow}
        </p>
        <h2 id={id} className="text-3xl sm:text-4xl lg:text-5xl break-words leading-none">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-2 border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:shadow-hard hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 shrink-0"
        >
          {linkLabel ?? "See all"} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function TileGrid({ children, busy }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full min-w-0 max-w-full"
      aria-busy={busy || undefined}
    >
      {children}
    </ul>
  );
}

function TileSkeletons() {
  return (
    <TileGrid busy>
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i}>
          <Skeleton className="h-[132px] border-2 border-border/30" />
        </li>
      ))}
    </TileGrid>
  );
}

const POPULAR_SCHOOL_BOARDS = [
  {
    slug: "school-boards-hub",
    name: "School Boards",
    subtitle: "RBSE, CBSE, UP Board, ICSE · Class 10th & 12th",
    href: "/boards",
    tags: [
      { label: "RBSE Board (9th–12th)", href: "/rajasthanboard" },
      { label: "CBSE All India", href: "/exams/uni-cbseboardonline" },
      { label: "UP Board (UPMSP)", href: "/exams/uni-upboardonline" },
      { label: "ICSE & ISC", href: "/exams/uni-icseonline" },
      { label: "MP Board", href: "/exams/uni-mpboardonline" },
      { label: "All School Boards", href: "/boards" },
    ],
  },
  {
    slug: "other-exams",
    name: "Other Exams",
    subtitle: "Competitive exams · UPSC, SSC, NEET, GATE",
    href: "/exams",
    tags: [
      { label: "SSC", href: "/exams/ssc" },
      { label: "SBI Clerk", href: "/exams/sbi-clerk" },
      { label: "UPSC", href: "/exams/upsc" },
      { label: "GATE", href: "/exams/gate" },
      { label: "NEET", href: "/exams/neet" },
      { label: "All exams", href: "/exams" },
    ],
  },
  {
    slug: "uni-rajasthanboard",
    name: "Rajasthan Board (RBSE)",
    subtitle: "Secondary & Sr. Sec · Ajmer Board",
    href: "/rajasthanboard",
    tags: [
      { label: "Class 10th Board", href: "/rajasthanboard" },
      { label: "Class 12th Science", href: "/rajasthanboard" },
      { label: "Class 12th Arts", href: "/rajasthanboard" },
      { label: "Class 12th Commerce", href: "/rajasthanboard" },
      { label: "Model Papers", href: "/rajasthanboard" },
    ],
  },
  {
    slug: "uni-cbseboardonline",
    name: "CBSE Central Board",
    subtitle: "Class 10th & 12th · All India Board",
    href: "/exams/uni-cbseboardonline",
    tags: [
      { label: "Class 10th Board", href: "/exams/uni-cbseboardonline" },
      { label: "Class 12th Science", href: "/exams/uni-cbseboardonline" },
      { label: "Class 12th Commerce", href: "/exams/uni-cbseboardonline" },
      { label: "Class 12th Humanities", href: "/exams/uni-cbseboardonline" },
      { label: "Sample Papers", href: "/exams/uni-cbseboardonline" },
    ],
  },
  {
    slug: "uni-upboardonline",
    name: "UP Board (UPMSP)",
    subtitle: "High School & Intermediate · Prayagraj",
    href: "/exams/uni-upboardonline",
    tags: [
      { label: "Class 10 High School", href: "/exams/uni-upboardonline" },
      { label: "Class 12 Intermediate", href: "/exams/uni-upboardonline" },
      { label: "Model Papers", href: "/exams/uni-upboardonline" },
    ],
  },
  {
    slug: "uni-icseonline",
    name: "ICSE & ISC Board (CISCE)",
    subtitle: "Class 10th ICSE & 12th ISC · All India",
    href: "/exams/uni-icseonline",
    tags: [
      { label: "Class 10 ICSE", href: "/exams/uni-icseonline" },
      { label: "Class 12 ISC", href: "/exams/uni-icseonline" },
      { label: "Specimen Papers", href: "/exams/uni-icseonline" },
    ],
  },
  {
    slug: "uni-mpboardonline",
    name: "MP Board (MPBSE)",
    subtitle: "High School & HSS · Bhopal MP",
    href: "/exams/uni-mpboardonline",
    tags: [
      { label: "Class 10th Board", href: "/exams/uni-mpboardonline" },
      { label: "Class 12th Board", href: "/exams/uni-mpboardonline" },
      { label: "Model Papers", href: "/exams/uni-mpboardonline" },
    ],
  },
  {
    slug: "cg-open-school",
    name: "CG Open School Board",
    subtitle: "11 Papers Available · State Open Board",
    href: "/exams/cg-open-school",
    tags: [
      { label: "Class 10th Open", href: "/exams/cg-open-school" },
      { label: "Class 12th Open", href: "/exams/cg-open-school" },
    ],
  },
];

const ACADEMIC_TABS = [
  { id: "all", label: "All (Universities & Boards)" },
  { id: "universities", label: "Universities" },
  { id: "boards", label: "School Boards (RBSE, CBSE...)" },
];

/** Universities & School Boards with courses and classes. */
export function UniversitiesSection({ initial }: { initial: UniversityListItem[] | null }) {
  const [activeTab, setActiveTab] = useState("all");
  const { data, isPending, isError, error, refetch } = useUniversities(initial);
  const unis = (data ?? []).filter((u) => u.paper_count > 0);

  const showUnis = activeTab === "all" || activeTab === "universities";
  const showBoards = activeTab === "all" || activeTab === "boards";
  const displayedBoards =
    activeTab === "all"
      ? POPULAR_SCHOOL_BOARDS.slice(0, 2)
      : POPULAR_SCHOOL_BOARDS.filter((b) => b.slug !== "other-exams");

  return (
    <section aria-labelledby="courses-heading" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          id="courses-heading"
          eyebrow="Degree courses & curricula"
          title="Browse university & degree courses"
          href={routes.universities}
          linkLabel="All universities"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ACADEMIC_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 border-2 border-border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-hard-sm hover:-translate-x-px hover:-translate-y-px",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-hard"
                  : "bg-card text-foreground hover:bg-primary/20",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <TileSkeletons />
      ) : isError && unis.length === 0 ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : (
        <TileGrid>
          {/* Universities */}
          {showUnis &&
            unis.map((u) => (
              <li key={u.slug} className="w-full min-w-0 max-w-full">
                <Link
                  href={routes.university(u.slug)}
                  className="brutal brutal-hover group flex h-full w-full min-w-0 flex-col justify-between gap-5 p-5 bg-card"
                >
                  <span className="block space-y-3 min-w-0">
                    <span className="grid size-11 place-items-center border-2 border-border bg-primary transition-colors group-hover:bg-accent shadow-hard-sm">
                      <GraduationCap className="size-5" aria-hidden="true" />
                    </span>
                    <span className="block font-display text-2xl sm:text-3xl uppercase leading-[1.2] break-words group-hover:text-link transition-colors">
                      {u.name}
                    </span>
                    <span className="eyebrow block text-muted-foreground truncate">
                      {plural(u.paper_count, "paper")} · {plural(u.course_count, "course")}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {u.top_courses.map((c) => (
                      <span key={c.slug} className="eyebrow border-2 border-border px-1.5 py-0.5">
                        {c.name}
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            ))}

          {/* School Boards (RBSE, CBSE, UP Board, ICSE...) */}
          {showBoards &&
            displayedBoards.map((b) => (
              <li key={b.slug} className="w-full min-w-0 max-w-full">
                <Link
                  href={b.href}
                  className="brutal brutal-hover group flex h-full w-full min-w-0 flex-col justify-between gap-5 p-5 bg-card"
                >
                  <span className="block space-y-3 min-w-0">
                    <span className="grid size-11 place-items-center border-2 border-border bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-hard-sm">
                      {b.slug === "other-exams" ? (
                        <Award className="size-5" aria-hidden="true" />
                      ) : (
                        <School className="size-5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="block font-display text-2xl sm:text-3xl uppercase leading-[1.2] break-words group-hover:text-link transition-colors">
                      {b.name}
                    </span>
                    <span className="eyebrow block text-muted-foreground truncate">
                      {b.subtitle}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {b.tags.map((t) => (
                      <span key={t.label} className="eyebrow border-2 border-border px-1.5 py-0.5">
                        {t.label}
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
        </TileGrid>
      )}
    </section>
  );
}

const HOME_EXAM_TABS = [
  { id: "all", label: "All Popular" },
  { id: "school-boards", label: "School Boards (RBSE, CBSE)" },
  { id: "banking-ssc", label: "Banking & SSC" },
  { id: "civil-services", label: "Civil Services" },
  { id: "engineering", label: "Engineering" },
  { id: "medical", label: "Medical & Nursing" },
  { id: "teaching", label: "Teaching & TET" },
  { id: "defence", label: "Defence" },
];

/** Popular exams. Data: GET /api/exams (server-rendered first, refreshed on load). */
export function ExamsSection({ initial }: { initial: ExamSummary[] | null }) {
  const [activeTab, setActiveTab] = useState("all");
  const { data, isPending, isError, error, refetch } = useExams(undefined, initial);

  const allExams = (data ?? []).filter((e) => e.paper_count > 0);

  // Filter exams based on selected domain
  const filteredExams = allExams.filter((e) => {
    if (activeTab === "all") return true;
    const domain = getExamDomain(e);
    if (activeTab === "banking-ssc") {
      return domain.id === "banking-finance" || domain.id === "ssc-police";
    }
    return domain.id === activeTab;
  }).slice(0, 24);

  return (
    <section aria-labelledby="exams-heading" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          id="exams-heading"
          eyebrow="National & other state archives"
          title="Competitive exams & all boards"
          href={routes.exams}
          linkLabel="All 300+ exams"
        />
      </div>

      {/* Domain Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {HOME_EXAM_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 border-2 border-border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-hard-sm hover:-translate-x-px hover:-translate-y-px",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-hard"
                  : "bg-card text-foreground hover:bg-primary/20",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <TileSkeletons />
      ) : isError && allExams.length === 0 ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : filteredExams.length > 0 ? (
        <TileGrid>
          {filteredExams.map((e, i) => {
            const domain = getExamDomain(e);
            const DomainIcon = domain.icon;
            const cleanTitle = cleanExamTitle(e.name, e.slug);
            return (
              <li key={e.slug} className="w-full min-w-0 max-w-full">
                <Link
                  href={routes.exam(e.slug)}
                  className="brutal brutal-hover flex h-full w-full min-w-0 flex-col justify-between gap-5 p-5 bg-card"
                >
                  <span className="flex items-start justify-between">
                    <span
                      className={`grid size-11 place-items-center border-2 border-border ${i % 2 ? "bg-accent" : "bg-primary"}`}
                    >
                      <DomainIcon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="eyebrow border border-border/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {e.kind === "board" ? "School Board" : domain.label}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block font-display text-2xl uppercase leading-snug break-words">
                      {cleanTitle}
                    </span>
                    <span className="eyebrow mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-muted-foreground">
                      <span className="font-bold text-foreground">{plural(e.paper_count, "paper")}</span>
                      {e.year_min && (
                        <span>{yearRange(e.year_min, e.year_max)}</span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </TileGrid>
      ) : (
        <EmptyState
          title="No exams in this category"
          description="Try switching categories or view all available examinations."
        />
      )}
    </section>
  );
}

/** Latest papers. Data: GET /api/papers?sort=latest&size=8. */
export function LatestPapersSection({
  initial,
  size = 8,
}: {
  initial: Paginated<PaperSummary> | null;
  size?: number;
}) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching, error, refetch } = useLatestPapers(
    size,
    page,
    initial,
  );
  const papers = data?.items ?? [];
  const total = data?.total ?? 0;

  const nextBatch = () => {
    setPage((p) => (p >= 6 || (total > 0 && p * size >= total) ? 1 : p + 1));
  };

  return (
    <section aria-labelledby="latest-heading" className="space-y-8 w-full min-w-0 max-w-full">
      <div className="flex flex-wrap items-end justify-between gap-3 w-full min-w-0">
        <div className="space-y-2 min-w-0">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
            Fresh in the vault
          </p>
          <h2 id="latest-heading" className="text-3xl sm:text-4xl lg:text-5xl break-words leading-none">
            Recently added papers
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={nextBatch}
            disabled={isFetching}
            className="flex items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            title="Show different recently added papers"
          >
            <Shuffle className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Shuffle papers</span>
            {page > 1 && <span className="bg-primary px-1 text-[10px]">Batch {page}</span>}
          </button>
          <Link
            href="/search?sort=latest"
            className="inline-flex items-center gap-2 border-2 border-border bg-card px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-primary hover:shadow-hard hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5"
          >
            Search all <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      {isPending ? (
        <PaperListSkeleton count={size} />
      ) : isError && papers.length === 0 ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : papers.length > 0 ? (
        <PaperList papers={papers} />
      ) : (
        <EmptyState
          title="No papers yet"
          description="New question papers appear here as soon as they are published."
        />
      )}
    </section>
  );
}
