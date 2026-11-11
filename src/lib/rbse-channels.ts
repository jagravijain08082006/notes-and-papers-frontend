import type { ExamDetail, PaperSummary } from "@/lib/api/types";

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

// ==========================================
// SUBJECT TAXONOMY & MATCHING LOGIC
// ==========================================

export type StreamKey = "core" | "science" | "commerce" | "arts" | "language" | "vocational" | "other";

export interface RbseSubjectDef {
  slug: string;
  name: string;
  hindiName: string;
  category: StreamKey;
  streams: StreamKey[];
  keywords: string[];
  desc: string;
}

export const RBSE_SUBJECT_DEFINITIONS: RbseSubjectDef[] = [
  // 1. Specific compound subjects (must appear before individual words like 'science')
  {
    slug: "social-science",
    name: "Social Science",
    hindiName: "सामाजिक विज्ञान",
    category: "core",
    streams: ["core", "arts"],
    keywords: ["social science", "social-science", "samajik vigyan", "samajik", "s-08", "ss-08", "904"],
    desc: "RBSE Social Science previous year question papers, official model papers, blueprints, history, civics, and geography papers.",
  },
  {
    slug: "political-science",
    name: "Political Science",
    hindiName: "राजनीति विज्ञान",
    category: "arts",
    streams: ["arts"],
    keywords: ["political science", "rajniti vigyan", "rajniti", "ss-11"],
    desc: "RBSE Class 12 Political Science (राजनीति विज्ञान) board question papers, blueprints, and sample sets with solutions.",
  },
  {
    slug: "home-science",
    name: "Home Science",
    hindiName: "गृह विज्ञान",
    category: "arts",
    streams: ["arts", "science"],
    keywords: ["home science", "grih vigyan", "ss-18"],
    desc: "RBSE Class 12 Home Science board past papers, practical blueprint guides, and model examination papers.",
  },
  {
    slug: "computer-science",
    name: "Computer Science & Informatics",
    hindiName: "कंप्यूटर विज्ञान",
    category: "science",
    streams: ["science", "commerce"],
    keywords: ["computer science", "computer", "multimedia and web technology", "multimedia", "informatics practices", "ss-05", "ss-03", "ip"],
    desc: "RBSE Computer Science, Informatics Practices, and Multimedia past papers & model papers.",
  },
  {
    slug: "information-technology",
    name: "Information Technology (IT/ITES)",
    hindiName: "सूचना प्रौद्योगिकी",
    category: "vocational",
    streams: ["core", "vocational"],
    keywords: ["information technology", "it & ites", "it-ites", "911", "v-109", "v-110"],
    desc: "RBSE Class 9 & 10 Information Technology (IT/ITES) theory and skill examination papers.",
  },

  // 2. Core Science / Mathematics
  {
    slug: "mathematics",
    name: "Mathematics",
    hindiName: "गणित",
    category: "core",
    streams: ["core", "science", "commerce"],
    keywords: ["mathematics", "maths", "ganit", "s-09", "ss-15", "903", "1104", "1125"],
    desc: "RBSE Mathematics previous year question papers PDF, official BSER Ajmer model papers, blueprints & solved papers.",
  },
  {
    slug: "physics",
    name: "Physics",
    hindiName: "भौतिक विज्ञान",
    category: "science",
    streams: ["science"],
    keywords: ["physics", "bhautik vigyan", "bhautik", "ss-40"],
    desc: "RBSE Class 12 Physics previous papers PDF, blueprint, numerical patterns, and official board question papers.",
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    hindiName: "रसायन विज्ञान",
    category: "science",
    streams: ["science"],
    keywords: ["chemistry", "rasayan vigyan", "rasayan", "ss-41"],
    desc: "RBSE Class 12 Chemistry board question papers, official sample papers, reactions and blueprint questions.",
  },
  {
    slug: "biology",
    name: "Biology",
    hindiName: "जीव विज्ञान",
    category: "science",
    streams: ["science"],
    keywords: ["biology", "jeev vigyan", "ss-42", "1127"],
    desc: "RBSE Class 12 Biology previous papers PDF (botany & zoology), blueprints, and model examination papers.",
  },
  {
    slug: "science",
    name: "General Science",
    hindiName: "सामान्य विज्ञान",
    category: "core",
    streams: ["core", "science"],
    keywords: ["science", "vigyan", "s-07", "ss-07", "905"],
    desc: "RBSE Class 10 & 9 General Science question papers, official blueprints, and model test papers.",
  },
  // 3. Commerce Stream
  {
    slug: "accountancy",
    name: "Accountancy",
    hindiName: "लेखाशास्त्र",
    category: "commerce",
    streams: ["commerce"],
    keywords: ["accountancy", "lekhashastra", "ss-30", "160123"],
    desc: "RBSE Class 12 Accountancy previous papers PDF, ledger format questions, model papers, and blueprints.",
  },
  {
    slug: "business-studies",
    name: "Business Studies",
    hindiName: "व्यवसाय अध्ययन",
    category: "commerce",
    streams: ["commerce"],
    keywords: ["business studies", "vyavasay adhyayan", "vyavasay", "ss-31"],
    desc: "RBSE Class 12 Business Studies question papers, case studies, and official sample blueprints.",
  },
  {
    slug: "economics",
    name: "Economics",
    hindiName: "अर्थशास्त्र",
    category: "commerce",
    streams: ["commerce", "arts"],
    keywords: ["economics", "arthashastra", "ss-10"],
    desc: "RBSE Class 12 Economics (Micro & Macro) board papers, numerical graph questions, and model sets.",
  },

  // 4. Arts & Humanities Stream
  {
    slug: "history",
    name: "History",
    hindiName: "इतिहास",
    category: "arts",
    streams: ["arts"],
    keywords: ["history", "itihas", "ss-13"],
    desc: "RBSE Class 12 History (भारतीय इतिहास) board papers, source questions, and blueprint papers.",
  },
  {
    slug: "geography",
    name: "Geography",
    hindiName: "भूगोल",
    category: "arts",
    streams: ["arts"],
    keywords: ["geography", "bhugol", "ss-14"],
    desc: "RBSE Class 12 Geography question papers, map work blueprints, and model question papers.",
  },
  {
    slug: "sociology",
    name: "Sociology",
    hindiName: "समाजशास्त्र",
    category: "arts",
    streams: ["arts"],
    keywords: ["sociology", "samajshastra", "ss-29"],
    desc: "RBSE Class 12 Sociology previous year board examination papers and sample test series.",
  },
  {
    slug: "psychology",
    name: "Psychology",
    hindiName: "मनोविज्ञान",
    category: "arts",
    streams: ["arts"],
    keywords: ["psychology", "manovigyan", "ss-19"],
    desc: "RBSE Class 12 Psychology board exam question papers and model questions.",
  },
  {
    slug: "public-administration",
    name: "Public Administration",
    hindiName: "लोक प्रशासन",
    category: "arts",
    streams: ["arts"],
    keywords: ["public administration", "lok prashasan", "ss-06"],
    desc: "RBSE Class 12 Public Administration (लोक प्रशासन) question papers and blueprints.",
  },
  {
    slug: "philosophy",
    name: "Philosophy",
    hindiName: "दर्शनशास्त्र",
    category: "arts",
    streams: ["arts"],
    keywords: ["philosophy", "darshanshastra", "ss-85"],
    desc: "RBSE Class 12 Philosophy board papers and model test papers.",
  },
  {
    slug: "drawing",
    name: "Drawing & Painting",
    hindiName: "चित्रकला",
    category: "arts",
    streams: ["arts"],
    keywords: ["drawing", "chitrakala", "ss-17"],
    desc: "RBSE Class 12 Drawing & Painting question papers, practical blueprints, and theory papers.",
  },
  {
    slug: "music",
    name: "Music & Dance",
    hindiName: "संगीत व नृत्य",
    category: "arts",
    streams: ["arts"],
    keywords: ["music", "sangeet", "ss-62", "ss-63", "kathak"],
    desc: "RBSE Music (Vocal, Instrumental, Kathak) board examination papers and blueprints.",
  },
  {
    slug: "agriculture",
    name: "Agriculture Stream",
    hindiName: "कृषि विज्ञान",
    category: "science",
    streams: ["science"],
    keywords: ["agriculture", "krishi", "agronomy", "animal husbandry", "ss-84", "ss-86", "ss-88", "1105", "1106", "1128"],
    desc: "RBSE Class 12 Agriculture Stream (Agronomy, Chemistry, Animal Husbandry) past papers.",
  },

  // 5. Languages (Compulsory & Electives)
  {
    slug: "hindi",
    name: "Hindi (Compulsory & Lit.)",
    hindiName: "हिन्दी अनिवार्य व साहित्य",
    category: "language",
    streams: ["core", "language", "arts"],
    keywords: ["hindi", "sahitya", "s-01", "ss-01", "ss-21", "901", "1001", "1103", "1117"],
    desc: "RBSE Hindi Compulsory & Hindi Literature previous year question papers, vyakaran, and model papers.",
  },
  {
    slug: "english",
    name: "English (Compulsory & Lit.)",
    hindiName: "अंग्रेजी अनिवार्य व साहित्य",
    category: "language",
    streams: ["core", "language", "arts"],
    keywords: ["english", "angreji", "s-02", "ss-02", "ss-20", "902", "1002"],
    desc: "RBSE English Compulsory & English Literature previous papers, grammar sets, and official sample papers.",
  },
  {
    slug: "sanskrit",
    name: "Sanskrit (Compulsory & Sahitya)",
    hindiName: "संस्कृत",
    category: "language",
    streams: ["core", "language", "arts"],
    keywords: ["sanskrit", "sanskritam", "sahityam", "s-71", "ss-12", "906", "1006"],
    desc: "RBSE Sanskrit language and Sanskrit Sahityam board question papers, shloka interpretation & model sets.",
  },
  {
    slug: "urdu",
    name: "Urdu Literature",
    hindiName: "उर्दू साहित्य",
    category: "language",
    streams: ["language", "arts"],
    keywords: ["urdu", "s-72", "ss-22"],
    desc: "RBSE Urdu previous year board question papers and official sample papers.",
  },
  {
    slug: "punjabi",
    name: "Punjabi Literature",
    hindiName: "पंजाबी साहित्य",
    category: "language",
    streams: ["language", "arts"],
    keywords: ["punjabi", "s-75", "ss-25"],
    desc: "RBSE Punjabi board question papers and official model papers.",
  },
  {
    slug: "gujarati",
    name: "Gujarati Literature",
    hindiName: "गुजराती साहित्य",
    category: "language",
    streams: ["language", "arts"],
    keywords: ["gujarati", "s-73", "ss-24"],
    desc: "RBSE Gujarati previous year papers and sample tests.",
  },
  {
    slug: "sindhi",
    name: "Sindhi Literature",
    hindiName: "सिंधी साहित्य",
    category: "language",
    streams: ["language", "arts"],
    keywords: ["sindhi", "s-74", "ss-23"],
    desc: "RBSE Sindhi board examination question papers.",
  },

  // 6. Vocational & Skill Subjects
  {
    slug: "vocational",
    name: "Vocational & Skill Subjects",
    hindiName: "व्यावसायिक विषय",
    category: "vocational",
    streams: ["vocational"],
    keywords: ["automobile", "automotive", "apparel", "beauty", "wellness", "retail", "tourism", "security", "suraksha", "health", "swasthya", "v-101", "v-102", "v-103", "v-104", "v-105", "v-106", "v-107", "v-108"],
    desc: "RBSE Vocational skill subjects including Automobile, Retail, Security, Tourism, and Beauty & Wellness.",
  },
  {
    slug: "other",
    name: "Other Subjects & Electives",
    hindiName: "अन्य विषय",
    category: "other",
    streams: ["other"],
    keywords: [],
    desc: "Other RBSE secondary and senior secondary question papers and special subjects.",
  },
];

