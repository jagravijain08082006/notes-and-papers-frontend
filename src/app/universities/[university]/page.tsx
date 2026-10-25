import Link from "next/link";
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
    noindex: failed || !u || u.courses.length === 0,
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
          <Card className="h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
            <Link href={routes.course(slug, c.slug)} className="block space-y-2 p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="border border-border bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                  {c.scheme === "semester"
                    ? "Semester System"
                    : c.scheme === "annual"
                      ? "Annual System"
                      : "Course"}
                </span>
                {c.level && (
                  <span className="border border-border bg-card px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {c.level === "UG" ? "Undergraduate" : c.level === "PG" ? "Postgraduate" : c.level}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{c.name}</h2>
              <p className="text-sm text-muted-foreground">
                {plural(c.paper_count, "paper")} available
              </p>
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
