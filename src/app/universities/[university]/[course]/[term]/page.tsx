import Link from "next/link";
import { BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { InteractiveCardLink } from "@/components/shared/interactive-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { getTerm } from "@/lib/api/public";
import { routes, yearRange } from "@/lib/routes";
import { buildMetadata, collectionPageLd, faqLd, itemListLd, termMeta } from "@/lib/seo";
import { plural } from "@/lib/utils";
import { prebuiltPaths } from "@/lib/static-params";

export const revalidate = 2592000;
export const dynamicParams = true;

// Built at deploy time on Vercel (see src/lib/static-params.ts); anything else is built on first visit and then cached.
export async function generateStaticParams() {
  return (await prebuiltPaths("courses"))
    .filter((p) => p.length === 4)
    .map((p) => ({ university: p[1], course: p[2], term: p[3] }));
}

export async function generateMetadata(
  props: PageProps<"/universities/[university]/[course]/[term]">,
) {
  const { university, course, term } = await props.params;
  const t = await getTerm(university, course, term);
  if (!t) return { title: "Not found", robots: { index: false } };
  const m = termMeta(t);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: routes.term(university, course, term),
    noindex: false,
    keywords: [
      `${t.course.name} ${m.label}`,
      `${t.course.name} question papers`,
      `${t.university.name} ${t.course.name}`,
    ],
  });
}

export default async function TermPage(
  props: PageProps<"/universities/[university]/[course]/[term]">,
) {
  const { university, course, term } = await props.params;
  const t = await getTerm(university, course, term);
  if (!t) notFound();
  const m = termMeta(t);
  const path = routes.term(university, course, term);
  const faqs = [
    {
      q: `Where can I find ${t.course.name} ${m.label} question papers of ${t.university.name}?`,
      a: `They are on this page: ${t.paper_count} previous year papers across ${t.subjects.length} subjects${t.year_min ? `, from ${yearRange(t.year_min, t.year_max)}` : ""}. Pick a subject to see every available year.`,
    },
    {
      q: `Which subjects are in ${t.course.name} ${m.label}?`,
      a: t.subjects.length
        ? `${t.subjects
            .slice(0, 8)
            .map((s) => s.name)
            .join(", ")}${t.subjects.length > 8 ? ` and ${t.subjects.length - 8} more` : ""}.`
        : "Papers for this term are being added.",
    },
    {
      q: `Can I download these papers for free?`,
      a: "Yes. Every paper is a PDF you can download with a free account.",
    },
  ];

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
          { name: t.university.name, path: routes.university(university) },
          { name: t.course.name, path: routes.course(university, course) },
          { name: m.label, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">{m.h1}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {t.paper_count} previous year question papers across {t.subjects.length} subjects for{" "}
          {t.course.name} {m.label}
          {t.year_min ? `, from ${yearRange(t.year_min, t.year_max)}` : ""}. Select a subject to see
          every available year.
        </p>
      </header>

      {t.subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Subjects appear once papers are published."
        />
      ) : (
        <div className="space-y-12">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.subjects.map((s) => (
              <li key={s.slug}>
                <InteractiveCardLink
                  href={routes.subject(university, course, term, s.slug)}
                  title={s.name}
                  subtitle={`${plural(s.paper_count, "paper")}${s.year_min ? ` · ${yearRange(s.year_min, s.year_max)}` : ""}${s.paper_code ? ` · ${s.paper_code}` : ""}`}
                  icon={<BookOpen className="size-5" aria-hidden="true" />}
                />
              </li>
            ))}
          </ul>

          {/* SUGGESTIONS & NAVIGATION */}
          <section className="space-y-4 border-t-2 border-border pt-10">
            <div className="space-y-1">
              <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-bold tracking-wider shadow-hard-sm">
                Suggestions &amp; Quick Links
              </span>
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
                Explore More in {t.course.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={routes.course(university, course)}
                className="inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                ← All Semesters of {t.course.name}
              </Link>
              <Link
                href={routes.university(university)}
                className="inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm transition-all hover:bg-primary hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                All Courses in {t.university.name}
              </Link>
              <Link
                href={`/search?course=${encodeURIComponent(t.course.name)}`}
                className="inline-flex items-center gap-2 border-2 border-border bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              >
                Search all {t.course.name} papers →
              </Link>
            </div>
          </section>
        </div>
      )}

      <section aria-labelledby="term-faq" className="max-w-4xl space-y-4">
        <h2 id="term-faq" className="text-2xl sm:text-3xl">
          Common questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      <JsonLdScript
        data={[
          collectionPageLd(m.h1, path, m.description),
          faqLd(faqs),
          itemListLd(
            t.subjects.map((s) => ({
              name: s.name,
              path: routes.subject(university, course, term, s.slug),
            })),
          ),
        ]}
      />
    </div>
  );
}
