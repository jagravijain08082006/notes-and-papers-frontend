import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { InteractiveCardLink } from "@/components/shared/interactive-card";
import { JsonLdScript } from "@/components/shared/json-ld";
import { getCourse } from "@/lib/api/public";
import { routes, termLabel } from "@/lib/routes";
import { buildMetadata, collectionPageLd, courseMeta } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 86400;
export const dynamicParams = true;

// Built at deploy time on Vercel (see src/lib/static-params.ts); anything else is built on first visit and then cached.
export async function generateStaticParams() {
  return (await prebuiltPaths("courses"))
    .filter((p) => p.length === 3)
    .map((p) => ({ university: p[1], course: p[2] }));
}

export async function generateMetadata(props: PageProps<"/universities/[university]/[course]">) {
  const { university, course } = await props.params;
  const c = await getCourse(university, course);
  if (!c) return { title: "Course not found", robots: { index: false } };
  const m = courseMeta(c);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: routes.course(university, course),
    noindex: false,
    keywords: [
      `${c.name} question papers`,
      `${c.name} ${c.university_name}`,
      `${c.name} syllabus pyq`,
    ],
  });
}

import type { TermSummary } from "@/lib/api/types";
import { prebuiltPaths } from "@/lib/static-params";

interface TermGroup {
  title: string;
  subtitle?: string;
  terms: TermSummary[];
}

function groupTermsBySystem(terms: TermSummary[], scheme: "annual" | "semester" | null): TermGroup[] {
  if (scheme === "annual" || (terms.length > 0 && terms.every((t) => t.kind === "part" || t.kind === "year"))) {
    return [
      {
        title: "Annual Examination System",
        subtitle: "Year-wise examination parts / years",
        terms: [...terms].sort((a, b) => a.number - b.number),
      },
    ];
  }

  const sorted = [...terms].sort((a, b) => a.number - b.number);
  const yearMap = new Map<number, TermSummary[]>();
  const otherTerms: TermSummary[] = [];

  for (const t of sorted) {
    if (t.kind === "semester" && t.number) {
      const year = Math.ceil(t.number / 2);
      const list = yearMap.get(year) ?? [];
      list.push(t);
      yearMap.set(year, list);
    } else {
      otherTerms.push(t);
    }
  }

  const groups: TermGroup[] = [];
  const years = [...yearMap.keys()].sort((a, b) => a - b);
  for (const y of years) {
    const semStart = (y - 1) * 2 + 1;
    const semEnd = y * 2;
    const suffix = y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th";
    groups.push({
      title: `${y}${suffix} Year`,
      subtitle: `Semester ${semStart} & Semester ${semEnd}`,
      terms: yearMap.get(y)!,
    });
  }

  if (otherTerms.length > 0) {
    groups.push({
      title: "Other Terms / Annual Parts",
      terms: otherTerms,
    });
  }

  return groups.length > 0 ? groups : [{ title: "All Semesters", terms }];
}

export default async function CoursePage(props: PageProps<"/universities/[university]/[course]">) {
  const { university, course } = await props.params;
  const c = await getCourse(university, course);
  if (!c) notFound();
  const m = courseMeta(c);
  const path = routes.course(university, course);
  const termGroups = groupTermsBySystem(c.terms, c.scheme);

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
          { name: c.university_name, path: routes.university(university) },
          { name: c.name, path },
        ]}
      />
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-2 border-border bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">
            {c.scheme === "semester" ? "Semester Scheme" : c.scheme === "annual" ? "Annual Scheme" : "Programme"}
          </span>
          {c.level && (
            <span className="border-2 border-border bg-card px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {c.level === "UG" ? "Undergraduate" : c.level === "PG" ? "Postgraduate" : c.level}
            </span>
          )}
          <span className="border-2 border-border bg-card px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">
            {plural(c.paper_count, "paper")}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">{m.h1}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {c.description ??
            `${c.name} is a ${c.scheme === "semester" ? "semester" : "annual"}-scheme programme of ${c.university_name}. We have ${c.paper_count} previous year question papers across ${c.terms.length} ${c.scheme === "semester" ? "semesters" : "parts"}. Choose yours below.`}
        </p>
      </header>

      {c.terms.length === 0 ? (
        <EmptyState
          title="No papers yet"
          description={`No ${c.name} papers have been published yet. Try the search or another course.`}
        />
      ) : (
        <div className="space-y-10">
          {termGroups.map((g) => (
            <section key={g.title} className="space-y-4">
              <div className="border-b-2 border-border pb-2">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-bold">{g.title}</h2>
                  {g.subtitle && (
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      ({g.subtitle})
                    </span>
                  )}
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {g.terms.map((t) => (
                  <li key={t.slug}>
                    <InteractiveCardLink
                      href={routes.term(university, course, t.slug)}
                      title={termLabel(t.kind, t.number)}
                      subtitle={`${plural(t.subject_count, "subject")} · ${plural(t.paper_count, "paper")}`}
                      icon={<CalendarDays className="size-5" aria-hidden="true" />}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* SUGGESTIONS & RELATED COURSES */}
          <section className="space-y-5 border-t-2 border-border pt-10">
            <div className="space-y-1">
              <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-bold tracking-wider shadow-hard-sm">
                Explore More
              </span>
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
                Popular Courses &amp; Program Suggestions
              </h2>
              <p className="text-sm text-muted-foreground">
                Jump to other undergraduate, postgraduate, and professional streams in {c.university_name}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {[
                { name: "BCA", label: "Bachelor of Computer Apps", slug: "bca" },
                { name: "B.Sc", label: "Bachelor of Science", slug: "bsc" },
                { name: "B.Com", label: "Bachelor of Commerce", slug: "bcom" },
                { name: "B.A.", label: "Bachelor of Arts", slug: "ba" },
                { name: "B.Ed", label: "Bachelor of Education", slug: "bed" },
                { name: "BBA", label: "Business Administration", slug: "bba" },
                { name: "M.Com", label: "Master of Commerce", slug: "mcom" },
                { name: "M.Sc", label: "Master of Science", slug: "msc" },
                { name: "M.A.", label: "Master of Arts", slug: "ma" },
                { name: "MBA", label: "Master of Business Admin", slug: "mba" },
                { name: "LLB", label: "Bachelor of Legislative Law", slug: "llb" },
                { name: "PGDCA", label: "Postgrad Computer Apps", slug: "pgdca" },
              ]
                .filter((item) => item.slug !== course)
                .slice(0, 8)
                .map((item) => (
                  <Link
                    key={item.slug}
                    href={routes.course(university, item.slug)}
                    className="flex flex-col justify-between border-2 border-border bg-card p-3 shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary/20 hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <span className="font-display text-lg uppercase tracking-wider text-foreground">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      )}

      <JsonLdScript data={collectionPageLd(m.h1, path, m.description)} />
    </div>
  );
}
