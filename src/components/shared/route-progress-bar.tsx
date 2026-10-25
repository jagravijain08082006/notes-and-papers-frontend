"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * High-performance global route transition progress bar.
 * Provides instant visual feedback on any click/navigation across the entire website.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, complete the animation and hide
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const raf = requestAnimationFrame(() => {
      setProgress(100);
      timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  // Global click interceptor for internal links
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, downloads, new tabs, anchors, and modified clicks
      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if clicking current URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start progress animation
      setLoading(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress((p) => (p < 60 ? 60 : p)), 150);
      const t2 = setTimeout(() => setProgress((p) => (p < 85 ? 85 : p)), 500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-1 w-full overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_10px_#FACC15] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
