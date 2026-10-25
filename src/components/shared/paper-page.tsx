import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Download } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { PaperList } from "@/components/shared/paper-list";
import { ReportDialog } from "@/components/shared/report-dialog";
import { TrackOnMount } from "@/components/shared/tracker";
import { getPaper, getPaperRedirect } from "@/lib/api/public";
import { kindLabel, paperContext, paperHref, routes, subjectHref } from "@/lib/routes";
import { buildMetadata, faqLd, learningResourceLd, paperMeta } from "@/lib/seo";

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

        {/* MINIMAL REFINED DOWNLOAD ACTION CARD */}
        <div className="my-6 space-y-4 sm:my-8">
          <div className="border-2 border-border bg-card p-5 sm:p-6 shadow-hard">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-2 border-border/30 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow flex items-center gap-1.5 border border-border bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                    <Download className="size-3.5" aria-hidden="true" />
                    Official Question Paper
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Clean vault copy · Fast download
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookmarkButton slug={slug} size="sm" />
                  <ReportDialog slug={slug} />
                </div>
              </div>

              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
                  {ready
                    ? "Direct download with automated verification and interactive PDF reader."
                    : "We are preparing this PDF with our cover pages. It will be available shortly."}
                </p>

                {ready ? (
                  <Link
                    href={routes.download(slug)}
                    className="inline-flex h-11 sm:h-12 w-full sm:w-auto sm:min-w-[200px] shrink-0 items-center justify-center gap-2.5 border-2 border-border bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:bg-primary/90 hover:shadow-hard hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Download className="size-4.5" aria-hidden="true" />
                    <span>Download PDF</span>
                  </Link>
                ) : (
                  <div className="inline-flex h-11 sm:h-12 w-full sm:w-auto sm:min-w-[180px] shrink-0 items-center justify-center gap-2 border-2 border-border bg-muted px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <Download className="size-4" aria-hidden="true" /> PDF coming soon
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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

      {p.content_excerpt && (
        <section aria-labelledby="excerpt-heading" className="max-w-5xl space-y-5">
          <h2 id="excerpt-heading" className="text-3xl sm:text-4xl">
            Paper preview
          </h2>
          <blockquote className="whitespace-pre-line border-2 border-border bg-card p-5 shadow-hard-sm text-sm leading-relaxed">
            {p.content_excerpt}
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

      <section aria-labelledby="faq-heading" className="max-w-5xl space-y-5">
        <h2 id="faq-heading" className="text-3xl sm:text-4xl">
          Frequently asked questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      <JsonLdScript data={[learningResourceLd(p, m.title, m.description), faqLd(faqs)]} />
    </article>
  );
}