export const RBSE_SUBJECT_MAP = new Map<string, RbseSubjectDef>(
  RBSE_SUBJECT_DEFINITIONS.map((s) => [s.slug, s])
);

// Regex matching cache
const COMPILED_PATTERNS = RBSE_SUBJECT_DEFINITIONS.map((def) => {
  const regexes = def.keywords.map((kw) => new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i"));
  return { slug: def.slug, regexes };
});

export function matchRbseSubject(title: string, paperCode?: string): string {
  const t = title.toLowerCase();
  const c = (paperCode || "").toLowerCase().trim();

  for (const { slug, regexes } of COMPILED_PATTERNS) {
    if (regexes.length === 0) continue; // "other"
    for (const rx of regexes) {
      if (rx.test(t)) return slug;
      if (c && rx.test(c)) return slug;
    }
  }

  return "other";
}

export function getRbseSubjectBySlug(slug: string): RbseSubjectDef {
  const found = RBSE_SUBJECT_MAP.get(slug);
  if (found) return found;

  const titleCased = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    slug,
    name: titleCased,
    hindiName: titleCased,
    category: "other",
    streams: ["core"],
    keywords: [],
    desc: `RBSE ${titleCased} previous year question papers, official model papers, blueprints & exam guides.`,
  };
}

export interface RbseClassSubjectSummary {
  slug: string;
  name: string;
  hindiName: string;
  category: StreamKey;
  streams: StreamKey[];
  paperCount: number;
  yearsSpan: string;
  subtypes: Array<{ label: string; count: number }>;
  href: string;
}

