import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CheckCircle2, Clock, Download, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { PaperList } from "@/components/shared/paper-list";
import { ReportDialog } from "@/components/shared/report-dialog";
import { TrackOnMount } from "@/components/shared/tracker";
import { getLatestPapers, getPaper, getPaperRedirect } from "@/lib/api/public";
import type { PaperSummary } from "@/lib/api/types";
import { kindLabel, paperContext, paperHref, routes, subjectHref } from "@/lib/routes";
import { cleanPreviewExcerpt } from "@/lib/sanitize-preview";
import { breadcrumbLd, buildMetadata, faqLd, learningResourceLd, paperMeta } from "@/lib/seo";

export async function paperMetadata(slug: string) {
  const p = await getPaper(slug);
  if (!p) return { title: "Paper not found", robots: { index: false } };
  const m = paperMeta(p);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: paperHref(p),
    type: "article",
    keywords: p.meta_keywords,
    // Thin pages (no extracted text and no file metadata) stay out of the index.
    // Link-only pages carry metadata, not file text, by design, so they stay indexable.
    // A page still being prepared keeps its metadata and stays indexable; only an empty shell is kept out.
    noindex: !p.content_excerpt && !p.file_available && !p.title,
  });
}

/**
 * Renders a paper. `canonical` is the URL the current route serves; when the paper belongs somewhere else
 * (exam papers live under /exams/<exam>/<slug>) the visitor gets a permanent redirect to the canonical URL.
 */
