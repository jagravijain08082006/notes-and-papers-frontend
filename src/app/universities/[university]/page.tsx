import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock, FileText, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getUniversity } from "@/lib/api/public";
import { routes } from "@/lib/routes";
import { buildMetadata, collectionPageLd, itemListLd } from "@/lib/seo";
import { plural } from "@/lib/utils";

// Shorter than other pages: if the API was down during a build, the degraded page heals within the hour.
export const revalidate = 3600;
export const dynamicParams = true;

// Nothing is built in advance: Cloudflare's free KV allows about 1,000 cache writes a day and every deploy would spend
// hundreds of them on pre-built pages. These pages are built on their first visit and then cached (see `revalidate`).
export function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  try {
    return { u: await getUniversity(slug), failed: false };
  } catch {
    return { u: null, failed: true };
  }
}

export async function generateMetadata(props: PageProps<"/universities/[university]">) {
  const slug = (await props.params).university;
  const { u, failed } = await load(slug);
  if (!u && !failed) return { title: "University not found", robots: { index: false } };
  const name = u?.name ?? "University";
  return buildMetadata({
    title: `${name} Question Papers - All Courses`,
    description: `Previous year question papers for every ${name} course${
      u
        ? `: ${u.courses
            .slice(0, 5)
            .map((c) => c.name)
            .join(", ")} and more`
        : ""
    }. Free PDFs, subject-wise.`,
    path: routes.university(slug),
    noindex: !u && !failed,
    keywords: [
      `${name} question papers`,
      `${name} pyq`,
      `${name} previous year papers`,
      `${name} exam papers pdf`,
    ],
  });
}

export default async function UniversityPage(props: PageProps<"/universities/[university]">) {
  const slug = (await props.params).university;
  const { u, failed } = await load(slug);
  const path = routes.university(slug);
  if (failed) {
    return (
      <EmptyState
        title="Courses are temporarily unavailable"
        description="Please try again in a few minutes, or use the search."
        action={{ href: "/search", label: "Search papers" }}
      />
    );
  }
  if (!u) notFound();

  const semesterCourses = u.courses.filter((c) => c.scheme === "semester");
  const annualCourses = u.courses.filter((c) => c.scheme === "annual");
  const otherCourses = u.courses.filter(
    (c) => c.scheme !== "semester" && c.scheme !== "annual",
  );

  const hasMultipleCategories =
    (semesterCourses.length > 0 && annualCourses.length > 0) ||
    (otherCourses.length > 0 && (semesterCourses.length > 0 || annualCourses.length > 0));

  const renderCourseGrid = (courses: typeof u.courses) => (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <li key={c.slug}>
          <Card className="group h-full transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard border-2 border-border">
            <Link href={routes.course(slug, c.slug)} className="flex flex-col h-full justify-between p-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-11 sm:size-12 shrink-0 place-items-center border-2 border-border bg-primary text-foreground shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <GraduationCap className="size-5 sm:size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="inline-flex items-center gap-1 border border-border bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                        {c.scheme === "semester" ? (
                          <>
                            <CalendarDays className="size-3" aria-hidden="true" />
                            Semester System
                          </>
                        ) : c.scheme === "annual" ? (
                          <>
                            <Clock className="size-3" aria-hidden="true" />
                            Annual System
                          </>
                        ) : (
                          "Course"
                        )}
                      </span>
                      {c.level && (
                        <span className="border border-border bg-card px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          {c.level === "UG" ? "Undergraduate" : c.level === "PG" ? "Postgraduate" : c.level}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-link transition-colors">{c.name}</h2>
                  </div>
                  <ArrowRight className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {plural(c.paper_count, "paper")} available
                </span>
                <span className="text-foreground group-hover:underline">Explore papers &rarr;</span>
              </div>
            </Link>
          </Card>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
          { name: u.name, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
          {u.name} Question Papers
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {u.description ??
            `Browse ${u.paper_count} previous year question papers across ${u.courses.length} courses of ${u.name}. Pick your course, then your part or semester, then your subject.`}
        </p>

        {hasMultipleCategories && (
          <nav aria-label="Course categories" className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase text-muted-foreground mr-1">Jump to:</span>
            {semesterCourses.length > 0 && (
              <a
                href="#semester-programmes"
                className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-primary"
              >
                Semester System ({semesterCourses.length})
              </a>
            )}
            {annualCourses.length > 0 && (
              <a
                href="#annual-programmes"
                className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-primary"
              >
                Annual System ({annualCourses.length})
              </a>
            )}
            {otherCourses.length > 0 && (
              <a
                href="#other-programmes"
                className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-primary"
              >
                Other Courses ({otherCourses.length})
              </a>
            )}
          </nav>
        )}
      </header>

      {u.courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Courses will appear here once papers are published."
        />
      ) : hasMultipleCategories ? (
        <div className="space-y-10">
          {semesterCourses.length > 0 && (
            <section id="semester-programmes" className="scroll-mt-24 space-y-4">
              <div className="border-b-2 border-border pb-2">
                <h2 className="flex items-center gap-3 text-2xl sm:text-3xl">
                  <CalendarDays className="size-6 text-foreground" aria-hidden="true" />
                  Semester System Programmes
                  <span className="border-2 border-border bg-primary px-2 py-0.5 text-xs font-bold">
                    {semesterCourses.length}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Courses divided into half-yearly semesters (Semester 1 to 8).
                </p>
              </div>
              {renderCourseGrid(semesterCourses)}
            </section>
          )}

          {annualCourses.length > 0 && (
            <section id="annual-programmes" className="scroll-mt-24 space-y-4">
              <div className="border-b-2 border-border pb-2">
                <h2 className="flex items-center gap-3 text-2xl sm:text-3xl">
                  <Clock className="size-6 text-foreground" aria-hidden="true" />
                  Annual System Programmes
                  <span className="border-2 border-border bg-primary px-2 py-0.5 text-xs font-bold">
                    {annualCourses.length}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Programmes evaluated annually (Part 1, Part 2, Part 3 / Year-wise).
                </p>
              </div>
              {renderCourseGrid(annualCourses)}
            </section>
          )}

          {otherCourses.length > 0 && (
            <section id="other-programmes" className="scroll-mt-24 space-y-4">
              <div className="border-b-2 border-border pb-2">
                <h2 className="flex items-center gap-3 text-2xl sm:text-3xl">
                  <BookOpen className="size-6 text-foreground" aria-hidden="true" />
                  Other Programmes
                  <span className="border-2 border-border bg-primary px-2 py-0.5 text-xs font-bold">
                    {otherCourses.length}
                  </span>
                </h2>
              </div>
              {renderCourseGrid(otherCourses)}
            </section>
          )}
        </div>
      ) : (
        <section className="space-y-4">
          <div className="border-b-2 border-border pb-2">
            <h2 className="flex items-center gap-3 text-2xl sm:text-3xl">
              {semesterCourses.length > 0
                ? "Semester System Programmes"
                : annualCourses.length > 0
                  ? "Annual System Programmes"
                  : "All Courses"}
              <span className="border-2 border-border bg-primary px-2 py-0.5 text-xs font-bold">
                {u.courses.length}
              </span>
            </h2>
          </div>
          {renderCourseGrid(u.courses)}
        </section>
      )}

      <JsonLdScript
        data={[
          collectionPageLd(`${u.name} Question Papers`, path, "All courses"),
          itemListLd(u.courses.map((c) => ({ name: c.name, path: routes.course(slug, c.slug) }))),
        ]}
      />
    </div>
  );
}
