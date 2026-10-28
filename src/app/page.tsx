import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Download,
  School,
  ScrollText,
  Search,
  ShieldCheck,
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
import { cn, plural } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Notes & Papers - Previous Year Question Papers PDF",
  description:
    "Free previous year question papers for Rajasthan University (UNIRAJ / UOR), RTU Kota, school boards (RBSE, CBSE) & competitive exams (UPSC, SSC, NEET, GATE). Download authentic PYQ PDFs free.",
  path: "/",
  keywords: [
    "notes and papers",
    "notes and papers dpdns",
    "notesandpapers",
    "notesandpapers dpdns org",
    "notes and papers question papers",
    "previous year question papers",
    "free pyq pdf download",
    "rajasthan university question papers",
    "uniraj question papers",
    "uor question papers",
    "uniraj bcom question paper",
    "uniraj bca papers",
    "uniraj bsc question paper",
    "uniraj b.ed papers",
    "uniraj ba question paper",
    "rtu previous year papers",
    "rtu kota question papers",
    "cbse sample papers",
    "rbse board papers",
    "upsc previous year papers",
    "ssc question papers",
  ],
});

const QUICK = [
  { label: "UNIRAJ B.Com", href: "/universities/rajasthan-university/bcom" },
  { label: "UNIRAJ B.Sc", href: "/universities/rajasthan-university/bsc" },
  { label: "UNIRAJ BCA", href: "/universities/rajasthan-university/bca" },
  { label: "UNIRAJ B.Ed", href: "/universities/rajasthan-university/b-ed" },
  { label: "UNIRAJ B.A", href: "/universities/rajasthan-university/ba" },
  { label: "RTU B.Tech", href: "/universities/rajasthan-technical-university" },
  { label: "RBSE Board", href: "/exams/uni-rajasthanboard" },
  { label: "CBSE Board", href: "/exams/uni-cbseboardonline" },
  { label: "UPSC PYQ", href: "/exams/upsc" },
  { label: "NEET UG", href: "/exams/neet" },
  { label: "GATE", href: "/exams/gate" },
  { label: "SSC", href: "/exams/ssc" },
  { label: "SBI Clerk", href: "/exams/sbi-clerk" },
  { label: "CG Open School", href: "/exams/cg-open-school" },
  { label: "All universities", href: "/universities" },
  { label: "All exams", href: "/exams" },
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
  const { university, latest, exams, stats } = await load();
  const flags = await getNavFlags();

  const uniPapers = stats?.university_papers ?? 0;
  const examPapers = stats?.exam_papers ?? 0;
  const boardPapers = stats?.board_papers ?? 0;
  const totalPapers = stats?.papers_total ?? 0;
  const courseCount = stats?.courses ?? 0;
  const examCount = stats?.exams ?? 0;

  const categories = [
    {
      href: routes.universities,
      icon: Building2,
      title: "University exams",
      text: "Rajasthan University, RTU and more: papers by course, term and subject.",
      count: uniPapers,
      tone: "bg-primary",
    },
    {
      href: `${routes.exams}#competitive-exams`,
      icon: ScrollText,
      title: "Competitive exams",
      text: "UPSC, SSC, GATE, NEET, UGC NET, state PSCs and more.",
      count: examPapers,
      tone: "bg-accent",
    },
    {
      href: `${routes.exams}#school-boards`,
      icon: School,
      title: "School boards",
      text: "Open school and board previous year papers.",
      count: boardPapers,
      tone: "bg-primary",
    },
    {
      href: "/notes",
      icon: BookOpen,
      title: "Study notes",
      text: "Notes shared by students, reviewed before they are published.",
      count: null,
      tone: "bg-accent",
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-20 lg:space-y-28">
      {/* HERO */}
      <section
        aria-labelledby="hero-heading"
        className="grid items-start gap-8 sm:gap-10 py-1 sm:py-2 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:py-10"
      >
        <div className="space-y-6 sm:space-y-8">
          <p className="eyebrow inline-flex items-center gap-2 border-2 border-border bg-card px-2.5 py-1">
            <span className="size-2 bg-accent" aria-hidden="true" /> Open academic vault
          </p>
          <h1
            id="hero-heading"
            className="text-4xl xs:text-5xl sm:text-7xl lg:text-8xl break-words leading-none"
          >
            Previous year papers.
            <br />
            Turn study into{" "}
            <span className="inline-block -rotate-1 border-2 border-border bg-primary px-3 shadow-hard">
              success.
            </span>
          </h1>
          <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Download authentic{" "}
            <strong className="font-semibold text-foreground">previous year papers</strong> to{" "}
            <strong className="font-semibold text-foreground">turn study into success</strong>.
            Access over {totalPapers > 0 ? totalPapers.toLocaleString("en-IN") : "thousands of"}{" "}
            verified question papers and notes for university students, board candidates, and
            competitive exam aspirants. Search, preview, and download free.
          </p>
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <SearchBar size="lg" />
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
              <span className="eyebrow text-xs text-muted-foreground">Quick links:</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {QUICK.map((q) => (
                  <Link
                    key={q.label}
                    href={q.href}
                    className="border-2 border-border bg-card px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold uppercase tracking-wide shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {q.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside
          aria-label="Library at a glance"
          className="brutal space-y-3 sm:space-y-5 border-2 border-border bg-card p-3.5 sm:p-6 shadow-hard sm:shadow-hard-lg transition-transform lg:rotate-1 hover:rotate-0 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex items-center justify-between border-b-2 border-border pb-2.5 sm:pb-3">
            <p className="eyebrow tracking-wider text-xs sm:text-sm">Vault metrics</p>
            <span className="eyebrow flex items-center gap-1.5 sm:gap-2 border-2 border-border bg-primary px-2 py-0.5 text-[10px] sm:text-xs font-bold shadow-hard-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-foreground"></span>
              </span>
              LIVE VAULT
            </span>
          </div>
          <dl className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            {[
              { v: totalPapers, l: "Papers", highlight: true },
              { v: courseCount, l: "Courses", highlight: false },
              { v: examCount, l: "Exams & boards", highlight: false },
            ].map((m) => (
              <div
                key={m.l}
                className={cn(
                  "flex flex-col justify-between border-2 border-border p-2 sm:p-3.5 transition-all shadow-hard-sm",
                  m.highlight ? "bg-primary text-primary-foreground" : "bg-background",
                )}
              >
                <dd className="font-display text-xl xs:text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-wide whitespace-nowrap">
                  {m.v.toLocaleString("en-IN")}
                </dd>
                <dt className="eyebrow mt-1 text-[9px] sm:text-xs text-foreground/80 truncate">
                  {m.l}
                </dt>
              </div>
            ))}
          </dl>
          <ul className="hidden sm:block space-y-2.5 text-xs sm:text-sm font-medium border-t-2 border-border/40 pt-3">
            <li className="flex items-center gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center border border-border bg-primary">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
              </span>
              <span>Clean, watermark-free PDFs</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center border border-border bg-accent text-accent-foreground">
                <Download className="size-3.5" aria-hidden="true" />
              </span>
              <span>Free downloads with account</span>
            </li>
          </ul>
          <Link
            href={routes.universities}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "hidden sm:inline-flex w-full uppercase font-bold tracking-wider shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5",
            )}
          >
            Explore the catalog <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </section>

      {/* CATEGORIES */}
      <section
        aria-labelledby="cat-heading"
        className="space-y-5 sm:space-y-8 w-full min-w-0 max-w-full"
      >
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground text-[10px] sm:text-xs">
            Start here
          </p>
          <h2
            id="cat-heading"
            className="text-2xl sm:text-4xl lg:text-5xl break-words leading-none"
          >
            Explore the vault by category
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 w-full min-w-0 max-w-full">
          {categories.map((c) => (
            <li key={c.title} className="w-full min-w-0 max-w-full">
              <Link
                href={c.href}
                className="brutal brutal-hover flex h-full flex-col gap-3 sm:gap-5 p-3.5 sm:p-6 bg-card w-full min-w-0"
              >
                <span
                  className={`grid size-10 sm:size-14 place-items-center border-2 border-border ${c.tone}`}
                >
                  <c.icon className="size-5 sm:size-7" aria-hidden="true" />
                </span>
                <span className="space-y-1 sm:space-y-2 min-w-0">
                  <span className="block font-display text-base sm:text-3xl uppercase leading-[1.2] break-words">
                    {c.title}
                  </span>
                  <span className="hidden sm:block text-sm text-muted-foreground">{c.text}</span>
                </span>
                <span className="eyebrow mt-auto flex items-center justify-between border-t-2 border-border pt-2 sm:pt-3 text-[10px] sm:text-xs">
                  {c.count !== null ? plural(c.count, "paper") : "Browse notes"}
                  <ArrowRight className="size-3 sm:size-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ExamsSection initial={exams} />
      <UniversitiesSection initial={university} />
      <LatestPapersSection initial={latest} />

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
        className="border-2 border-border bg-primary p-6 text-primary-foreground shadow-hard-lg sm:p-12"
      >
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <h2 id="cta-heading" className="text-4xl sm:text-5xl lg:text-6xl">
              Can&apos;t find your paper?
            </h2>
            <p className="max-w-xl font-medium">
              Tell us which paper is missing, or upload one you have. Every upload is reviewed
              before it goes live.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Request a paper
            </Link>
            {flags.uploads && (
              <Link
                href="/upload"
                className={cn(buttonVariants({ size: "lg" }), "bg-foreground text-background")}
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
