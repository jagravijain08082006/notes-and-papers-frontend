import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { RbseCardGrid } from "@/components/shared/rbse-simple";
import { getExam } from "@/lib/api/public";
import { getRbseOverviewCards } from "@/lib/rbse-channels";
import { buildMetadata, collectionPageLd, faqLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "RBSE Rajasthan Board Question Papers PDF (Class 9, 10, 11, 12)",
  description:
    "Download RBSE Rajasthan Board previous year question papers, model papers and half-yearly papers for Class 9, 10, 11 and 12. Free PDFs by class, subject and year.",
  path: "/rajasthanboard",
  keywords: [
    "rbse question papers",
    "rajasthan board previous year question papers",
    "rbse class 10 question paper pdf",
    "rbse class 12 question paper pdf",
    "rbse model papers",
  ],
});

const FAQS = [
  {
    q: "Where can I download RBSE previous year question papers?",
    a: "Choose your class below, then your subject. Each subject lists its papers year by year, newest first, and each paper opens as a free PDF.",
  },
  {
    q: "Which classes are covered?",
    a: "Class 9, 10, 11 and 12, plus the official RBSE model papers. Board final papers, half-yearly papers and unit tests are included where they exist.",
  },
  {
    q: "Are the PDFs free?",
    a: "Yes. Every PDF is free and has other websites' watermarks removed.",
  },
];

export default async function RajasthanBoardPage() {
  const exam = await getExam("uni-rajasthanboard");
  if (!exam) notFound();
  const cards = getRbseOverviewCards(exam);
  const total = cards.reduce((n, c) => n + c.paperCount, 0);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Rajasthan Board", path: "/rajasthanboard" },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-tight leading-tight">
          RBSE Rajasthan Board Question Papers
        </h1>
        <p className="text-muted-foreground">{exam.paper_count ?? total} papers. Pick your class.</p>
      </header>

      <RbseCardGrid
        items={cards.map((c) => ({
          href: c.href,
          name: c.shortTitle,
          count: c.paperCount,
          badge: c.badge,
          tag: "Rajasthan Board",
        }))}
      />

      <section aria-labelledby="rb-faq" className="max-w-4xl space-y-3 border-t-2 border-border pt-8">
        <h2 id="rb-faq" className="text-xl sm:text-2xl font-display uppercase tracking-wide">
          Questions
        </h2>
        <FaqAccordion faqs={FAQS} />
      </section>

      <JsonLdScript
        data={[
          collectionPageLd(
            "RBSE Rajasthan Board Question Papers",
            "/rajasthanboard",
            "Previous year question papers of the Rajasthan Board (RBSE) for Class 9 to 12",
          ),
          faqLd(FAQS),
        ]}
      />
    </div>
  );
}
