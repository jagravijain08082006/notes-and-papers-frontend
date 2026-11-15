import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/env";
import type { CourseDetail, PaperDetail, SubjectDetail, TermDetail } from "@/lib/api/types";
import { kindLabel, paperHref, termLabel, yearRange } from "@/lib/routes";

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Clip to a hard character budget without cutting mid-word where possible. */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

interface MetaInput {
  title: string;
  description: string;
  path: string;
  /** Thin or private pages. */
  noindex?: boolean;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
}

export function buildMetadata({
  title,
  description,
  path,
  noindex,
  image,
  keywords,
  type = "website",
}: MetaInput): Metadata {
  // Follow the project's 60/155 character budgets; retain page-specific words before the brand.
  const full =
    title.includes(SITE_NAME) || title.length + SITE_NAME.length + 3 > 60
      ? title
      : `${title} | ${SITE_NAME}`;
  const t = clip(full, 60);
  const d = clip(description, 155);
  const url = absoluteUrl(path);
  return {
    title: { absolute: t },
    description: d,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: t,
      description: d,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_IN",
      images: [{ url: image ?? absoluteUrl("/og-default.png"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      images: [image ?? absoluteUrl("/og-default.png")],
    },
  };
}

/* ---------- Title / description templates (docs/projectflow.md section 10) ---------- */

export function courseMeta(c: CourseDetail) {
  const range = yearRange(c.year_min, c.year_max);
  const terms = c.terms.map((t) => termLabel(t.kind, t.number)).join(", ");
  const isRU = /rajasthan\s+university/i.test(c.university_name);
  const isRTU = /rajasthan\s+technical/i.test(c.university_name);
  const uniTag = isRU ? "UNIRAJ (Rajasthan University)" : isRTU ? "RTU Kota" : c.university_name;
  return {
    title: `${c.name} Question Papers${range ? ` ${range}` : ""} - ${uniTag}`,
    description: `Download authentic ${c.name} previous year question papers of ${c.university_name} (${isRU ? "UNIRAJ / UOR Jaipur" : isRTU ? "RTU Kota" : c.university_name})${terms ? ` across all terms (${terms})` : ""}. Free PDF download, subject-wise.`,
    h1: `${c.name} Previous Year Papers - ${uniTag}`,
  };
}

/** "UNIRAJ" or "RTU Kota" for the two Rajasthan universities, otherwise the university's own name. */
function universityTag(name: string) {
  return /rajasthan\s+university/i.test(name)
    ? "UNIRAJ"
    : /rajasthan\s+technical/i.test(name)
      ? "RTU Kota"
      : name;
}

export function termMeta(t: TermDetail) {
  const label = termLabel(t.term.kind, t.term.number);
  const range = yearRange(t.year_min, t.year_max);
  const uni = universityTag(t.university.name);
  return {
    title: `${t.course.name} ${label} Previous Year Papers - ${uni}`,
    description: `Download ${t.paper_count} previous year question papers for ${t.course.name} ${label} of ${t.university.name} (${uni}), across ${t.subjects.length} subjects${range ? `, ${range}` : ""}. Free PDFs, subject-wise.`,
    h1: `${t.course.name} ${label} Question Papers`,
    label,
  };
}

export function subjectMeta(s: SubjectDetail) {
  const label = termLabel(s.term.kind, s.term.number);
  const range = yearRange(s.subject.year_min, s.subject.year_max);
  const years = new Set(s.papers.map((p) => p.year).filter(Boolean)).size;
  const uni = universityTag(s.university.name);
  return {
    title: `${s.subject.name} ${s.course.name} ${label} Question Papers${range ? ` ${range}` : ""}`,
    description: `Download ${s.subject.name} previous year question papers (PDF) for ${s.course.name} ${label}, ${uni}: ${years} year${years === 1 ? "" : "s"} available${range ? `, ${range}` : ""}. Free and clean.`,
    h1: `${s.subject.name} Question Papers`,
    label,
    years,
  };
}

export function paperMeta(p: PaperDetail) {
  const label = termLabel(p.term_kind, p.term_number);
  const year = p.year ? `${p.year} ` : "";
  if (!p.course_name) {
    // Exam / board papers: the title already names the paper.
    const where = p.exam_name ?? "";
    const bits = [p.year ? String(p.year) : "", p.session ?? "", p.language ?? ""]
      .filter(Boolean)
      .join(", ");
    const hasPaper = /question paper|paper|model paper/i.test(p.title);
    const candidateTitle = hasPaper
      ? `${p.title} PDF Download`
      : `${p.title} Question Paper PDF Download`;
    const title =
      p.meta_title && !p.meta_title.endsWith("…") && p.meta_title.length >= p.title.length * 0.8
        ? p.meta_title
        : candidateTitle;

    const description =
      p.meta_description && !p.meta_description.endsWith("…")
        ? p.meta_description
        : `Download free PDF of ${p.title}${where && !p.title.includes(where) ? ` (${where})` : ""} previous year question paper${bits ? ` [${bits}]` : ""}. Authentic question paper for exam preparation.`;

    return {
      title,
      description,
      h1: p.title,
      label: where,
    };
  }
  return {
    title:
      p.meta_title && !p.meta_title.endsWith("…")
        ? p.meta_title
        : `${p.subject_name} ${year}Question Paper - ${p.course_name} ${label}${p.university_name ? ` ${p.university_name}` : ""}`,
    description:
      p.meta_description && !p.meta_description.endsWith("…")
        ? p.meta_description
        : `${p.subject_name} ${p.course_name} ${label} ${year}question paper PDF.${p.paper_code ? ` Paper code ${p.paper_code}.` : ""} View online or download free.`,
    h1: `${p.subject_name} ${year}Question Paper`.replace(/\s+/g, " ").trim(),
    label,
  };
}

/* ---------- JSON-LD builders ---------- */

export type JsonLd = Record<string, unknown>;

export function breadcrumbLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function collectionPageLd(name: string, path: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

export function itemListLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function learningResourceLd(p: PaperDetail, title: string, description: string): JsonLd {
  const eduLevel = p.course_name ?? p.section ?? p.exam_name;
  const language = p.language ?? "";
  const languages = [
    ...(/\b(?:hindi|hi)\b|हिन्दी|हिंदी/i.test(language) ? ["hi"] : []),
    ...(/\b(?:english|en)\b/i.test(language) ? ["en"] : []),
  ];
  return {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "DigitalDocument"],
    name: title,
    ...(p.meta_keywords?.length ? { keywords: p.meta_keywords.join(", ") } : {}),
    description,
    url: absoluteUrl(paperHref(p)),
    learningResourceType: kindLabel(p.kind),
    ...(eduLevel ? { educationalLevel: eduLevel } : {}),
    educationalUse: "Previous Year Question Paper Practice / Exam Preparation",
    encodingFormat: "application/pdf",
    ...(languages.length ? { inLanguage: languages.length === 1 ? languages[0] : languages } : {}),
    isAccessibleForFree: true,
    hasDigitalDocumentPermission: {
      "@type": "DigitalDocumentPermission",
      permissionType: "https://schema.org/ReadPermission",
      grantee: { "@type": "Audience", audienceType: "public" },
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    datePublished: p.published_at ?? undefined,
    dateModified: p.updated_at,
    ...(p.year ? { temporalCoverage: String(p.year) } : {}),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/favicon/android-chrome-512x512.png"),
    },
    about: p.course_name
      ? { "@type": "CollegeOrUniversity", name: p.university_name ?? SITE_NAME }
      : { "@type": "Thing", name: p.exam_name ?? p.title },
  };
}
