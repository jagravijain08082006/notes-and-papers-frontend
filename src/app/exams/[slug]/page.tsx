import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, Layers, ScrollText } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { RbseChannelView } from "@/components/shared/rbse-channel-view";
import { Badge } from "@/components/ui/badge";
import { getExam } from "@/lib/api/public";
import { cleanExamTitle } from "@/lib/exam-categories";
import { examSeo } from "@/lib/exam-seo";
import {
  getAllRbseChannelData,
  getRbseOverviewCards,
} from "@/lib/rbse-channels";
import { kindLabel, routes, yearRange } from "@/lib/routes";
import { buildMetadata, collectionPageLd, faqLd } from "@/lib/seo";
import { plural } from "@/lib/utils";
import type { ExamSection } from "@/lib/api/types";

export const revalidate = 3600;

export async function generateMetadata(props: PageProps<"/exams/[slug]">) {
  const { slug } = await props.params;
  const e = await getExam(slug).catch(() => null);
  if (!e) return { title: "Exam not found", robots: { index: false } };
  const seo = examSeo(slug, e);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: routes.exam(slug),
    noindex: false,
    keywords: seo.keywords,
  });
}

function byYear(papers: ExamSection["papers"]) {
  const groups = new Map<string, ExamSection["papers"]>();
  for (const p of papers) {
    const key = p.year ? String(p.year) : "Other";
    const existing = groups.get(key) ?? [];
    existing.push(p);
    groups.set(key, existing);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return Number(b) - Number(a);
  });
}

