import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { ExamsCatalogView } from "@/components/shared/exams-catalog-view";
import { getExams } from "@/lib/api/public";
import { EXAM_DOMAINS, getExamDomain } from "@/lib/exam-categories";
import { buildMetadata } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return EXAM_DOMAINS.filter((d) => d.id !== "all").map((d) => ({
    category: d.id,
  }));
}

export async function generateMetadata(props: PageProps<"/categories/[category]">) {
  const { category } = await props.params;
  const domain = EXAM_DOMAINS.find((d) => d.id === category);
  if (!domain || domain.id === "all") {
    return { title: "Category Not Found", robots: { index: false } };
  }

  return buildMetadata({
    title: `${domain.label} Question Papers & PYQs PDF Download`,
    description: `Download authentic previous year question papers for ${domain.label}: ${domain.description}. Free PDF downloads with solutions.`,
    path: `/categories/${domain.id}`,
    keywords: [
      `${domain.label.toLowerCase()} question papers`,
      `${domain.label.toLowerCase()} pyq pdf`,
      `${domain.id} exam papers`,
      "notes and papers",
    ],
  });
}

export default async function CategoryPage(props: PageProps<"/categories/[category]">) {
  const { category } = await props.params;
  const domain = EXAM_DOMAINS.find((d) => d.id === category);
  if (!domain || domain.id === "all") {
    notFound();
  }

  const all = await getExams().catch(() => null);
  if (!all) {
    return (
      <EmptyState
        title="Exams are temporarily unavailable"
        description="Please try again in a few minutes."
        action={{ href: "/categories", label: "All categories" }}
      />
    );
  }

  // Filter exams that belong to this domain and have papers
  const matchingExams = all.filter(
    (e) => e.paper_count > 0 && getExamDomain(e).id === domain.id,
  );
  const totalPaperCount = matchingExams.reduce((n, e) => n + e.paper_count, 0);

  const Icon = domain.icon;

  return (
    <div className="space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: domain.label, path: `/categories/${domain.id}` },
        ]}
      />

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm">
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow bg-accent px-2 py-0.5 text-accent-foreground font-bold inline-block">
              Exam Domain
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
              {domain.label} Question Papers
            </h1>
          </div>
        </div>
        <p className="max-w-3xl text-muted-foreground text-base sm:text-lg">
          {domain.description}. Explore {plural(totalPaperCount, "paper")} across {plural(matchingExams.length, "examination & board")}.
        </p>
      </header>

      <ExamsCatalogView exams={matchingExams} initialCategory={domain.id} hideCategoryPills />
    </div>
  );
}