export function getRbseClassSubjects(exam: ExamDetail, classSlug: string): RbseClassSubjectSummary[] {
  const meta = RBSE_CHANNELS[classSlug] ?? RBSE_CHANNELS["class-10"];
  const targetSectionNames = new Set(meta.sectionNames);
  const matchedSections = exam.sections.filter((s) => targetSectionNames.has(s.name));

  // Map each paper to its subject
  const subjectMap = new Map<
    string,
    {
      papers: PaperSummary[];
      years: Set<number>;
      subtypesMap: Map<string, number>;
    }
  >();

  for (const s of matchedSections) {
    const sLabel = cleanSubtypeName(s.name);
    for (const p of s.papers ?? []) {
      const sSlug = matchRbseSubject(p.title, p.paper_code ?? undefined);
      const entry = subjectMap.get(sSlug) ?? {
        papers: [],
        years: new Set<number>(),
        subtypesMap: new Map<string, number>(),
      };
      entry.papers.push(p);
      if (p.year) entry.years.add(p.year);
      entry.subtypesMap.set(sLabel, (entry.subtypesMap.get(sLabel) ?? 0) + 1);
      subjectMap.set(sSlug, entry);
    }
  }

  // Format into summaries
  const result: RbseClassSubjectSummary[] = [];

  for (const [sSlug, data] of subjectMap.entries()) {
    if (data.papers.length === 0) continue;
    const def = getRbseSubjectBySlug(sSlug);

    const sortedYears = [...data.years].sort((a, b) => a - b);
    const yearsSpan =
      sortedYears.length > 1
        ? `${sortedYears[0]} – ${sortedYears[sortedYears.length - 1]}`
        : sortedYears.length === 1
          ? `${sortedYears[0]}`
          : "Archive";

    const subtypes = [...data.subtypesMap.entries()].map(([label, count]) => ({
      label,
      count,
    }));

    result.push({
      slug: def.slug,
      name: def.name,
      hindiName: def.hindiName,
      category: def.category,
      streams: def.streams,
      paperCount: data.papers.length,
      yearsSpan,
      subtypes,
      href: `/rajasthanboard/${classSlug}/${def.slug}`,
    });
  }

  // Sort subjects: Put "other" at the very end; sort remainder by paper count descending
  result.sort((a, b) => {
    if (a.slug === "other") return 1;
    if (b.slug === "other") return -1;
    return b.paperCount - a.paperCount;
  });

  return result;
}

