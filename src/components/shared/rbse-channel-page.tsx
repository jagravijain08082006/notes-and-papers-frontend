import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { RbseChannelView } from "@/components/shared/rbse-channel-view";
import { getExam } from "@/lib/api/public";
import {
  RBSE_CHANNELS,
  getRbseChannelData,
  getRbseOverviewCards,
} from "@/lib/rbse-channels";
import { buildMetadata, collectionPageLd, faqLd } from "@/lib/seo";

export function generateRbseChannelMetadata(channelSlug: string) {
  const meta = RBSE_CHANNELS[channelSlug] ?? RBSE_CHANNELS["class-10"];
  return buildMetadata({
    title: meta.seoTitle,
    description: meta.seoDesc,
    path: `/exams/uni-rajasthanboard/${channelSlug}`,
    keywords: meta.keywords,
  });
}

const FAQS_BY_CHANNEL: Record<string, Array<{ q: string; a: string }>> = {
  "class-10": [
    {
      q: "How many years of RBSE Class 10 previous papers are available?",
      a: "Our archive includes RBSE Class 10 Secondary papers from 2010 through 2026, covering Board finals, official model papers, blueprints, and half-yearly examinations.",
    },
    {
      q: "Are official RBSE Class 10 model papers included?",
      a: "Yes, official BSER Ajmer model question papers and blueprints are organized under the Model Papers tab with exact question patterns and marking schemes.",
    },
    {
      q: "Which subjects are covered for RBSE Class 10th?",
      a: "All core subjects are covered: Mathematics, Science, Social Science, Hindi, English, Sanskrit, and optional vocational papers.",
    },
    {
      q: "Are the question paper PDFs free to download?",
      a: "Yes, all past examination papers and model papers on Notes & Papers are 100% free with clean, watermark-free PDFs.",
    },
  ],
  "class-12": [
    {
      q: "Does the RBSE Class 12 archive include Science, Commerce, and Arts?",
      a: "Yes, we archive papers across all three streams: Science (Physics, Chemistry, Maths, Biology), Commerce (Accountancy, Business Studies, Economics), and Arts / Humanities (History, Political Science, Geography, etc.).",
    },
    {
      q: "How should I use RBSE Class 12 PYQs for board exam preparation?",
      a: "Start by solving the last 5 years' board final papers under timed exam conditions. Cross-reference with official model papers to understand the latest blueprint and marking scheme.",
    },
    {
      q: "Where can I find RBSE Class 12 blueprints?",
      a: "Official blueprints and sample question sets are available under the 'Official Model Papers' section on this page.",
    },
  ],
  "class-11": [
    {
      q: "What types of papers are available for RBSE Class 11th?",
      a: "We provide annual final exam papers, half-yearly papers, and unit tests across Science, Commerce, and Arts subjects.",
    },
  ],
  "class-9": [
    {
      q: "How do RBSE Class 9 papers help students?",
      a: "Class 9 lays the foundation for board examinations. Practicing annual and half-yearly papers familiarizes students with descriptive answering and blueprint standards.",
    },
  ],
  "model-papers": [
    {
      q: "What are RBSE Model Papers?",
      a: "Model papers are published officially by the Board of Secondary Education Rajasthan (BSER Ajmer) to demonstrate the exam blueprint, question distribution, and marking rubric for the upcoming board examinations.",
    },
    {
      q: "Are solutions and blueprints included with the model papers?",
      a: "Where released by the board, official marking schemes and blueprints are paired with each model paper PDF.",
    },
  ],
};

export async function RbseChannelPageComponent({ channelSlug }: { channelSlug: string }) {
  const exam = await getExam("uni-rajasthanboard");
  if (!exam) notFound();

  const channelData = getRbseChannelData(exam, channelSlug);
  const overviewCards = getRbseOverviewCards(exam);
  const faqs = FAQS_BY_CHANNEL[channelSlug] ?? FAQS_BY_CHANNEL["class-10"];

  const path = `/exams/uni-rajasthanboard/${channelSlug}`;

  return (
    <div className="space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Rajasthan Board (RBSE)", path: "/exams/uni-rajasthanboard" },
          { name: channelData.meta.shortTitle, path },
        ]}
      />

      {/* HEADER */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow inline-block bg-primary px-2.5 py-1 text-primary-foreground font-black uppercase tracking-wider shadow-hard-sm">
            {channelData.meta.badge}
          </span>
          <span className="eyebrow inline-block bg-accent px-2.5 py-1 text-accent-foreground font-bold uppercase tracking-wider shadow-hard-sm">
            Rajasthan Board (BSER Ajmer)
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight leading-tight">
          {channelData.meta.title}
        </h1>

        <p className="max-w-3xl text-muted-foreground text-base sm:text-lg">
          {channelData.meta.desc}
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <span className="border-2 border-border bg-primary px-3 py-1 text-xs font-black uppercase tracking-wider shadow-hard-sm">
            {channelData.totalPapers} Verified Papers
          </span>
          <span className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {channelData.years.length} Examination Years
          </span>
          <span className="border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Watermark-Free Clean PDFs
          </span>
        </div>
      </header>

      {/* CHANNEL INTERACTIVE BROWSER */}
      <RbseChannelView
        currentChannel={channelSlug}
        allChannels={overviewCards}
        subjects={channelData.subjects}
        subtypeGroups={channelData.subtypeGroups}
        totalPapers={channelData.totalPapers}
        availableYears={channelData.years}
        examSlug="uni-rajasthanboard"
      />

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section aria-labelledby="channel-faq" className="max-w-4xl space-y-4 border-t-2 border-border pt-10">
        <h2 id="channel-faq" className="text-2xl sm:text-3xl font-display uppercase tracking-wide">
          {channelData.meta.shortTitle} Papers: FAQs &amp; Study Guide
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      <JsonLdScript
        data={[
          collectionPageLd(channelData.meta.title, path, channelData.meta.seoDesc),
          faqLd(faqs),
        ]}
      />
    </div>
  );
}

