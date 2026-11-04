"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, X } from "lucide-react";
import type { Me } from "@/lib/api/types";

const SNOOZE_MS = 3 * 24 * 3600 * 1000; // after "Later" the bubble stays away for three days
const HIDDEN_ON = ["/account", "/login", "/signup", "/admin"];

const FIELDS: (keyof Me)[] = ["phone", "college", "course", "state", "city"];

function missingCount(me: Me) {
  return FIELDS.filter((f) => !String(me[f] ?? "").trim()).length;
}

/**
 * A small speech bubble under the profile icon: "complete your profile". It never blocks the page (so a download that
 * started after login keeps going), shows only while the profile has empty fields, and can be dismissed.
 */
export function ProfileNudge({ me }: { me: Me }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const missing = missingCount(me);
  const key = `np_profile_nudge_${me.id}`;

  useEffect(() => {
    if (missing === 0) return;
    let snoozed = false;
    try {
      const at = Number(localStorage.getItem(key) ?? 0);
      snoozed = Date.now() - at < SNOOZE_MS;
    } catch {
      /* storage blocked: show it, it can still be closed for this visit */
    }
    if (snoozed) return;
    const t = setTimeout(() => setOpen(true), 1200); // let the page settle first
    return () => clearTimeout(t);
  }, [missing, key]);

  if (!open || missing === 0 || HIDDEN_ON.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  function later() {
    setOpen(false);
    try {
      localStorage.setItem(key, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="status"
      className="absolute right-0 top-[3.25rem] z-40 w-64 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2"
    >
      {/* the tail, pointing up at the profile icon */}
      <span
        aria-hidden="true"
        className="absolute -top-2.5 right-6 size-4 rotate-45 border-l-2 border-t-2 border-border bg-card"
      />
      <div className="relative border-2 border-border bg-card p-4 shadow-hard">
        <Heart
          className="absolute -left-3 -top-3 size-5 rotate-[-15deg] fill-foreground text-foreground"
          aria-hidden="true"
        />
        <Heart
          className="absolute -right-3 -top-2 size-4 rotate-[15deg] fill-foreground text-foreground"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={later}
          aria-label="Close"
          className="absolute right-1.5 top-1.5 grid size-6 place-items-center hover:bg-muted"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
        <p className="pr-5 font-display text-lg uppercase leading-tight">Complete your profile</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {missing} {missing === 1 ? "detail" : "details"} left. It takes a minute.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Link
            href="/account"
            onClick={later}
            className="border-2 border-border bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard"
          >
            Complete now
          </Link>
          <button
            type="button"
            onClick={later}
            className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
