import type { PaperSummary } from "@/lib/api/types";
import { PaperCard } from "./paper-card";

export function PaperList({ papers }: { papers: PaperSummary[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-2 w-full min-w-0 max-w-full">
      {papers.map((p) => (
        <li key={p.slug} className="w-full min-w-0 max-w-full">
          <PaperCard paper={p} />
        </li>
      ))}
    </ul>
  );
}

export function PaperListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-2 w-full min-w-0 max-w-full" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="h-[104px] w-full min-w-0 animate-pulse border-2 border-border/30 bg-muted" />
      ))}
    </ul>
  );
}
