import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { RbseYearList } from "@/components/shared/rbse-simple";
import { getExam } from "@/lib/api/public";
import {
  RBSE_CHANNELS,
  getRbseSubjectBySlug,
  getRbseSubjectData,
} from "@/lib/rbse-channels";
import { breadcrumbLd, buildMetadata, collectionPageLd, faqLd } from "@/lib/seo";

export function generateRbseSubjectMetadata(classSlug: string, subjectSlug: string) {
  const classMeta = RBSE_CHANNELS[classSlug] ?? RBSE_CHANNELS["class-10"];
  const subjectMeta = getRbseSubjectBySlug(subjectSlug);

  const title = `RBSE ${classMeta.shortTitle} ${subjectMeta.name} Question Papers PDF | Model Papers & Blueprints`;
  const description = `Download free RBSE ${classMeta.shortTitle} ${subjectMeta.name} (${subjectMeta.hindiName}) past year question papers PDF (2010-2026), official BSER Ajmer model papers, blueprints & half-yearly papers.`;
  const path = `/rajasthanboard/${classSlug}/${subjectSlug}`;

  const keywords = [
    `rbse ${classSlug} ${subjectSlug} question papers`,
    `rbse ${subjectMeta.name.toLowerCase()} previous paper pdf`,
    `rajasthan board ${subjectMeta.name.toLowerCase()} question paper`,
    `rbse ${classMeta.badge.toLowerCase()} ${subjectMeta.name.toLowerCase()} blueprint`,
    `bser ajmer ${subjectMeta.name.toLowerCase()} model paper`,
    `rbse class 10 ${subjectSlug}`,
    `rbse class 12 ${subjectSlug}`,
  ];

  return buildMetadata({
    title,
    description,
    path,
    keywords,
  });
}

function buildSubjectFaqs(classTitle: string, subjectName: string, hindiName: string) {
  return [
    {
      q: `How many years of RBSE ${classTitle} ${subjectName} papers are available?`,
      a: `Our archive covers authentic RBSE ${classTitle} ${subjectName} (${hindiName}) examination papers spanning 2011 to 2026, including annual board finals, official model papers, blueprints, and half-yearly tests.`,
    },
    {
      q: `Are official BSER Ajmer model papers and blueprints included for ${subjectName}?`,
      a: `Yes! Official Board of Secondary Education Rajasthan (BSER Ajmer) model test papers and chapter-wise blueprint distributions for ${subjectName} are included with marking schemes.`,
    },
    {
      q: `How should I practice ${subjectName} past papers for maximum board exam marks?`,
      a: `Solve previous 5 to 10 years' ${subjectName} question papers in timed 3-hour exam sessions. Compare your steps against the official blueprint to master answer presentation and time management.`,
    },
    {
      q: `Are the ${subjectName} PDF papers free and watermark-free?`,
      a: `Yes, all papers on Notes & Papers are completely free to view and download, featuring clean, high-resolution pages without disruptive diagonal watermarks.`,
    },
  ];
}

export async function RbseSubjectPageComponent({
  classSlug,
  subjectSlug,
}: {
  classSlug: string;
  subjectSlug: string;
}) {
  const exam = await getExam("uni-rajasthanboard");
  if (!exam) notFound();

  const data = getRbseSubjectData(exam, classSlug, subjectSlug);

  // If no papers match and subject doesn't exist in definitions
  if (data.totalPapers === 0 && data.subjectMeta.category === "other" && data.subjectMeta.slug !== "other") {
    notFound();
  }

  const path = `/rajasthanboard/${classSlug}/${subjectSlug}`;
  const faqs = buildSubjectFaqs(
    data.classMeta.shortTitle,
    data.subjectMeta.name,
    data.subjectMeta.hindiName,
  ).slice(0, 3);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Rajasthan Board", path: "/rajasthanboard" },
    { name: data.classMeta.shortTitle, path: `/rajasthanboard/${classSlug}` },
    { name: data.subjectMeta.name, path },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={crumbs} />

      <header className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-display uppercase tracking-tight leading-tight">
          RBSE {data.classMeta.shortTitle} {data.subjectMeta.name} Papers
        </h1>
        <p className="text-muted-foreground">{data.totalPapers} papers, newest first.</p>
      </header>

      <RbseYearList groups={data.subtypeGroups} />

      <section aria-labelledby="subject-faq" className="max-w-4xl space-y-3 border-t-2 border-border pt-8">
        <h2 id="subject-faq" className="text-xl sm:text-2xl font-display uppercase tracking-wide">
          Questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      <JsonLdScript
        data={[
          collectionPageLd(
            `RBSE ${data.classMeta.shortTitle} ${data.subjectMeta.name} Papers`,
            path,
            data.subjectMeta.desc,
          ),
          breadcrumbLd(crumbs),
          faqLd(faqs),
        ]}
      />
    </div>
  );
}
