import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, School } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { ExamsCatalogView } from "@/components/shared/exams-catalog-view";
import { getExams } from "@/lib/api/public";
import { cleanExamTitle, getExamDomain } from "@/lib/exam-categories";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "School Board Question Papers: RBSE, CBSE, ICSE & State Boards PDF",
  description:
    "Download free previous year question papers and model test papers for RBSE Rajasthan Board (Class 9-12), CBSE, ICSE, and state education boards across India.",
  path: "/boards",
  keywords: [
    "rajasthan board question papers",
    "rbse question papers",
    "rbse class 10 papers",
    "rbse class 12 papers",
    "cbse sample papers",
    "school board pyq pdf",
    "state board exam papers",
  ],
});

export default async function BoardsPage() {
  const all = await getExams().catch(() => null);
  if (!all) {
    return (
      <EmptyState
        title="Boards are temporarily unavailable"
        description="Please try again in a few minutes."
        action={{ href: "/", label: "Go to home" }}
      />
    );
  }

  // Filter school boards that have published papers
  const boards = all.filter((e) => {
    if (e.paper_count <= 0) return false;
    const domain = getExamDomain(e);
    return e.kind === "board" || domain.id === "school-boards";
  });

  const totalPaperCount = boards.reduce((n, e) => n + e.paper_count, 0);
  const rbse = boards.find((b) => b.slug === "uni-rajasthanboard");

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Boards", path: "/boards" },
        ]}
      />

      <header className="space-y-3">
        <div className="space-y-2">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground font-bold">
            School Boards Directory
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
            School board question papers
          </h1>
        </div>
        <p className="max-w-3xl text-muted-foreground text-base sm:text-lg">
          Explore {plural(totalPaperCount, "paper")} across {plural(boards.length, "school board")}. Download
          authentic past exam papers, model test papers, and blueprint solutions for Class 9, 10, 11, and 12.
        </p>
      </header>

      {/* FEATURED: RAJASTHAN BOARD (RBSE) HERO SHOWCASE */}
      {rbse && (
        <section aria-labelledby="featured-rbse-heading" className="border-4 border-border bg-card p-6 sm:p-8 shadow-hard space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-bold tracking-wider shadow-hard-sm">
                Featured State Board
              </span>
              <h2 id="featured-rbse-heading" className="text-2xl sm:text-4xl font-display uppercase tracking-wide">
                RBSE Board (Rajasthan BSER Ajmer)
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Board of Secondary Education, Rajasthan. Authentic question papers, half-yearly exams, and official model papers with watermarks cleaned.
              </p>
            </div>
            <Link
              href="/exams/uni-rajasthanboard"
              className="inline-flex items-center gap-2 self-start border-2 border-border bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              View All RBSE Papers ({rbse.paper_count}) →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Class 10th Secondary", desc: "Board Final & Half Yearly", path: "/exams/uni-rajasthanboard/class-10" },
              { label: "Class 12th Sr. Secondary", desc: "Science, Commerce, Arts", path: "/exams/uni-rajasthanboard/class-12" },
              { label: "Class 9th Secondary", desc: "Pre-Board & Annual", path: "/exams/uni-rajasthanboard/class-9" },
              { label: "Class 11th Higher Secondary", desc: "Compulsory & Optional", path: "/exams/uni-rajasthanboard/class-11" },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.path}
                className="group border-2 border-border bg-background p-4 shadow-hard-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-hard"
              >
                <p className="eyebrow text-muted-foreground group-hover:text-accent-foreground">RBSE</p>
                <h3 className="mt-1 font-display text-lg uppercase leading-tight">{c.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground group-hover:text-accent-foreground/80">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ALL BOARDS CATALOG */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
          All School &amp; Open Boards
        </h2>
        <ExamsCatalogView exams={boards} />
      </section>
    </div>
  );
}