export function getRbseSubjectData(exam: ExamDetail, classSlug: string, subjectSlug: string) {
  const classMeta = RBSE_CHANNELS[classSlug] ?? RBSE_CHANNELS["class-10"];
  const subjectMeta = getRbseSubjectBySlug(subjectSlug);
  const targetSectionNames = new Set(classMeta.sectionNames);
  const matchedSections = exam.sections.filter((s) => targetSectionNames.has(s.name));

  const matchedPapers: PaperSummary[] = [];
  const subtypeGroups: SubtypeGroup[] = [];
  const yearsSet = new Set<number>();

  for (const s of matchedSections) {
    const sPapers = (s.papers ?? []).filter(
      (p) => matchRbseSubject(p.title, p.paper_code ?? undefined) === subjectSlug
    );

    if (sPapers.length === 0) continue;

    matchedPapers.push(...sPapers);
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
      label: cleanSubtypeName(s.name),
      count: sPapers.length,
      yearGroups,
    });
  }

  // Sort subtype groups: Finals first, then Models, then Half-Yearly
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

  // Sibling subjects in this class
  const allClassSubjects = getRbseClassSubjects(exam, classSlug);

  return {
    classMeta,
    subjectMeta,
    totalPapers: matchedPapers.length,
    subtypeGroups,
    years: sortedYears,
    siblingSubjects: allClassSubjects,
  };
}

// ==========================================
// CHANNEL & OVERVIEW HELPERS
// ==========================================

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

  // Get subjects in this channel
  const subjects = getRbseClassSubjects(exam, channelSlug);

  return {
    meta,
    totalPapers: allPapers.length,
    matchedSections,
    subtypeGroups,
    years: sortedYears,
    subjects,
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
    const subBreakdown = sections
      .map((s) => ({
        label: cleanSubtypeName(s.name),
        count: s.papers?.length ?? s.paper_count ?? 0,
      }))
      .filter((s) => s.count > 0);

    // Top subjects for preview
    const subjects = getRbseClassSubjects(exam, ch.slug).slice(0, 5);

    return {
      slug: ch.slug,
      title: ch.title,
      shortTitle: ch.shortTitle,
      badge: ch.badge,
      desc: ch.desc,
      paperCount,
      subBreakdown,
      topSubjects: subjects.map((s) => ({ name: s.name, count: s.paperCount, slug: s.slug })),
      href: `/rajasthanboard/${ch.slug}`,
    };
  });
}
