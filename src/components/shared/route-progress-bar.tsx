"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GIVE_UP_MS = 30_000; // a click that never leads to a new page must not leave the bar on screen

/**
 * Global route transition progress bar.
 * The browser cannot know how long the next page takes, so the bar is an estimate: it moves quickly at first, then keeps
 * creeping towards 95% (never freezing) until the new page arrives, when it jumps to 100% and fades out.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const creep = useRef<ReturnType<typeof setInterval> | null>(null);
  const giveUp = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopTimers() {
    if (creep.current) clearInterval(creep.current);
    if (giveUp.current) clearTimeout(giveUp.current);
    creep.current = null;
    giveUp.current = null;
  }

  // The new page arrived: finish the bar and hide it
  useEffect(() => {
    stopTimers();
    let timer: ReturnType<typeof setTimeout> | undefined;
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

      stopTimers();
      setLoading(true);
      setProgress(25);
      // Each tick covers 8% of what is left, so it slows down but never stops.
      creep.current = setInterval(() => {
        setProgress((p) => (p >= 95 ? p : Math.min(95, p + (95 - p) * 0.08 + 0.3)));
      }, 400);
      giveUp.current = setTimeout(() => {
        stopTimers();
        setLoading(false);
        setProgress(0);
      }, GIVE_UP_MS);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      stopTimers();
    };
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
