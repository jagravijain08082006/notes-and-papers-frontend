"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { INSTAGRAM_URL, TELEGRAM_URL } from "@/lib/env";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const DURATION_MS = 10000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "np_social_popup_v2_24h";

export function SocialCommunityPopup() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const remainingTimeRef = useRef(DURATION_MS);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) return;
    // Check if popup was already shown in the last 24 hours
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const timeElapsed = Date.now() - parseInt(lastShown, 10);
        if (timeElapsed < ONE_DAY_MS) {
          return;
        }
      }
    } catch {
      // Ignore localStorage access issues
    }

    // Small delay on page load before sliding in smoothly
    const entranceTimeout = setTimeout(() => {
      // Mark as shown for the next 24 hours
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {
        // Ignore
      }

      setMounted(true);
      requestAnimationFrame(() => {
        setTimeout(() => setVisible(true), 50);
      });
    }, 800);

    return () => clearTimeout(entranceTimeout);
  }, []);

  // 10-second countdown with progress bar, pause-on-hover, and pause-on-touch
  useEffect(() => {
    if (!visible || paused) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      remainingTimeRef.current -= delta;

      const pct = Math.max(0, (remainingTimeRef.current / DURATION_MS) * 100);
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        handleDismiss();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visible, paused]);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => setMounted(false), 350);
  }

  if (!mounted) return null;

  return (
    <aside
      aria-label="Join our student community on Telegram and Instagram"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
      }}
      className={cn(
        "fixed inset-x-3 sm:inset-x-auto sm:right-6 z-[999] sm:w-[380px] max-w-md mx-auto sm:mx-0",
        "border-2 border-border bg-card p-4 sm:p-5 shadow-hard-lg transition-all duration-350 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none",
      )}
    >
      {/* HEADER & CLOSE BUTTON */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="eyebrow flex items-center gap-1.5 border border-border bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
          <span className="size-2 rounded-full bg-accent animate-ping" />
          Community Alerts
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="size-8 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent hover:border-border -mr-1 -mt-1 active:scale-95"
          aria-label="Close notification"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-1 mb-3.5">
        <h3 className="font-display text-lg uppercase leading-tight tracking-wider text-foreground">
          Join Telegram &amp; Instagram
        </h3>
        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
          Get question paper updates, university exam timetable alerts, and direct PDF drops.
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDismiss}
          className="flex min-h-[44px] items-center justify-center gap-2 border-2 border-border bg-[#229ED9] px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-hard-sm hover:shadow-hard transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <Send className="size-4" aria-hidden="true" />
          <span>Telegram</span>
        </a>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDismiss}
          className="flex min-h-[44px] items-center justify-center gap-2 border-2 border-border bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-hard-sm hover:shadow-hard transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <InstagramIcon className="size-4" />
          <span>Instagram</span>
        </a>
      </div>

      {/* AUTO-DISMISS PROGRESS BAR (10 SECONDS) */}
      <div
        className="mt-3.5 h-1.5 w-full bg-muted/60 overflow-hidden border border-border/20"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
}
