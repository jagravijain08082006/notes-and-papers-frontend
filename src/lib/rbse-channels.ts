import type { ExamDetail, ExamSection, PaperSummary } from "@/lib/api/types";

export interface RbseChannelMeta {
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  desc: string;
  sectionNames: string[];
  seoTitle: string;
  seoDesc: string;
  keywords: string[];
}

export const RBSE_CHANNELS: Record<string, RbseChannelMeta> = {
  "class-10": {
    slug: "class-10",
    title: "RBSE Class 10th Secondary Papers",
    shortTitle: "Class 10th Secondary",
    badge: "10th Board",
    desc: "Board of Secondary Education Rajasthan (BSER) Class 10 Secondary previous year papers, official model papers, blueprints, and half-yearly examinations.",
    sectionNames: [
      "Class 10 - Final Papers",
      "Class 10 - Model Papers (Sample Papers)",
      "Class 10 - Pre-Board / Half-Yearly",
      "Class 10 - Unit-Test & Quarterly",
    ],
    seoTitle: "RBSE Class 10 Previous Year Question Papers PDF | Rajasthan Board 10th PYQ & Model Papers",
    seoDesc: "Download free RBSE Class 10 previous year question papers PDF (2010-2026), official model papers, blueprints & half-yearly papers for Secondary exam prep.",
    keywords: [
      "rbse class 10 question papers",
      "rbse 10th previous year papers pdf",
      "rajasthan board 10th model papers",
      "rbse class 10 blueprints",
      "rbse class 10 half yearly papers",
      "rbse 10th science paper",
      "rbse 10th maths paper",
    ],
  },
  "class-12": {
    slug: "class-12",
    title: "RBSE Class 12th Senior Secondary Papers",
    shortTitle: "Class 12th Sr. Secondary",
    badge: "12th Board",
    desc: "Rajasthan Board Class 12th Senior Secondary papers for Science (PCM/PCB), Commerce & Arts streams. Board final archives, official model papers, and half-yearly exams.",
    sectionNames: [
      "Class 12 - Final Papers",
      "Class 12 - Model Papers (Sample Papers)",
      "Class 12 - Pre-Board / Half-Yearly",
      "Class 12 - Unit-Test & Quarterly",
    ],
    seoTitle: "RBSE Class 12 Previous Year Question Papers PDF | Science, Commerce & Arts (2010-2026)",
    seoDesc: "Download free RBSE Class 12 question papers PDF for Science (PCM/PCB), Commerce & Arts streams. Board final papers, blueprints & official model papers.",
    keywords: [
      "rbse class 12 question papers",
      "rbse 12th science previous papers",
      "rbse 12th arts papers",
      "rbse 12th commerce papers",
      "rbse class 12 model papers pdf",
      "rbse class 12 physics chemistry maths",
    ],
  },
  "class-11": {
    slug: "class-11",
    title: "RBSE Class 11th Higher Secondary Papers",
    shortTitle: "Class 11th Higher Secondary",
    badge: "11th Class",
    desc: "Rajasthan Board Class 11 annual final examinations, pre-board / half-yearly papers, and unit tests for Science, Commerce, and Arts streams.",
    sectionNames: [
      "Class 11 - Final Papers",
      "Class 11 - Pre-Board / Half-Yearly",
      "Class 11 - Unit-Test & Quarterly",
    ],
    seoTitle: "RBSE Class 11 Previous Year Question Papers PDF | Rajasthan Board 11th Papers",
    seoDesc: "Download RBSE Class 11 previous year question papers, half-yearly exam papers and unit tests for all subjects and streams.",
    keywords: [
      "rbse class 11 question papers",
      "rajasthan board 11th paper pdf",
      "rbse 11th half yearly paper",
      "rbse 11th annual exam papers",
    ],
  },
  "class-9": {
    slug: "class-9",
    title: "RBSE Class 9th Secondary Foundation Papers",
    shortTitle: "Class 9th Foundation",
    badge: "9th Class",
    desc: "Rajasthan Board Class 9 annual final examination papers, half-yearly tests, and foundation question papers.",
    sectionNames: [
      "Class 9 - Final Papers",
      "Class 9 - Pre-Board / Half-Yearly",
    ],
    seoTitle: "RBSE Class 9 Previous Year Question Papers PDF | Rajasthan Board 9th Papers",
    seoDesc: "Download RBSE Class 9 annual exam papers, half-yearly tests and foundation past papers in PDF format.",
    keywords: [
      "rbse class 9 question papers",
      "rbse 9th previous papers",
      "rajasthan board 9th paper pdf",
      "rbse class 9 annual papers",
    ],
  },
  "model-papers": {
    slug: "model-papers",
    title: "RBSE Official Model Papers & Blueprints Vault",
    shortTitle: "Official Model Papers",
    badge: "Sample Papers & Blueprints",
    desc: "Official Board of Secondary Education Rajasthan (BSER Ajmer) model test papers, sample papers, and blueprint question sets with solutions for Class 10 & 12.",
    sectionNames: [
      "Class 12 - Model Papers (Sample Papers)",
      "Class 10 - Model Papers (Sample Papers)",
    ],
    seoTitle: "RBSE Model Papers & Blueprints PDF | Rajasthan Board Sample Question Papers (Class 10 & 12)",
    seoDesc: "Download official RBSE model question papers & blueprints for Class 10 and Class 12. Verified sample papers with marking schemes.",
    keywords: [
      "rbse model papers",
      "rajasthan board blueprint",
      "rbse class 10 model paper pdf",
      "rbse class 12 sample papers",
      "bser ajmer official sample papers",
    ],
  },
};

