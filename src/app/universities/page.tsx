import Link from "next/link";
import { ArrowRight, Building2, FileText, GraduationCap, School } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getUniversities } from "@/lib/api/public";
import { routes } from "@/lib/routes";
import { buildMetadata, collectionPageLd, faqLd, itemListLd } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "University Previous Year Question Papers PDF (UNIRAJ, RTU)",
  description:
    "Download previous year question papers of Rajasthan University (UNIRAJ) and RTU Kota. Pick your course and semester, then view or download free PDFs.",
  path: routes.universities,
  keywords: [
    "university previous year question papers",
    "university question papers pdf",
    "rajasthan university question papers",
    "uniraj question papers pdf",
    "rtu kota question papers",
    "btech previous year question papers",
  ],
});

const POPULAR_EXAMS = [
  { label: "SSC", href: "/exams/ssc" },
  { label: "SBI Clerk", href: "/exams/sbi-clerk" },
  { label: "UPSC", href: "/exams/upsc" },
  { label: "GATE", href: "/exams/gate" },
  { label: "NEET", href: "/exams/neet" },
  { label: "UGC NET", href: "/exams/ugc-net" },
  { label: "CG Open School", href: "/exams/cg-open-school" },
];

export default async function UniversitiesPage() {
  const unis = await getUniversities().catch(() => null);
  const totalPapers = (unis ?? []).reduce((n, u) => n + u.paper_count, 0);
  const faqs = [
    {
      q: "Where can I download university previous year question papers?",
      a: "Choose your university below, then your course, semester or year, and your subject. Each paper opens as a PDF you can view online and download free with an account.",
    },
    {
      q: "Which universities have question papers here?",
      a:
        unis && unis.length > 0
          ? `${unis.map((u) => u.name).join(" and ")}${unis.length > 1 ? ", with" : " with"} ${totalPapers.toLocaleString("en-IN")} papers in total. More universities are added as their papers are published.`
          : "Rajasthan University (UNIRAJ) and Rajasthan Technical University (RTU Kota) at the moment.",
    },
    {
      q: "Are the PDFs free and watermark-free?",
      a: "Yes. Every PDF is free, cleaned of other websites' watermarks and carries a cover page from Notes & Papers.",
    },
  ];

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
          University Previous Year Question Papers
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {totalPapers > 0
            ? `${totalPapers.toLocaleString("en-IN")} previous year question papers`
            : "Previous year question papers"}{" "}
          for Rajasthan University (UNIRAJ), RTU Kota and more, organised by course, semester and
          subject. Pick your university, then your course, term and subject, and download the PDF
          free.
        </p>
      </header>

      {!unis || unis.length === 0 ? (
        <EmptyState
          title="Universities are temporarily unavailable"
          description="Please try again in a few minutes, or use the search."
          action={{ href: "/search", label: "Search papers" }}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {unis.map((u) => (
            <li key={u.slug}>
              <Card className="group h-full transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard border-2 border-border">
                <Link
                  href={routes.university(u.slug)}
                  className="flex flex-col h-full justify-between p-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-11 sm:size-12 shrink-0 place-items-center border-2 border-border bg-primary text-foreground shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                        <Building2 className="size-5 sm:size-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-link transition-colors">
                          {u.name}
                        </h2>
                      </div>
                      <ArrowRight
                        className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="inline-flex items-center gap-1 border border-border/70 bg-muted px-2 py-0.5 uppercase tracking-wide">
                        <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        {plural(u.paper_count, "paper")}
                      </span>
                      <span className="inline-flex items-center gap-1 border border-border/70 bg-muted px-2 py-0.5 uppercase tracking-wide">
                        <GraduationCap
                          className="size-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {plural(u.course_count, "course")}
                      </span>
                    </div>
                  </div>

                  {u.top_courses.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <span className="font-bold text-foreground">Top Courses: </span>
                        {u.top_courses.map((c) => c.name).join(" · ")}
                      </p>
                    </div>
                  )}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* School & State Education Boards */}
      <section className="space-y-6 border-t-2 border-border pt-10">
        <div className="space-y-2">
          <span className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground font-bold">
            Secondary & Higher Secondary
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold">School &amp; State Education Boards</h2>
          <p className="max-w-3xl text-sm sm:text-base text-muted-foreground">
            Looking for school board question papers? Access previous year papers and sample test
            papers for central and state boards.
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              slug: "uni-rajasthanboard",
              name: "RBSE Rajasthan Board (BSER)",
              subtitle: "Class 10th & 12th · State Board",
              href: "/rajasthanboard",
              tags: [
                "Class 10th",
                "Class 12th Science",
                "Class 12th Commerce",
                "Class 12th Arts",
                "Model Papers",
              ],
            },
            {
              slug: "uni-cbseboardonline",
              name: "CBSE Central Board",
              subtitle: "Secondary & Senior Secondary · All India",
              href: "/exams/uni-cbseboardonline",
              tags: [
                "Class 10th Board",
                "Class 12th Science",
                "Class 12th Commerce",
                "Sample Papers",
              ],
            },
            {
              slug: "uni-upboardonline",
              name: "UP Board (UPMSP)",
              subtitle: "High School & Intermediate · Prayagraj",
              href: "/exams/uni-upboardonline",
              tags: ["Class 10 High School", "Class 12 Intermediate", "Model Papers"],
            },
            {
              slug: "uni-icseonline",
              name: "ICSE & ISC Board (CISCE)",
              subtitle: "Class 10th ICSE & 12th ISC · All India",
              href: "/exams/uni-icseonline",
              tags: ["Class 10 ICSE", "Class 12 ISC", "Specimen Papers"],
            },
            {
              slug: "uni-mpboardonline",
              name: "MP Board (MPBSE)",
              subtitle: "High School & HSS · Bhopal MP",
              href: "/exams/uni-mpboardonline",
              tags: ["Class 10th Board", "Class 12th Board", "Model Papers"],
            },
            {
              slug: "cg-open-school",
              name: "CG Open School Board",
              subtitle: "Class 10 & 12 · State Open Board",
              href: "/exams/cg-open-school",
              tags: ["Class 10th Open", "Class 12th Open"],
            },
          ].map((b) => (
            <li key={b.slug}>
              <Card className="group h-full transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard border-2 border-border">
                <Link href={b.href} className="flex flex-col h-full justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-11 sm:size-12 shrink-0 place-items-center border-2 border-border bg-accent text-accent-foreground shadow-hard-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <School className="size-5 sm:size-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-link transition-colors">
                          {b.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {b.subtitle}
                        </p>
                      </div>
                      <ArrowRight
                        className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {b.tags.map((t) => (
                        <span
                          key={t}
                          className="border border-border/70 bg-muted px-2 py-0.5 text-xs font-semibold uppercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="popular-exams" className="space-y-4 border-t-2 border-border pt-10">
        <h2 id="popular-exams" className="text-2xl sm:text-4xl font-bold">
          Popular exam papers
        </h2>
        <ul className="flex flex-wrap gap-2.5">
          {POPULAR_EXAMS.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="inline-block border-2 border-border bg-card px-3 py-1.5 text-sm font-bold uppercase tracking-wide shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:shadow-hard"
              >
                {e.label} previous year papers
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="uni-faq"
        className="max-w-4xl space-y-4 border-t-2 border-border pt-10"
      >
        <h2 id="uni-faq" className="text-2xl sm:text-4xl font-bold">
          University papers: common questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      {unis && (
        <JsonLdScript
          data={[
            faqLd(faqs),
            collectionPageLd(
              "University Previous Year Question Papers",
              routes.universities,
              "Previous year question papers of Indian universities",
            ),
            itemListLd(unis.map((u) => ({ name: u.name, path: routes.university(u.slug) }))),
          ]}
        />
      )}
    </div>
  );
}
