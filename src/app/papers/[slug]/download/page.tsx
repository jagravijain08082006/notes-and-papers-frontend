import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { DownloadManager } from "@/components/shared/download-manager";
import { getLatestPapers, getPaper } from "@/lib/api/public";
import type { PaperSummary } from "@/lib/api/types";
import { paperHref, routes } from "@/lib/routes";
import { buildMetadata, paperMeta } from "@/lib/seo";

export async function generateMetadata(props: PageProps<"/papers/[slug]/download">) {
  const { slug } = await props.params;
  const p = await getPaper(slug).catch(() => null);
  if (!p) return { title: "Download Paper", robots: { index: false } };
  const m = paperMeta(p);
  return buildMetadata({
    title: `Download ${m.title}`,
    description: `Download verified PDF for ${m.title}. Clean, high quality question paper.`,
    path: routes.download(slug),
    noindex: true,
  });
}

export default async function DownloadPage(props: PageProps<"/papers/[slug]/download">) {
  const { slug } = await props.params;
  const p = await getPaper(slug).catch(() => null);
  if (!p) notFound();

  const isCourse = Boolean(p.course_slug && p.term_slug);
  const uniName = p.university_name ?? "";
  const uniSlug = p.university_slug ?? "";

  const crumbs = isCourse
    ? [
        { name: "Home", path: "/" },
        {
          name: uniName || "Universities",
          path: uniSlug ? routes.university(uniSlug) : routes.universities,
        },
        { name: p.course_name!, path: routes.course(uniSlug, p.course_slug!) },
        { name: p.title, path: paperHref(p) },
        { name: "Download", path: routes.download(slug) },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Exams", path: routes.exams },
        ...(p.exam_slug
          ? [{ name: p.exam_name ?? p.exam_slug, path: routes.exam(p.exam_slug) }]
          : []),
        { name: p.title, path: paperHref(p) },
        { name: "Download", path: routes.download(slug) },
      ];

  let suggestedPapers: PaperSummary[] = [];
  if (p.related && p.related.length > 0) {
    suggestedPapers = p.related.slice(0, 6);
  } else if (p.other_years && p.other_years.length > 0) {
    suggestedPapers = p.other_years.slice(0, 6);
  } else {
    try {
      const latest = await getLatestPapers(8);
      suggestedPapers = (latest.items ?? []).filter((item) => item.slug !== slug).slice(0, 6);
    } catch {
      suggestedPapers = [];
    }
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={crumbs} />
      <DownloadManager paper={p} suggestedPapers={suggestedPapers} />
    </div>
  );
}
