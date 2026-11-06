import { Skeleton } from "@/components/ui/skeleton";

// Shown at once while a page that has not been built yet is prepared (the first visit to a paper, after a deploy), and while
// navigating between pages. Pages that are already built never show it: they come straight from the cache.
export default function Loading() {
  return (
    <div className="space-y-6 py-4" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-12 w-3/4 max-w-2xl" />
      <Skeleton className="h-5 w-full max-w-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
