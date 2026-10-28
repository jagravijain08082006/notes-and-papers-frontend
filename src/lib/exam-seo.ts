import type { ExamDetail } from "@/lib/api/types";
import { cleanExamTitle } from "@/lib/exam-categories";
import { yearRange } from "@/lib/routes";

/**
 * What an exam page says about itself, for readers and for search engines: a short name for titles, an introduction,
 * and questions people actually ask. Big exams get hand-written text; every other exam gets the same structure built
 * from its real data (paper count, years, sections), so no page is a bare list and no number is invented.
 */

interface Profile {
  /** Short name used in titles and headings. */
  short: string;
  /** Extra search terms people use for this exam. */
  also?: string[];
  /** One or two plain paragraphs about the exam and why previous papers help. */
  intro: string[];
}

const PROFILES: Record<string, Profile> = {
  ssc: {
    short: "SSC",
    also: ["SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "Staff Selection Commission"],
    intro: [
      "The Staff Selection Commission (SSC) holds the recruitment exams for many central government posts, among them CGL, CHSL, MTS, GD Constable, CPO and Stenographer.",
      "Solving SSC previous year question papers is the quickest way to learn the pattern of each exam, the level of the questions in reasoning, quantitative aptitude, English and general awareness, and how to manage your time.",
    ],
  },
  "sbi-clerk": {
    short: "SBI Clerk",
    also: ["SBI Junior Associate", "SBI Clerk prelims", "SBI Clerk mains"],
    intro: [
      "SBI Clerk, officially the Junior Associate (Customer Support & Sales) recruitment of the State Bank of India, is held in two stages: a preliminary exam and a main exam.",
      "These SBI Clerk previous year papers show how questions in English, numerical ability and reasoning are framed, so you can practise against the real pattern and time limits.",
    ],
  },
  "cg-open-school": {
    short: "CG Open School",
    also: [
      "CGSOS",
      "Chhattisgarh State Open School",
      "CG Open School class 10",
      "CG Open School class 12",
    ],
    intro: [
      "Chhattisgarh State Open School (CG Open School, CGSOS) lets learners complete secondary and senior secondary education (Class 10 and Class 12) outside a regular school.",
      "This page collects CG Open School previous year question papers by year, so you can see the paper style, the important topics and practise before the exam.",
    ],
  },
  upsc: {
    short: "UPSC",
    also: ["UPSC CSE", "UPSC prelims", "UPSC mains", "civil services"],
    intro: [
      "The Union Public Service Commission (UPSC) conducts the Civil Services Examination and other national recruitment exams.",
      "UPSC previous year papers help you see which topics are asked again, how questions are worded and how the paper is balanced across subjects.",
    ],
  },
  gate: {
    short: "GATE",
    also: ["GATE papers with answer key", "GATE question paper pdf"],
    intro: [
      "The Graduate Aptitude Test in Engineering (GATE) is the national entrance test for postgraduate engineering admissions and many public sector jobs.",
      "GATE previous year question papers, with answer keys where they are available, are the best way to learn the exam pattern and check your preparation branch by branch.",
    ],
  },
  neet: {
    short: "NEET",
    also: ["NEET UG", "NEET previous year question paper"],
    intro: [
      "NEET (UG) is the national entrance test for MBBS, BDS and other undergraduate medical courses in India.",
      "NEET previous year question papers show the weightage of Physics, Chemistry and Biology and help you practise in real exam conditions.",
    ],
  },
  "ugc-net": {
    short: "UGC NET",
    also: ["NTA UGC NET", "UGC NET paper 1", "UGC NET paper 2"],
    intro: [
      "UGC NET is the national eligibility test for assistant professor posts and for a junior research fellowship.",
      "UGC NET previous year papers, covering Paper 1 and the subject papers, show the question style and help you plan your revision.",
    ],
  },
};

export interface ExamSeo {
  short: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  faqs: { q: string; a: string }[];
  keywords: string[];
}

const hasPaperWords = (s: string) => /question paper|papers|pyq/i.test(s);

export function examSeo(slug: string, exam: ExamDetail): ExamSeo {
  const profile = PROFILES[slug];
  const cleaned = cleanExamTitle(exam.name, slug);
  const short = profile?.short ?? cleaned;

  const papers = exam.sections.flatMap((s) => s.papers ?? []);
  const total = Math.max(exam.paper_count ?? 0, papers.length);
  const range = exam.year_min ? yearRange(exam.year_min, exam.year_max) : "";
  const keys = papers.filter((p) => p.kind === "answer_key").length;
  const sections = exam.sections.map((s) => s.name).filter(Boolean);

  const title = hasPaperWords(short)
    ? `${short} PDF Download`
    : `${short} Previous Year Question Papers PDF`;
  const description =
    `Download ${total.toLocaleString("en-IN")} ${short} previous year question papers (PDF)` +
    `${range ? `, ${range}` : ""}. Free, clean PDFs, year-wise and section-wise. Practise with real exam papers.`;

  const intro = profile?.intro ?? [
    `Here are ${total.toLocaleString("en-IN")} previous year question papers for ${short}${range ? `, from ${range}` : ""}, arranged ${sections.length > 1 ? "by section and year" : "by year"}.`,
    `Practising with real papers shows the exam pattern, the type of questions that are asked and how much time each section needs.`,
  ];

  const faqs = [
    {
      q: `Where can I download ${short} previous year question papers?`,
      a: `On this page. Choose the year or section you need, open the paper and download it as a PDF. Viewing is free and downloading needs a free account.`,
    },
    {
      q: `How many ${short} papers are available?`,
      a: `${total.toLocaleString("en-IN")} papers${range ? ` covering ${range}` : ""}${sections.length > 1 ? `, grouped into ${sections.length} sections such as ${sections.slice(0, 3).join(", ")}` : ""}. New papers are added automatically as they are published.`,
    },
    {
      q: `Do the ${short} papers come with answer keys?`,
      a:
        keys > 0
          ? `Yes. ${keys.toLocaleString("en-IN")} of them are answer keys, marked "Answer key" in the list, next to the question papers.`
          : `This list has question papers. Where an answer key exists it is listed as a separate paper marked "Answer key".`,
    },
    {
      q: `Are these ${short} PDFs free and watermark-free?`,
      a: `Yes. Every PDF is free and has been cleaned of other websites' watermarks, with a cover page from Notes & Papers.`,
    },
  ];

  const base = [short, ...(profile?.also ?? [])];
  const keywords = [
    ...base.flatMap((n) => [
      `${n} previous year question papers`,
      `${n} question paper pdf`,
      `${n} pyq`,
    ]),
    "notes and papers",
  ];

  return {
    short,
    title,
    description,
    h1: hasPaperWords(short) ? short : `${short} Previous Year Question Papers`,
    intro,
    faqs,
    keywords,
  };
}