export interface GroupedYearPapers {
  year: string;
  papers: PaperSummary[];
}

export interface SubtypeGroup {
  typeKey: string;
  label: string;
  count: number;
  yearGroups: GroupedYearPapers[];
}

export function cleanSubtypeName(name: string): string {
  if (name.includes("Final Papers")) return "Board Final Papers";
  if (name.includes("Model Papers")) return "Official Model Papers";
  if (name.includes("Pre-Board") || name.includes("Half-Yearly")) return "Half-Yearly & Pre-Board";
  if (name.includes("Unit-Test") || name.includes("Quarterly")) return "Unit Tests & Quarterly";
  return name.replace(/^Class \d+\s*-\s*/, "");
}

export function getRbseChannelData(exam: ExamDetail, channelSlug: string) {
  const meta = RBSE_CHANNELS[channelSlug] ?? RBSE_CHANNELS["class-10"];
  const targetSectionNames = new Set(meta.sectionNames);

  const matchedSections = exam.sections.filter((s) => targetSectionNames.has(s.name));

  // Collect all papers belonging to this channel
  const allPapers: PaperSummary[] = [];
  const subtypeGroups: SubtypeGroup[] = [];

  const yearsSet = new Set<number>();

  for (const s of matchedSections) {
    const sPapers = s.papers ?? [];
    allPapers.push(...sPapers);

    for (const p of sPapers) {
      if (p.year) yearsSet.add(p.year);
    }

    // Group this section by year
    const yMap = new Map<string, PaperSummary[]>();
    for (const p of sPapers) {
      const yr = p.year ? String(p.year) : "Other";
      const arr = yMap.get(yr) ?? [];
      arr.push(p);
      yMap.set(yr, arr);
    }

    const yearGroups = [...yMap.entries()]
      .sort(([a], [b]) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return Number(b) - Number(a);
      })
      .map(([year, papers]) => ({ year, papers }));

    subtypeGroups.push({
      typeKey: s.name,
      label: cleanSubtypeName(s.name),
      count: sPapers.length,
      yearGroups,
    });
  }

  // Sort subtype groups: Finals first, then Models, then Half-Yearly, then Unit-Test
  subtypeGroups.sort((a, b) => {
    const order = (k: string) => {
      if (k.includes("Final")) return 1;
      if (k.includes("Model")) return 2;
      if (k.includes("Pre-Board") || k.includes("Half")) return 3;
      return 4;
    };
    return order(a.typeKey) - order(b.typeKey);
  });

  const sortedYears = [...yearsSet].sort((a, b) => b - a);

  return {
    meta,
    totalPapers: allPapers.length,
    matchedSections,
    subtypeGroups,
    years: sortedYears,
  };
}

export function getAllRbseChannelData(exam: ExamDetail) {
  const allPapers: PaperSummary[] = [];
  const subtypeGroups: SubtypeGroup[] = [];
  const yearsSet = new Set<number>();

  for (const s of exam.sections) {
    const sPapers = s.papers ?? [];
    allPapers.push(...sPapers);

    for (const p of sPapers) {
      if (p.year) yearsSet.add(p.year);
    }

    const yMap = new Map<string, PaperSummary[]>();
    for (const p of sPapers) {
      const yr = p.year ? String(p.year) : "Other";
      const arr = yMap.get(yr) ?? [];
      arr.push(p);
      yMap.set(yr, arr);
    }

    const yearGroups = [...yMap.entries()]
      .sort(([a], [b]) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return Number(b) - Number(a);
      })
      .map(([year, papers]) => ({ year, papers }));

    subtypeGroups.push({
      typeKey: s.name,
      label: s.name, // e.g. "Class 12 - Final Papers"
      count: sPapers.length,
      yearGroups,
    });
  }

  // Sort groups: Class 12, Class 10, Class 11, Class 9
  subtypeGroups.sort((a, b) => {
    const order = (k: string) => {
      if (k.includes("Class 12 - Final")) return 1;
      if (k.includes("Class 12 - Model")) return 2;
      if (k.includes("Class 10 - Final")) return 3;
      if (k.includes("Class 10 - Model")) return 4;
      if (k.includes("Class 12")) return 5;
      if (k.includes("Class 10")) return 6;
      if (k.includes("Class 11")) return 7;
      if (k.includes("Class 9")) return 8;
      return 9;
    };
    return order(a.typeKey) - order(b.typeKey);
  });

  const sortedYears = [...yearsSet].sort((a, b) => b - a);

  return {
    totalPapers: allPapers.length,
    subtypeGroups,
    years: sortedYears,
  };
}

export function getRbseOverviewCards(exam: ExamDetail) {
  return Object.values(RBSE_CHANNELS).map((ch) => {
    const targetSet = new Set(ch.sectionNames);
    const sections = exam.sections.filter((s) => targetSet.has(s.name));
    const paperCount = sections.reduce((sum, s) => sum + (s.papers?.length ?? s.paper_count ?? 0), 0);
    
    // Subtype counts
    const subBreakdown = sections.map((s) => ({
      label: cleanSubtypeName(s.name),
      count: s.papers?.length ?? s.paper_count ?? 0,
    })).filter((s) => s.count > 0);

    return {
      slug: ch.slug,
      title: ch.title,
      shortTitle: ch.shortTitle,
      badge: ch.badge,
      desc: ch.desc,
      paperCount,
      subBreakdown,
      href: `/exams/uni-rajasthanboard/${ch.slug}`,
    };
  });
}
