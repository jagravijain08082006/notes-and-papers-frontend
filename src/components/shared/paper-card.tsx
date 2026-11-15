import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PaperSummary } from "@/lib/api/types";
import { kindLabel, paperContext, paperHref } from "@/lib/routes";

interface PaperCardProps {
  paper: PaperSummary;
  index?: number;
  totalInGroup?: number;
}

/** A paper as a bordered row: icon tile, title, where it belongs, badges, and an arrow that nudges on hover. */
export function PaperCard({ paper, index, totalInGroup }: PaperCardProps) {
  const showNumbering = totalInGroup !== undefined && totalInGroup > 1 && index !== undefined;

  return (
    <Link
      href={paperHref(paper)}
      className="brutal brutal-hover group flex w-full min-w-0 max-w-full items-center gap-3.5 p-3.5 sm:gap-4 sm:p-4 bg-card transition-all"
    >
      <span className="hidden size-12 shrink-0 place-items-center border-2 border-border bg-primary shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground sm:grid">
        <FileText className="size-5 sm:size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 space-y-1.5 overflow-hidden">
        <span className="line-clamp-2 block font-bold leading-snug break-words text-sm sm:text-base">
          {paper.title}
        </span>
        <span className="eyebrow block truncate text-muted-foreground">{paperContext(paper)}</span>
        <span className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-full">
          {showNumbering && (
            <span className="hidden border border-border/60 bg-muted px-1.5 py-0.2 text-[11px] font-bold uppercase sm:inline">
              Paper #{index + 1}
            </span>
          )}
          {paper.year && <Badge tone="primary">{paper.year}</Badge>}
          {paper.kind !== "question_paper" && <Badge tone="accent">{kindLabel(paper.kind)}</Badge>}
          {paper.language && <Badge>{paper.language}</Badge>}
          {paper.paper_code && (
            <span className="hidden sm:inline">
              <Badge>Code {paper.paper_code}</Badge>
            </span>
          )}
        </span>
      </span>
      <ArrowRight
        className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block text-muted-foreground group-hover:text-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
