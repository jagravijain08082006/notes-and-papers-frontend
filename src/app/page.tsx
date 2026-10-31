import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Download,
  GraduationCap,
  School,
  Search,
} from "lucide-react";
import {
  UniversitiesSection,
  ExamsSection,
  LatestPapersSection,
} from "@/components/shared/home-sections";
import { SearchBar } from "@/components/shared/search-bar";
import { buttonVariants } from "@/components/ui/button";
import { getExams, getLatestPapers, getStats, getUniversities } from "@/lib/api/public";
import { getNavFlags } from "@/lib/api/nav-flags";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Rajasthan Board, UNIRAJ & RTU Kota Question Papers PDF | Notes & Papers",
  description:
    "Free previous year question papers for Rajasthan Board (RBSE Classes 9-12), University of Rajasthan (UNIRAJ Jaipur B.Com, B.Sc, BCA, BA, B.Ed) & RTU Kota B.Tech. Download authentic watermark-free PYQ PDFs.",
  path: "/",
  keywords: [
    "rajasthan board question papers",
    "rbse 10th previous year papers",
    "rbse 12th question papers",
    "rbse model papers",
    "rajasthan university question papers",
    "uniraj question papers",
    "uor jaipur previous year papers",
    "uniraj bcom question paper",
    "uniraj bca papers",
    "uniraj bsc question paper",
    "uniraj b.ed papers",
    "uniraj ba question paper",
    "rtu previous year papers",
    "rtu kota question papers",
    "rtu btech question papers",
    "notes and papers",
    "notes and papers dpdns",
    "notesandpapers",
    "free pyq pdf download rajasthan",
  ],
});

const QUICK = [
  { label: "RBSE 10th", href: "/exams/uni-rajasthanboard" },
  { label: "RBSE 12th", href: "/exams/uni-rajasthanboard" },
  { label: "UNIRAJ B.Com", href: "/universities/rajasthan-university/bcom" },
  { label: "UNIRAJ B.Sc", href: "/universities/rajasthan-university/bsc" },
  { label: "UNIRAJ BCA", href: "/universities/rajasthan-university/bca" },
  { label: "RTU B.Tech", href: "/universities/rajasthan-technical-university" },
  { label: "Other Exams", href: "/exams" },
];

/**
 * Server-render the first copy (real links and content for search engines and no-JS visitors), then the
 * sections below refresh themselves from the JSON API once the page loads.
 * An unreachable API must not take the page down, so each fetch degrades to null.
 */
async function load() {
  const [uni, latest, exams, stats] = await Promise.allSettled([
    getUniversities(),
    getLatestPapers(8),
    getExams(),
    getStats(),
  ]);
  return {
    university: uni.status === "fulfilled" ? uni.value : null,
    latest: latest.status === "fulfilled" ? latest.value : null,
    exams: exams.status === "fulfilled" ? exams.value : null,
    stats: stats.status === "fulfilled" ? stats.value : null,
  };
}

