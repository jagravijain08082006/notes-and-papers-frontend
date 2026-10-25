import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getCourse } from "@/lib/api/public";
import { routes, termLabel } from "@/lib/routes";
import { buildMetadata, collectionPageLd, courseMeta } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 86400;
export const dynamicParams = true;

// Nothing is built in advance: Cloudflare's free KV allows about 1,000 cache writes a day and every deploy would spend
// hundreds of them on pre-built pages. These pages are built on their first visit and then cached (see `revalidate`).
export function generateStaticParams() {
  return [];
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
    noindex: c.paper_count === 0,
  });
}

import type { TermSummary } from "@/lib/api/types";

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
                    <Card className="h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                      <Link
                        href={routes.term(university, course, t.slug)}
                        className="block space-y-1 p-3.5 sm:p-5"
                      >
                        <h3 className="text-lg sm:text-2xl font-bold">{termLabel(t.kind, t.number)}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {plural(t.subject_count, "subject")} · {plural(t.paper_count, "paper")}
                        </p>
                      </Link>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <JsonLdScript data={collectionPageLd(m.h1, path, m.description)} />
    </div>
  );
}
