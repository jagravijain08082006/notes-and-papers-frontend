import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { ExamsCatalogView } from "@/components/shared/exams-catalog-view";
import { getExams } from "@/lib/api/public";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 604800;

export const metadata = buildMetadata({
  title: "Exam & Board Question Papers: UPSC, SSC, NEET, GATE",
  description:
    "Categorized previous year question papers for competitive exams, police, banking, civil services and school boards: UPSC, SSC, GATE, NEET, UGC NET, state PSCs and more.",
  path: "/exams",
});

export default async function ExamsPage() {
  const all = await getExams().catch(() => null);
  if (!all) {
    return (
      <EmptyState
        title="Exams are temporarily unavailable"
        description="Please try again in a few minutes."
        action={{ href: "/", label: "Go to home" }}
      />
    );
  }

  // Filter exams that have published papers
  const withPapers = all.filter((e) => e.paper_count > 0);
  const totalPaperCount = withPapers.reduce((n, e) => n + e.paper_count, 0);

  return (
    <div className="space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Exams", path: routes.exams },
        ]}
      />
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground font-bold">
            Catalog Directory
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
            Exam & board question papers
          </h1>
        </div>
        <p className="max-w-3xl text-muted-foreground text-base sm:text-lg">
          Explore {plural(totalPaperCount, "paper")} across {plural(withPapers.length, "competitive examination and school board")}.
          Filter by educational domain or search for your exam below.
        </p>
      </header>

      <ExamsCatalogView exams={withPapers} />
    </div>
  );
}

