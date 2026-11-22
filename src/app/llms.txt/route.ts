import { getExams, getStats, getUniversities } from "@/lib/api/public";
import { CONTACT_EMAIL, INSTAGRAM_URL, SITE_NAME, SITE_URL, TELEGRAM_URL } from "@/lib/env";
import { routes } from "@/lib/routes";

/** /llms.txt: a short plain-markdown map of the site for AI assistants and answer engines. Every number comes from the API. */
export const revalidate = 86400;

const nf = new Intl.NumberFormat("en-IN");

export async function GET() {
  const [stats, unis, exams, boards] = await Promise.all([
    getStats().catch(() => null),
    getUniversities().catch(() => []),
    getExams("exam").catch(() => []),
    getExams("board").catch(() => []),
  ]);
  const total = stats ? `${nf.format(Math.floor(stats.papers_total / 100) * 100)}+` : "thousands of";
  const updated = new Date().toISOString().slice(0, 10);

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} (${SITE_URL}) is a free library of ${total} previous year question papers (PYQ) as PDF: Rajasthan University (UNIRAJ), RTU Kota, Rajasthan Board (RBSE) and other school boards, and national competitive exams such as UPSC, SSC, NEET and GATE. Every file is cleaned of source watermarks. Downloading needs a free account.`,
    "",
    "## Key facts (for quoting)",
    ...(stats
      ? [
          `- Papers in the library: ${nf.format(stats.papers_total)} (${nf.format(stats.university_papers)} university, ${nf.format(stats.exam_papers)} competitive exam, ${nf.format(stats.board_papers)} school board).`,
          `- University courses covered: ${stats.courses}. Exams and boards covered: ${stats.exams}.`,
        ]
      : []),
    "- Price: free. A free account is needed to download; reading the paper page and its preview needs none.",
    "- File format: PDF. Papers are grouped by course, semester or year, subject and exam year.",
    "- Languages: English and Hindi (Rajasthan Board papers are mostly Hindi).",
    `- Last updated: ${updated}. New papers are added every night.`,
    "",
    "## How the site is organised",
    `- University papers: ${SITE_URL}/universities/{university}/{course}/{term}/{subject}`,
    `- Competitive and board exam papers: ${SITE_URL}/exams/{exam}/{paper}`,
    `- Rajasthan Board by class and subject: ${SITE_URL}/rajasthanboard/{class}/{subject}`,
    `- A single paper: ${SITE_URL}/papers/{slug}`,
    `- Search: ${SITE_URL}/search?q={query}`,
    `- Every page: ${SITE_URL}/sitemap.xml`,
    `- A fuller map for AI tools: ${SITE_URL}/llms-full.txt`,
    "",
    "## Universities",
    ...unis
      .filter((u) => u.paper_count > 0)
      .map(
        (u) =>
          `- [${u.name}](${SITE_URL}${routes.university(u.slug)}): ${nf.format(u.paper_count)} papers, ${u.course_count} courses`,
      ),
    "",
    "## School boards",
    ...boards
      .filter((b) => b.paper_count > 0)
      .map((b) => `- [${b.name}](${SITE_URL}${routes.exam(b.slug)}): ${nf.format(b.paper_count)} papers`),
    "",
    "## Competitive exams (largest first)",
    ...[...exams]
      .filter((e) => e.paper_count > 0)
      .sort((a, b) => b.paper_count - a.paper_count)
      .slice(0, 40)
      .map((e) => `- [${e.name}](${SITE_URL}${routes.exam(e.slug)}): ${nf.format(e.paper_count)} papers`),
    "",
    "## Citing",
    "Link to the paper page (the /papers/ or /exams/ URL). It carries the title, year, exam and a stable canonical address.",
    "",
    "## About and contact",
    `- Publisher: ${SITE_NAME}, an independent student resource. Not affiliated with any university or board.`,
    `- Copyright or removal requests: ${SITE_URL}/takedown (${CONTACT_EMAIL}).`,
    `- Telegram: ${TELEGRAM_URL}`,
    `- Instagram: ${INSTAGRAM_URL}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