export default async function ExamPage(props: PageProps<"/exams/[slug]">) {
  const { slug } = await props.params;
  const exam = await getExam(slug);
  if (!exam) notFound();
  const path = routes.exam(slug);
  const examTitle = cleanExamTitle(exam.name, slug);
  const seo = examSeo(slug, exam);

  // Compute accurate total papers across all sections
  const totalSectionPapers = exam.sections.reduce(
    (sum, s) => sum + (s.papers?.length ?? s.paper_count ?? 0),
    0,
  );
  const totalDisplayPapers = Math.max(exam.paper_count ?? 0, totalSectionPapers);

  const isRbse = slug === "uni-rajasthanboard";
  const rbseData = isRbse ? getAllRbseChannelData(exam) : null;
  const overviewCards = isRbse ? getRbseOverviewCards(exam) : [];

  return (
    <div className="space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Exams", path: routes.exams },
          { name: examTitle, path },
        ]}
      />
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow inline-flex items-center gap-1.5 bg-accent px-2.5 py-1 text-accent-foreground font-bold uppercase tracking-wider shadow-hard-sm">
            <ScrollText className="size-3.5" aria-hidden="true" />
            {exam.kind === "board" ? "School board" : "Competitive exam"}
          </span>
        </div>
        <h1 className="max-w-5xl text-3xl sm:text-5xl lg:text-7xl break-words leading-tight">
          {seo.h1}
        </h1>
        <div className="max-w-3xl space-y-3 text-base text-muted-foreground sm:text-lg">
          {seo.intro.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        <p className="flex flex-wrap gap-3">
          <span className="border-2 border-border bg-primary px-3 py-1 text-sm font-bold uppercase tracking-wider shadow-hard-sm">
            {plural(totalDisplayPapers, "paper")}
          </span>
          {exam.year_min && (
            <span className="border-2 border-border bg-card px-3 py-1 text-sm font-bold uppercase tracking-wider">
              {yearRange(exam.year_min, exam.year_max)}
            </span>
          )}
          <span className="border-2 border-border bg-card px-3 py-1 text-sm font-bold uppercase tracking-wider">
            {plural(exam.sections.length, "section")}
          </span>
        </p>
        {exam.sections.length > 1 && (
          <nav aria-label="Sections" className="flex flex-wrap gap-2 pt-1">
            {exam.sections.map((s, i) => {
              const count = s.papers?.length ?? s.paper_count;
              return (
                <a
                  key={s.name}
                  href={`#sec-${i}`}
                  className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-primary shadow-hard-sm transition-all"
                >
                  <Layers className="size-3 text-muted-foreground" aria-hidden="true" />
                  <span>{s.name}</span>
                  <span className="border border-border/40 bg-muted px-1 py-0.2 text-[10px] font-black">
                    {count}
                  </span>
                </a>
              );
            })}
          </nav>
        )}
      </header>

      {isRbse && rbseData ? (
        <div className="space-y-12">
          {/* PRIMARY FUNNEL CHANNELS GRID */}
          <section aria-labelledby="rbse-channels-heading" className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="eyebrow inline-block bg-primary px-2.5 py-0.5 text-primary-foreground font-black uppercase tracking-wider self-start shadow-hard-sm">
                Direct Channels &amp; Class Funnels
              </span>
              <h2 id="rbse-channels-heading" className="text-2xl sm:text-4xl font-display uppercase tracking-wide">
                Select Your Class or Examination Vault
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Choose your specific academic stage below for dedicated subject archives, stream-wise question papers (Science, Commerce, Arts), and official model question blueprints.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overviewCards.map((c) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className="brutal brutal-hover flex flex-col justify-between p-5 bg-card border-2 border-border group shadow-hard"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow border-2 border-border bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase">
                        {c.badge}
                      </span>
                      <span className="eyebrow border-2 border-border bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground shadow-hard-sm">
                        {c.paperCount} Papers
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-xl uppercase group-hover:text-link transition-colors leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {c.desc}
                      </p>
                    </div>

                    {c.subBreakdown.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {c.subBreakdown.slice(0, 3).map((sub) => (
                          <span
                            key={sub.label}
                            className="border border-border/60 bg-muted px-1.5 py-0.2 text-[10px] font-bold uppercase text-foreground/80"
                          >
                            {sub.label}: {sub.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="eyebrow mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:translate-x-1 transition-transform">
                    Explore {c.shortTitle} Papers <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* INTERACTIVE CHANNEL & YEAR BROWSER */}
          <section className="space-y-6 border-t-2 border-border pt-8">
            <div className="space-y-1">
              <span className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground font-bold uppercase tracking-wider">
                Browse All Archives
              </span>
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide">
                Filter &amp; Search All RBSE Papers
              </h2>
            </div>
            <RbseChannelView
              currentChannel="all"
              allChannels={overviewCards}
              subtypeGroups={rbseData.subtypeGroups}
              totalPapers={rbseData.totalPapers}
              availableYears={rbseData.years}
              examSlug="uni-rajasthanboard"
            />
          </section>
        </div>
      ) : (
        <>
          {exam.sections.length === 0 && (
            <p className="text-muted-foreground">No papers have been published for this exam yet.</p>
          )}

          {exam.sections.map((s, i) => {
            const yearGroups = byYear(s.papers);
            const sectionCount = s.papers?.length ?? s.paper_count;
            return (
              <section
                key={s.name}
                id={`sec-${i}`}
                aria-labelledby={`sec-h-${i}`}
                className="scroll-mt-24 space-y-6"
              >
                <div className="border-b-2 border-border pb-3">
                  <h2
                    id={`sec-h-${i}`}
                    className="flex flex-wrap items-baseline gap-3 font-sans text-2xl font-bold normal-case leading-snug tracking-normal"
                  >
                    <span>{s.name}</span>
                    <span className="border-2 border-border bg-primary px-2.5 py-0.5 text-xs font-bold shadow-hard-sm">
                      {plural(sectionCount, "paper")}
                    </span>
                  </h2>
                  {yearGroups.length > 1 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-muted-foreground uppercase mr-1">
                        Filter Year:
                      </span>
                      {yearGroups.map(([yr, yPapers]) => (
                        <a
                          key={yr}
                          href={`#sec-${i}-${yr}`}
                          className="border border-border bg-card px-2 py-0.5 font-bold uppercase hover:bg-primary transition-colors"
                        >
                          {yr} ({yPapers.length})
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {yearGroups.map(([year, papers]) => (
                    <div key={year} id={`sec-${i}-${year}`} className="scroll-mt-28 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="border-2 border-border bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-hard-sm">
                          {year === "Other" ? "Other Years" : `Year ${year}`}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {plural(papers.length, "paper")} available
                        </span>
                      </div>

                      <ul className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2 w-full min-w-0">
                        {papers.map((p, pIndex) => (
                          <li key={p.slug} className="w-full min-w-0">
                            <Link
                              href={routes.examPaper(slug, p.slug)}
                              className="brutal brutal-hover group flex w-full min-w-0 items-center justify-between gap-3.5 p-4 sm:p-5 bg-card transition-all"
                            >
                              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                <span className="grid size-11 sm:size-12 shrink-0 place-items-center border-2 border-border bg-primary shadow-hard-sm group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                                  <FileText className="size-5 sm:size-6" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1 space-y-1.5 overflow-hidden">
                                  <span className="line-clamp-2 block font-bold leading-snug break-words text-sm sm:text-base">
                                    {p.title}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {papers.length > 1 && (
                                      <span className="border border-border/60 bg-muted px-1.5 py-0.2 text-[11px] font-bold uppercase">
                                        Paper #{pIndex + 1}
                                      </span>
                                    )}
                                    {p.year && <Badge tone="primary">{p.year}</Badge>}
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
              </section>
            );
          })}
        </>
      )}

      {exam.sections.length > 0 && (
        <section
          aria-labelledby="exam-faq"
          className="max-w-4xl space-y-4 border-t-2 border-border pt-10"
        >
          <h2 id="exam-faq" className="text-3xl sm:text-4xl">
            {seo.short} papers: common questions
          </h2>
          <FaqAccordion faqs={seo.faqs} />
        </section>
      )}

      <JsonLdScript
        data={[
          collectionPageLd(`${seo.short} previous year question papers`, path, seo.description),
          faqLd(seo.faqs),
        ]}
      />
    </div>
  );
}
