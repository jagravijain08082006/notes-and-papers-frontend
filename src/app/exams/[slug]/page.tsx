import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, Layers, ScrollText } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Badge } from "@/components/ui/badge";
import { getExam } from "@/lib/api/public";
import { cleanExamTitle } from "@/lib/exam-categories";
import { examSeo } from "@/lib/exam-seo";
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
