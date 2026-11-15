"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarkSlugs, useToggleBookmark } from "@/hooks/use-bookmarks";
import { useMe } from "@/hooks/use-me";

const subscribe = () => () => {};

export function BookmarkButton({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { data: me, isPending } = useMe();
  const { data: saved } = useBookmarkSlugs();
  const toggle = useToggleBookmark(slug);
  const isSaved = mounted && (saved?.has(slug) ?? false);

  function onClick() {
    if (!me) return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    toggle.mutate(!isSaved);
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={!mounted || isPending || toggle.isPending}
      aria-pressed={isSaved}
      className="shrink-0"
    >
      {isSaved ? (
        <BookmarkCheck className="size-4" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {isSaved ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
