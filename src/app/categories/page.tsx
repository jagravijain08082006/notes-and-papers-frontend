import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { getExams } from "@/lib/api/public";
import { cleanExamTitle, EXAM_DOMAINS, getExamDomain } from "@/lib/exam-categories";
import { buildMetadata } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 604800;

export const metadata = buildMetadata({
  title: "Exam & Board Categories: Engineering, Medical, Civil Services, School Boards",
  description:
    "Explore previous year question papers categorized by educational domain: School Boards, Engineering, Medical, Civil Services, Banking, SSC, Police, Teaching, and Defence.",
  path: "/categories",
  keywords: [
    "exam categories pyq",
    "school boards previous papers",
    "engineering entrance papers",
    "medical entrance papers",
    "civil services previous year papers",
    "bank exam papers",
    "ssc police question papers",
  ],
});

export default async function CategoriesPage() {
  const all = await getExams().catch(() => null);
  if (!all) {
    return (
      <EmptyState
        title="Categories are temporarily unavailable"
        description="Please try again in a few minutes."
        action={{ href: "/", label: "Go to home" }}
      />
    );
  }

  const withPapers = all.filter((e) => e.paper_count > 0);
  const totalPaperCount = withPapers.reduce((n, e) => n + e.paper_count, 0);

  // Group exams by domain
  const domainGroups = EXAM_DOMAINS.filter((d) => d.id !== "all").map((domain) => {
    const domainExams = withPapers.filter((e) => getExamDomain(e).id === domain.id);
    const domainPaperCount = domainExams.reduce((sum, e) => sum + e.paper_count, 0);
    return {
      domain,
      exams: domainExams,
      paperCount: domainPaperCount,
    };
  }).filter((g) => g.exams.length > 0);

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
        ]}
      />

      <header className="space-y-3">
        <div className="space-y-2">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground font-bold">
            Catalog By Educational Domain
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
            Explore exams &amp; boards by category
          </h1>
        </div>
        <p className="max-w-3xl text-muted-foreground text-base sm:text-lg">
          Browse {plural(totalPaperCount, "paper")} across {plural(withPapers.length, "competitive examination and school board")}. Select your study stream or target recruitment sector below.
        </p>
      </header>

      {/* CATEGORY TILES GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {domainGroups.map(({ domain, exams, paperCount }) => {
          const Icon = domain.icon;
          const topExams = exams
            .sort((a, b) => b.paper_count - a.paper_count)
            .slice(0, 4);

          return (
            <article
              key={domain.id}
              className="flex flex-col justify-between border-2 border-border bg-card p-6 shadow-hard transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-12 items-center justify-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <span className="eyebrow border-2 border-border bg-muted px-2 py-0.5 font-bold text-foreground">
                    {plural(paperCount, "paper")}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-2xl uppercase leading-tight">
                    <Link
                      href={`/categories/${domain.id}`}
                      className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {domain.label}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {domain.description}
                  </p>
                </div>

                {/* Popular Exams in this Category */}
                <div className="space-y-1.5 border-t-2 border-border/60 pt-3">
                  <p className="eyebrow text-muted-foreground text-[10px]">Popular in this category:</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {topExams.map((e) => (
                      <li key={e.slug}>
                        <Link
                          href={`/exams/${e.slug}`}
                          className="eyebrow inline-block border border-border bg-background px-2 py-0.5 text-[11px] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {cleanExamTitle(e.name, e.slug)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-border">
                <Link
                  href={`/categories/${domain.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                >
                  Explore {domain.label} ({exams.length} exams) <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

