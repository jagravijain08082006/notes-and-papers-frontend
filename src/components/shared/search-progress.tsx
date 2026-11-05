"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const STEPS = [
  "Searching the archive...",
  "Matching subjects and years...",
  "Ranking the best papers...",
  "Almost there...",
];

/**
 * Shown while a search is running. The real time is unknown, so the bar moves quickly at first and then keeps creeping
 * towards 95% (never freezing), and the message changes as it goes. It disappears when the results arrive.
 */
export function SearchProgress({ query }: { query?: string }) {
  const [progress, setProgress] = useState(8);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const bar = setInterval(() => {
      setProgress((p) => (p >= 95 ? p : Math.min(95, p + (95 - p) * 0.1 + 0.4)));
    }, 300);
    const text = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1800);
    return () => {
      clearInterval(bar);
      clearInterval(text);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-3 border-2 border-border bg-card p-5 shadow-hard-sm"
    >
      <div className="flex items-center justify-between gap-3 text-sm font-bold uppercase tracking-wide">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 animate-pulse place-items-center border-2 border-border bg-primary shadow-hard-sm">
            <Search className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate">{query ? `"${query}"` : "Searching"}</span>
        </span>
        <span className="font-display text-lg tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden border-2 border-border bg-background p-0.5">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{STEPS[step]}</p>
    </div>
  );
}