export async function PaperPage({
  slug,
  canonical,
}: {
  slug: string;
  canonical: "paper" | { exam: string };
}) {
  const p = await getPaper(slug);
  if (!p) {
    const moved = await getPaperRedirect(slug);
    if (moved) permanentRedirect(routes.paper(moved.new_slug));
    notFound();
  }
  const here = canonical === "paper" ? routes.paper(slug) : routes.examPaper(canonical.exam, slug);
  if (paperHref(p) !== here) permanentRedirect(paperHref(p));
  const selfPath = paperHref(p);
  const m = paperMeta(p);
  const ready = p.file_available;

  const isCourse = Boolean(p.course_slug && p.term_slug);
  const uniName = p.university_name ?? "";
  const uniSlug = p.university_slug ?? "";
  const topic = p.subject_name ?? p.title;
  const cleanedExcerpt = cleanPreviewExcerpt(p.content_excerpt);

  const hasRelated = p.other_years.length > 0 || p.related.length > 0;
  let fallbackPapers: PaperSummary[] = [];
  if (!hasRelated) {
    try {
      const latest = await getLatestPapers(8);
      fallbackPapers = (latest.items ?? []).filter((item) => item.slug !== slug).slice(0, 6);
    } catch {
      fallbackPapers = [];
    }
  }
  const faqs = [
    {
      q: `Where can I download the ${m.h1}?`,
      a: `Log in and use the download button on this page to get the ${topic} ${p.year ?? ""} PDF.`.replace(
        /\s+/g,
        " ",
      ),
    },
    {
      q: `Which exam is this paper from?`,
      a: isCourse
        ? `It is a ${kindLabel(p.kind).toLowerCase()} for ${p.course_name} ${m.label} of ${uniName}${p.session ? `, ${p.session} session` : ""}.`
        : `It is a ${kindLabel(p.kind).toLowerCase()} listed under ${p.exam_name ?? "its exam"}${p.year ? `, ${p.year}` : ""}.`,
    },
  ];
  const crumbs = isCourse
    ? [
        { name: "Home", path: "/" },
        {
          name: uniName || "Universities",
          path: uniSlug ? routes.university(uniSlug) : routes.universities,
        },
        { name: p.course_name!, path: routes.course(uniSlug, p.course_slug!) },
        { name: m.label, path: routes.term(uniSlug, p.course_slug!, p.term_slug!) },
        { name: p.subject_name ?? "Paper", path: subjectHref(p) },
        { name: p.year ? String(p.year) : "Paper", path: selfPath },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Exams", path: routes.exams },
        ...(p.exam_slug
          ? [{ name: p.exam_name ?? p.exam_slug, path: routes.exam(p.exam_slug) }]
          : []),
        { name: p.title, path: selfPath },
      ];

  return (
    <article className="space-y-20">
      <TrackOnMount type="resource_view" paperSlug={slug} />
      <Breadcrumbs items={crumbs} />

      <header className="space-y-8">
        <div className="space-y-4">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
            {kindLabel(p.kind)}
            {p.year ? ` · ${p.year}` : ""}
          </p>
          <h1 className="max-w-6xl text-3xl sm:text-5xl lg:text-7xl break-words leading-tight">{m.h1}</h1>
          <p className="text-xl text-muted-foreground">
            {paperContext(p)}
            {isCourse && uniName ? ` · ${uniName}` : ""}
          </p>
        </div>

        <dl className="grid grid-cols-2 border-2 border-border bg-card shadow-hard sm:grid-cols-3 lg:grid-cols-5 [&>div]:border-b-2 [&>div]:border-r-2 [&>div]:border-border [&>div]:p-3.5 sm:[&>div]:p-5">
          {[
            ["Year", p.year ? String(p.year) : null],
            ["Session", p.session],
            ["Paper code", p.paper_code],
            ["Language", p.language],
            ["Type", kindLabel(p.kind)],
            ["Pages", p.pages ? String(p.pages) : null],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow text-muted-foreground">{k}</dt>
                <dd className="mt-2 font-display text-3xl uppercase leading-[1.2]">{v}</dd>
              </div>
            ))}
        </dl>

        {/* PREMIUM HIGH-IMPACT DOWNLOAD ACTION HERO */}
        <section
          aria-label="Download paper"
          className="my-8 overflow-hidden border-2 border-border bg-card shadow-hard-lg"
        >
          {/* TOP CONTRAST HEADER RIBBON */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-muted/60 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Verified Vault Copy
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 border border-border/80 bg-background px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground">
                <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
                Clean &amp; Watermark-Free
              </span>
            </div>

            <div className="flex items-center gap-2">
              <BookmarkButton slug={slug} size="sm" />
              <ReportDialog slug={slug} variant="outline" size="sm" />
            </div>
          </div>

          {/* MAIN ACTION BODY */}
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-display text-2xl uppercase leading-none tracking-wider sm:text-3xl text-foreground">
                    {ready ? "Instant PDF Download" : "PDF In Preparation"}
                  </h2>
                  {p.pages && (
                    <span className="border-2 border-border bg-accent px-2 py-0.5 text-xs font-bold uppercase text-accent-foreground shadow-hard-sm">
                      {p.pages} Pages
                    </span>
                  )}
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {ready
                    ? "Complete official question paper. Cleaned, formatted and optimized for fast mobile reading or high-quality printing."
                    : "We are currently formatting this official question paper with our clean cover pages. It will be ready shortly."}
                </p>
              </div>

              {/* TRUST HIGHLIGHTS ROW */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-bold uppercase tracking-wide text-foreground">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  Fast Direct CDN
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  Print-Ready Vector
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  100% Free
                </span>
              </div>
            </div>

            {/* ACTION BUTTON GROUP */}
            <div className="flex flex-col gap-2.5 sm:min-w-[240px]">
              {ready ? (
                <Link
                  href={routes.download(slug)}
                  className="inline-flex h-13 sm:h-14 w-full items-center justify-center gap-3 border-2 border-border bg-primary px-7 text-sm sm:text-base font-bold uppercase tracking-wider text-primary-foreground shadow-hard transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg hover:bg-primary/95 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Download className="size-5 shrink-0" aria-hidden="true" />
                  <span>Download PDF</span>
                </Link>
              ) : (
                <div className="inline-flex h-13 sm:h-14 w-full items-center justify-center gap-2.5 border-2 border-border bg-muted px-7 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  <Clock className="size-4.5 shrink-0" aria-hidden="true" />
                  <span>PDF Coming Soon</span>
                </div>
              )}

              {cleanedExcerpt && (
                <a
                  href="#excerpt-heading"
                  className="inline-flex h-9 w-full items-center justify-center gap-2 border-2 border-border bg-background px-3 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-muted hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  <span>Read Preview Online</span>
                </a>
              )}

              <p className="text-center font-mono text-[11px] font-medium text-muted-foreground">
                ⚡ Direct link · Free account
              </p>
            </div>
          </div>
        </section>
      </header>

      <section aria-labelledby="about-heading" className="max-w-5xl space-y-5">
        <h2 id="about-heading" className="text-3xl sm:text-4xl">
          About this paper
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          This is the {p.year ? `${p.year} ` : ""}
          {topic} {kindLabel(p.kind).toLowerCase()}
          {isCourse
            ? ` for ${p.course_name} ${m.label}${uniName ? ` of ${uniName}` : ""}`
            : p.exam_name
              ? ` (${p.exam_name})`
              : ""}
          . Practise with it to understand the exam pattern, the marking scheme and the questions
          that are asked again and again.{" "}
          <Link href={subjectHref(p)} className="text-link underline">
            {isCourse ? `See all ${topic} papers` : `More ${p.exam_name ?? "exam"} papers`}
          </Link>
          .
        </p>
      </section>

      {cleanedExcerpt && (
        <section aria-labelledby="excerpt-heading" className="max-w-5xl space-y-5">
          <h2 id="excerpt-heading" className="text-3xl sm:text-4xl">
            Paper preview
          </h2>
          <blockquote className="whitespace-pre-line border-2 border-border bg-card p-5 shadow-hard-sm text-sm leading-relaxed">
            {cleanedExcerpt}
          </blockquote>
        </section>
      )}

      {p.other_years.length > 0 && (
        <section aria-labelledby="years-heading" className="space-y-6">
          <h2 id="years-heading" className="text-3xl sm:text-4xl">
            Other years of {topic}
          </h2>
          <PaperList papers={p.other_years} />
        </section>
      )}

      {p.related.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-6">
          <h2 id="related-heading" className="text-3xl sm:text-4xl">
            Related papers
          </h2>
          <PaperList papers={p.related} />
        </section>
      )}

      {!hasRelated && fallbackPapers.length > 0 && (
        <section aria-labelledby="recent-heading" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-bold tracking-wider shadow-hard-sm">
                Keep Practicing
              </span>
              <h2 id="recent-heading" className="text-3xl sm:text-4xl font-display uppercase tracking-wider">
                Recent Question Papers
              </h2>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm hover:bg-primary hover:shadow-hard transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Browse All Papers →
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore recent question papers added across university courses and exam categories.
          </p>
          <PaperList papers={fallbackPapers} />
        </section>
      )}

      <section aria-labelledby="faq-heading" className="max-w-5xl space-y-5">
        <h2 id="faq-heading" className="text-3xl sm:text-4xl font-display uppercase tracking-wider">
          Frequently asked questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      {/* SUGGESTIONS & NEXT STEPS */}
      <section className="space-y-5 border-t-2 border-border pt-10">
        <div className="space-y-1">
          <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-bold tracking-wider shadow-hard-sm">
            Keep Practicing
          </span>
          <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
            Suggested Next Steps &amp; Related Links
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore more question papers, syllabus streams, and exam collections.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={subjectHref(p)}
            className="inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
          >
            {isCourse ? `All ${topic} question papers →` : `All ${p.exam_name ?? "exam"} papers →`}
          </Link>
          {isCourse && p.university_slug && p.course_slug && (
            <Link
              href={routes.course(p.university_slug, p.course_slug)}
              className="inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
            >
              All Semesters of {p.course_name} →
            </Link>
          )}
          <Link
            href="/search"
            className="inline-flex items-center gap-2 border-2 border-border bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
          >
            Search More Papers →
          </Link>
        </div>
      </section>

      <JsonLdScript data={[learningResourceLd(p, m.title, m.description), breadcrumbLd(crumbs), faqLd(faqs)]} />
    </article>
  );
}
