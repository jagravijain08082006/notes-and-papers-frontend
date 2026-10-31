import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Download,
  GraduationCap,
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
  { label: "RBSE 10th Board", href: "/exams/uni-rajasthanboard" },
  { label: "RBSE 12th Science", href: "/exams/uni-rajasthanboard" },
  { label: "RBSE 12th Commerce", href: "/exams/uni-rajasthanboard" },
  { label: "RBSE 12th Arts", href: "/exams/uni-rajasthanboard" },
  { label: "RBSE Model Papers", href: "/exams/uni-rajasthanboard" },
  { label: "UNIRAJ B.Com", href: "/universities/rajasthan-university/bcom" },
  { label: "UNIRAJ B.Sc", href: "/universities/rajasthan-university/bsc" },
  { label: "UNIRAJ BCA", href: "/universities/rajasthan-university/bca" },
  { label: "UNIRAJ B.A", href: "/universities/rajasthan-university/ba" },
  { label: "UNIRAJ B.Ed", href: "/universities/rajasthan-university/b-ed" },
  { label: "RTU B.Tech Semesters", href: "/universities/rajasthan-technical-university" },
  { label: "RTU Kota CSE", href: "/universities/rajasthan-technical-university" },
  { label: "All Rajasthan Boards", href: "/boards" },
  { label: "Other Exams & Boards", href: "/exams" },
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

  const totalPapers = stats?.papers_total ?? 0;
  const courseCount = stats?.courses ?? 0;
  const examCount = stats?.exams ?? 0;

  return (
    <div className="space-y-10 sm:space-y-16 lg:space-y-24">
      {/* HERO */}
      <section
        aria-labelledby="hero-heading"
        className="grid items-start gap-8 sm:gap-10 py-1 sm:py-2 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:py-8"
      >
        <div className="space-y-6 sm:space-y-8">
          <p className="eyebrow inline-flex items-center gap-2 border-2 border-border bg-card px-2.5 py-1">
            <span className="size-2 bg-accent" aria-hidden="true" /> Rajasthan Academic Vault · RBSE · UNIRAJ · RTU
          </p>
          <h1
            id="hero-heading"
            className="text-4xl xs:text-5xl sm:text-7xl lg:text-8xl break-words leading-none"
          >
            Rajasthan Board,
            <br />
            UNIRAJ &amp; RTU.
            <br />
            Turn study into{" "}
            <span className="inline-block -rotate-1 border-2 border-border bg-primary px-3 shadow-hard">
              success.
            </span>
          </h1>
          <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Download authentic, watermark-free{" "}
            <strong className="font-semibold text-foreground">previous year question papers (PYQs)</strong> for{" "}
            <strong className="font-semibold text-foreground">Rajasthan Board (RBSE Classes 9–12)</strong>,{" "}
            <strong className="font-semibold text-foreground">University of Rajasthan (UNIRAJ Jaipur)</strong>, and{" "}
            <strong className="font-semibold text-foreground">Rajasthan Technical University (RTU Kota)</strong>.
            Over {totalPapers > 0 ? totalPapers.toLocaleString("en-IN") : "thousands of"}{" "}
            verified past papers and solutions. Search, preview, and download free.
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
            <p className="eyebrow tracking-wider text-xs sm:text-sm">Rajasthan Vault Metrics</p>
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
              <span>Free instant downloads</span>
            </li>
          </ul>
          <Link
            href={routes.rbse}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "hidden sm:inline-flex w-full uppercase font-bold tracking-wider shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5",
            )}
          >
            Explore Rajasthan Catalog <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </section>

      {/* RAJASTHAN CORE 3 PILLARS */}
      <section aria-labelledby="rajasthan-core-heading" className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
        <div className="space-y-2 min-w-0">
          <p className="eyebrow inline-block bg-primary px-2.5 py-0.5 text-primary-foreground font-black text-xs uppercase tracking-wider border border-border shadow-hard-sm">
            Primary Focus · Rajasthan Education Vault
          </p>
          <h2 id="rajasthan-core-heading" className="text-3xl sm:text-5xl lg:text-6xl break-words leading-none font-display uppercase tracking-tight">
            Rajasthan Board, UNIRAJ &amp; RTU
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Direct access to verified past year examination papers, model papers, and semester archives for students in Rajasthan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 w-full min-w-0 max-w-full">
          {/* CARD 1: RBSE Rajasthan Board */}
          <div className="brutal brutal-hover flex flex-col justify-between gap-5 p-5 sm:p-6 bg-card border-2 border-border shadow-hard">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm">
                  <School className="size-6" aria-hidden="true" />
                </span>
                <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[11px] font-black">
                  1,900+ Papers
                </span>
              </div>
              <div>
                <Link href={routes.rbse} className="group">
                  <h3 className="font-display text-2xl sm:text-3xl uppercase leading-tight group-hover:text-link transition-colors">
                    RBSE Rajasthan Board
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Board of Secondary Education Rajasthan (BSER Ajmer). Secondary, Higher Secondary, Half-Yearly &amp; Model Papers.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  { label: "Class 10th Secondary", href: routes.rbse },
                  { label: "Class 12th Science", href: routes.rbse },
                  { label: "Class 12th Commerce", href: routes.rbse },
                  { label: "Class 12th Arts", href: routes.rbse },
                  { label: "Class 9th & 11th", href: routes.rbse },
                  { label: "Official Model Papers", href: routes.rbse },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="eyebrow border border-border bg-background px-2 py-0.5 text-[11px] font-bold hover:bg-primary transition-colors"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={routes.rbse}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full uppercase font-bold tracking-wider mt-2")}
            >
              Browse RBSE Papers <ArrowRight className="size-4 ml-1" />
            </Link>
          </div>

          {/* CARD 2: UNIRAJ Jaipur */}
          <div className="brutal brutal-hover flex flex-col justify-between gap-5 p-5 sm:p-6 bg-card border-2 border-border shadow-hard">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
                  <Building2 className="size-6" aria-hidden="true" />
                </span>
                <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[11px] font-black">
                  2,300+ Papers
                </span>
              </div>
              <div>
                <Link href={routes.uniraj} className="group">
                  <h3 className="font-display text-2xl sm:text-3xl uppercase leading-tight group-hover:text-link transition-colors">
                    Rajasthan University
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  University of Rajasthan (UNIRAJ / UOR Jaipur). Authentic past examination papers by faculty and year.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  { label: "B.Com (Parts 1, 2, 3)", href: "/universities/rajasthan-university/bcom" },
                  { label: "B.Sc (Pass & Hons)", href: "/universities/rajasthan-university/bsc" },
                  { label: "BCA (All Semesters)", href: "/universities/rajasthan-university/bca" },
                  { label: "B.A (Arts & Social)", href: "/universities/rajasthan-university/ba" },
                  { label: "B.Ed (Teacher Training)", href: "/universities/rajasthan-university/b-ed" },
                  { label: "M.Com / M.Sc / MA", href: routes.uniraj },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="eyebrow border border-border bg-background px-2 py-0.5 text-[11px] font-bold hover:bg-primary transition-colors"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={routes.uniraj}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full uppercase font-bold tracking-wider mt-2")}
            >
              Browse UNIRAJ Papers <ArrowRight className="size-4 ml-1" />
            </Link>
          </div>

          {/* CARD 3: RTU Kota */}
          <div className="brutal brutal-hover flex flex-col justify-between gap-5 p-5 sm:p-6 bg-card border-2 border-border shadow-hard">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm">
                  <GraduationCap className="size-6" aria-hidden="true" />
                </span>
                <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[11px] font-black">
                  2,800+ Papers
                </span>
              </div>
              <div>
                <Link href={routes.rtu} className="group">
                  <h3 className="font-display text-2xl sm:text-3xl uppercase leading-tight group-hover:text-link transition-colors">
                    RTU Kota (Engineering)
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Rajasthan Technical University (RTU Kota). B.Tech Semesters 1 to 8, M.Tech, MBA &amp; MCA papers.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  { label: "B.Tech Sem 1 & 2", href: routes.rtu },
                  { label: "Computer Science & IT", href: routes.rtu },
                  { label: "Mechanical Engineering", href: routes.rtu },
                  { label: "Civil Engineering", href: routes.rtu },
                  { label: "Electrical & ECE", href: routes.rtu },
                  { label: "MBA & MCA", href: routes.rtu },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="eyebrow border border-border bg-background px-2 py-0.5 text-[11px] font-bold hover:bg-primary transition-colors"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={routes.rtu}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full uppercase font-bold tracking-wider mt-2")}
            >
              Browse RTU Papers <ArrowRight className="size-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* SUPPRESSED / SECONDARY BANNER */}
        <div className="border-2 border-border bg-muted/30 p-4 sm:p-6 shadow-hard flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-sm uppercase tracking-wide text-foreground">
              Looking for other examinations or state boards?
            </p>
            <p className="text-xs text-muted-foreground max-w-xl">
              We also maintain archives for CBSE, UP Board, MP Board, ICSE, and 300+ national competitive exams (UPSC, GATE, SSC, NEET, UGC-NET).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href={routes.boards} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-bold uppercase")}>
              All Boards
            </Link>
            <Link href={routes.universities} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-bold uppercase")}>
              All Universities
            </Link>
            <Link href={routes.exams} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-bold uppercase")}>
              Other Exams
            </Link>
          </div>
        </div>
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