export default async function HomePage() {
  const { university, latest, exams } = await load();
  const flags = await getNavFlags();

  // Dynamic paper counts from DB / API
  const rbseExam = exams?.find((e) => e.slug === "uni-rajasthanboard");
  const unirajUni = university?.find((u) => u.slug === "rajasthan-university");
  const rtuUni = university?.find((u) => u.slug === "rajasthan-technical-university");

  const rbseCount = rbseExam?.paper_count && rbseExam.paper_count > 0 ? rbseExam.paper_count : 1906;
  const unirajCount = unirajUni?.paper_count && unirajUni.paper_count > 0 ? unirajUni.paper_count : 2379;
  const rtuCount = rtuUni?.paper_count && rtuUni.paper_count > 0 ? rtuUni.paper_count : 2824;

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      {/* COMPACT & CLEAN HERO */}
      <section
        aria-labelledby="hero-heading"
        className="mx-auto max-w-4xl text-center space-y-4 pt-2 pb-2 sm:pt-6 sm:pb-3"
      >
        <div className="inline-flex items-center gap-2 border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-hard-sm">
          <span className="size-2 bg-accent" aria-hidden="true" />
          RBSE · UNIRAJ · RTU Kota
        </div>

        <h1
          id="hero-heading"
          className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight leading-none"
        >
          Previous Year Papers
        </h1>

        <div className="max-w-2xl mx-auto space-y-3 pt-1">
          <SearchBar size="lg" />
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground font-bold uppercase">Popular:</span>
            {QUICK.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="border-2 border-border bg-card px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RAJASTHAN 3 CORE CARDS */}
      <section
        aria-label="Rajasthan Core Portals"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-5xl mx-auto w-full"
      >
        <Link
          href={routes.rbse}
          className="brutal brutal-hover flex flex-col justify-between p-5 bg-card border-2 border-border group shadow-hard"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm">
              <School className="size-5" aria-hidden="true" />
            </span>
            <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[10px] font-black">
              {rbseCount.toLocaleString("en-IN")} Papers
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="font-display text-2xl uppercase group-hover:text-link transition-colors leading-tight">
              RBSE Board
            </h2>
            <p className="text-xs text-muted-foreground">
              Classes 9th to 12th · Model Papers
            </p>
          </div>
          <span className="eyebrow mt-4 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            Browse Papers <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href={routes.uniraj}
          className="brutal brutal-hover flex flex-col justify-between p-5 bg-card border-2 border-border group shadow-hard"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[10px] font-black">
              {unirajCount.toLocaleString("en-IN")} Papers
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="font-display text-2xl uppercase group-hover:text-link transition-colors leading-tight">
              UNIRAJ Jaipur
            </h2>
            <p className="text-xs text-muted-foreground">
              B.Com, B.Sc, BCA, B.A, B.Ed &amp; PG
            </p>
          </div>
          <span className="eyebrow mt-4 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            Browse Papers <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href={routes.rtu}
          className="brutal brutal-hover flex flex-col justify-between p-5 bg-card border-2 border-border group shadow-hard"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[10px] font-black">
              {rtuCount.toLocaleString("en-IN")} Papers
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="font-display text-2xl uppercase group-hover:text-link transition-colors leading-tight">
              RTU Kota
            </h2>
            <p className="text-xs text-muted-foreground">
              B.Tech Engineering Semesters 1 to 8
            </p>
          </div>
          <span className="eyebrow mt-4 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            Browse Papers <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>
      </section>

      <LatestPapersSection initial={latest} />
      <UniversitiesSection initial={university} />
      <ExamsSection initial={exams} />

      {/* HOW IT WORKS (Shown on desktop, hidden on mobile for clean quick access) */}
      <section aria-labelledby="how-heading" className="hidden md:block space-y-8">
        <div className="space-y-2">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
            Simple
          </p>
          <h2 id="how-heading" className="text-4xl sm:text-5xl">
            Three steps to your paper
          </h2>
        </div>
        <ol className="grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Search,
              t: "Search or browse",
              d: "Type a subject, course or exam, or walk through courses and exams step by step.",
            },
            {
              n: "02",
              icon: BookOpen,
              t: "Open the paper",
              d: "See the year, session, paper code and other years of the same subject before you download.",
            },
            {
              n: "03",
              icon: Download,
              t: "Download free",
              d: "Log in once, then download. We take you straight back to the paper you wanted.",
            },
          ].map((s) => (
            <li key={s.n} className="brutal space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-6xl leading-[1.2] text-muted-foreground/40">
                  {s.n}
                </span>
                <span className="grid size-12 place-items-center border-2 border-border bg-primary">
                  <s.icon className="size-6" aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-lg font-bold uppercase">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="cta-heading"
        className="border-2 border-border bg-primary p-5 text-primary-foreground shadow-hard sm:p-7"
      >
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <h2 id="cta-heading" className="text-2xl sm:text-3xl">
              Can&apos;t find your paper?
            </h2>
            <p className="max-w-xl text-sm font-medium">
              Tell us which paper is missing, or upload one you have. Every upload is reviewed
              before it goes live.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Request a paper
            </Link>
            {flags.uploads && (
              <Link
                href="/upload"
                className={cn(buttonVariants({ size: "sm" }), "bg-foreground text-background")}
              >
                Upload a paper
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
