import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, CheckCircle2, GraduationCap } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { RbseSubjectView } from "@/components/shared/rbse-subject-view";
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
    data.subjectMeta.hindiName
  );

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Rajasthan Board (RBSE)", path: "/exams/uni-rajasthanboard" },
    { name: data.classMeta.shortTitle, path: `/rajasthanboard/${classSlug}` },
    { name: data.subjectMeta.name, path },
  ];

  const yearRangeText =
    data.years.length > 1
      ? `${data.years[data.years.length - 1]} – ${data.years[0]}`
      : data.years.length === 1
      ? `${data.years[0]}`
      : "Archive";

  return (
    <div className="space-y-10">
      <Breadcrumbs items={crumbs} />

      {/* HEADER HERO */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/rajasthanboard/${classSlug}`}
            className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-2.5 py-1 text-xs font-black uppercase tracking-wider hover:bg-primary transition-colors shadow-hard-sm"
          >
            <ArrowLeft className="size-3" />
            <span>{data.classMeta.shortTitle}</span>
          </Link>
          <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-black uppercase tracking-wider shadow-hard-sm">
            {data.subjectMeta.name}
          </span>
          <span className="eyebrow inline-block bg-accent px-2.5 py-1 text-accent-foreground font-bold uppercase tracking-wider shadow-hard-sm">
            {data.subjectMeta.hindiName}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight leading-tight">
          RBSE {data.classMeta.shortTitle} {data.subjectMeta.name} Papers
        </h1>

        <p className="max-w-3xl text-muted-foreground text-base sm:text-lg">
          {data.subjectMeta.desc ||
            `Download authentic Rajasthan Board ${data.classMeta.shortTitle} ${data.subjectMeta.name} past year question papers, official model papers, blueprints & half-yearly papers.`}
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <span className="border-2 border-border bg-primary px-3 py-1 text-xs font-black uppercase tracking-wider shadow-hard-sm">
            {data.totalPapers} Verified Papers
          </span>
          <span className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Years: {yearRangeText}
          </span>
          <span className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Clean Watermark-Free PDFs
          </span>
        </div>
      </header>

      {/* HORIZONTAL SIBLING SUBJECTS QUICK SWITCHER */}
      <nav aria-label="Sibling subjects" className="border-y-2 border-border py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <Link
            href={`/rajasthanboard/${classSlug}`}
            className="shrink-0 border-2 border-border bg-muted/80 px-3 py-1.5 font-black uppercase tracking-wide hover:bg-primary transition-colors shadow-hard-sm"
          >
            ← All {data.classMeta.badge} Subjects
          </Link>

          {data.siblingSubjects.map((sub) => {
            const isActive = sub.slug === subjectSlug;
            return (
              <Link
                key={sub.slug}
                href={sub.href}
                className={`shrink-0 inline-flex items-center gap-1.5 border-2 border-border px-3 py-1.5 font-bold uppercase tracking-wide transition-all shadow-hard-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground font-black shadow-hard -translate-y-0.5"
                    : "bg-card hover:bg-primary hover:-translate-y-0.5"
                }`}
              >
                <span>{sub.name}</span>
                <span className="border border-border/40 bg-background/80 px-1 py-0.2 text-[10px] font-black">
                  {sub.paperCount}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PAPERS INTERACTIVE BROWSER */}
      <RbseSubjectView
        subtypeGroups={data.subtypeGroups}
        totalPapers={data.totalPapers}
        availableYears={data.years}
        examSlug="uni-rajasthanboard"
        subjectName={data.subjectMeta.name}
      />

      {/* EXPLORE OTHER SUBJECTS IN THIS CLASS */}
      <section aria-labelledby="related-subjects" className="space-y-4 border-t-2 border-border pt-10">
        <div className="flex items-center justify-between">
          <h2 id="related-subjects" className="text-xl sm:text-2xl font-display uppercase tracking-wider">
            Other {data.classMeta.shortTitle} Subjects
          </h2>
          <Link
            href={`/rajasthanboard/${classSlug}`}
            className="text-xs font-bold uppercase text-link hover:underline inline-flex items-center gap-1"
          >
            View All Subjects <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.siblingSubjects
            .filter((s) => s.slug !== subjectSlug)
            .slice(0, 8)
            .map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                className="brutal brutal-hover flex flex-col justify-between p-4 bg-card border-2 border-border group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1">
                    <span>{s.yearsSpan}</span>
                    <span className="border border-border/40 bg-primary/20 px-1 py-0.2 font-black text-foreground">
                      {s.paperCount} Papers
                    </span>
                  </div>
                  <h3 className="font-display text-base uppercase leading-snug group-hover:text-link transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.hindiName}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground mt-3 group-hover:translate-x-1 transition-transform">
                  Explore Papers <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section aria-labelledby="subject-faq" className="max-w-4xl space-y-4 border-t-2 border-border pt-10">
        <h2 id="subject-faq" className="text-2xl sm:text-3xl font-display uppercase tracking-wide">
          {data.subjectMeta.name}: FAQs &amp; Preparation Strategy
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      <JsonLdScript
        data={[
          collectionPageLd(
            `RBSE ${data.classMeta.shortTitle} ${data.subjectMeta.name} Papers`,
            path,
            data.subjectMeta.desc
          ),
          breadcrumbLd(crumbs),
          faqLd(faqs),
        ]}
      />
    </div>
  );
}

