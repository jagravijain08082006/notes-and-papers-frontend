"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  clearDownloads,
  forgetDownload,
  onDownloadsChange,
  readDownloads,
  type LocalDownload,
} from "@/lib/local-downloads";
import { routes } from "@/lib/routes";

// useSyncExternalStore needs a stable snapshot: re-parse only when the stored text changes.
let lastRaw: string | null | undefined;
let lastList: LocalDownload[] = [];
function snapshot(): LocalDownload[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("np_downloads_v1");
  } catch {
    /* blocked */
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastList = readDownloads();
  }
  return lastList;
}
const EMPTY: LocalDownload[] = [];

/** Papers downloaded on this device, newest first. Each one is a link back to its paper page. */
export function LocalDownloadsList() {
  const items = useSyncExternalStore(onDownloadsChange, snapshot, () => EMPTY);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No downloads yet"
        description="Papers you download on this device will be listed here. This list is kept in your browser."
        action={{ href: routes.universities, label: "Browse papers" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "paper" : "papers"}, saved in this browser only.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear the list of downloaded papers on this device?")) clearDownloads();
          }}
          className="text-xs font-bold uppercase tracking-wide text-link hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <li key={d.slug}>
            <Card className="group relative h-full border-2 border-border transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
              <Link href={d.href} className="flex h-full flex-col justify-between gap-4 p-5">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-11 shrink-0 place-items-center border-2 border-border bg-primary shadow-hard-sm sm:size-12">
                    <FileText className="size-5 sm:size-6" aria-hidden="true" />
                  </span>
                  <h2 className="min-w-0 flex-1 pr-6 text-base font-bold leading-snug group-hover:text-link sm:text-lg">
                    {d.title}
                  </h2>
                </div>
                <div className="flex items-center justify-between border-t border-border/30 pt-3 text-xs font-semibold text-muted-foreground">
                  <span>
                    {new Date(d.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  <span className="inline-flex items-center gap-1 text-foreground group-hover:underline">
                    Open <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
              <button
                type="button"
                aria-label={`Remove ${d.title} from the list`}
                onClick={() => forgetDownload(d.slug)}
                className="absolute right-2 top-2 grid size-7 place-items-center text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
