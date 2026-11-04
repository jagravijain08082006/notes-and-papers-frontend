import Link from "next/link";
import { ArrowRight, BookOpen, FileText, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PaperSummary } from "@/lib/api/types";
import type { RbseClassSubjectSummary, SubtypeGroup } from "@/lib/rbse-channels";
import { paperHref } from "@/lib/routes";
import { plural } from "@/lib/utils";

export interface RbseCard {
  href: string;
  name: string;
  count: number;
  badge?: string;
  tag?: string;
}

/** Same card as the university course cards (icon, chips, title, paper count, "Explore papers"). */
export function RbseCardGrid({
  items,
  icon = "class",
}: {
  items: RbseCard[];
  icon?: "class" | "subject";
}) {
  const Icon = icon === "class" ? GraduationCap : BookOpen;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <li key={it.href}>
          <Card className="group h-full border-2 border-border transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
            <Link href={it.href} className="flex h-full flex-col justify-between p-5">
              <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center border-2 border-border bg-primary text-foreground shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground sm:size-12">
                  <Icon className="size-5 sm:size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  {(it.badge || it.tag) && (
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      {it.badge && (
                        <span className="border border-border bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                          {it.badge}
                        </span>
                      )}
                      {it.tag && (
                        <span className="border border-border bg-card px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          {it.tag}
                        </span>
                      )}
                    </div>
                  )}
                  <h2 className="text-xl font-bold leading-snug transition-colors group-hover:text-link sm:text-2xl">
                    {it.name}
                  </h2>
                </div>
                <ArrowRight
                  className="hidden size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground sm:block"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3.5" aria-hidden="true" />
                  {plural(it.count, "paper")} available
                </span>
                <span className="text-foreground group-hover:underline">Explore papers &rarr;</span>
              </div>
            </Link>
          </Card>
        </li>
      ))}
    </ul>
  );
}

const CATEGORY: Record<string, string> = {
  core: "Core",
  science: "Science",
  commerce: "Commerce",
  arts: "Arts",
  language: "Language",
  vocational: "Vocational",
  other: "Other",
};

export function subjectCards(subjects: RbseClassSubjectSummary[]): RbseCard[] {
  return subjects.map((s) => ({
    href: s.href,
    name: s.name,
    count: s.paperCount,
    badge: CATEGORY[s.category] ?? "Subject",
    tag: s.yearsSpan || undefined,
  }));
}

/** Every paper of one subject, newest year first. Nothing to filter: the year is the heading, the type is a small tag. */
export function RbseYearList({ groups }: { groups: SubtypeGroup[] }) {
  const byYear = new Map<string, { paper: PaperSummary; type: string }[]>();
  for (const g of groups) {
    for (const yg of g.yearGroups) {
      const list = byYear.get(yg.year) ?? [];
      for (const paper of yg.papers) list.push({ paper, type: g.label });
      byYear.set(yg.year, list);
    }
  }
  const years = [...byYear.keys()].sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return Number(b) - Number(a);
  });

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <section key={year} aria-labelledby={`y-${year}`} className="space-y-3">
          <h2 id={`y-${year}`} className="border-b-2 border-border pb-1 font-display text-2xl">
            {year}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {byYear.get(year)!.map(({ paper, type }) => (
              <li key={paper.slug}>
                <Card className="group h-full border-2 border-border transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                  <Link href={paperHref(paper)} className="flex h-full flex-col justify-between p-5">
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-11 shrink-0 place-items-center border-2 border-border bg-primary text-foreground shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground sm:size-12">
                        <FileText className="size-5 sm:size-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="border border-border bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                            {type}
                          </span>
                          {paper.year && (
                            <span className="border border-border bg-card px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                              {paper.year}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold leading-snug transition-colors group-hover:text-link sm:text-lg">
                          {paper.title}
                        </h3>
                      </div>
                      <ArrowRight
                        className="hidden size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground sm:block"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3 text-xs font-semibold text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="size-3.5" aria-hidden="true" />
                        PDF available
                      </span>
                      <span className="text-foreground group-hover:underline">View paper &rarr;</span>
                    </div>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
