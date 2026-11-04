"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { bff } from "@/services/api-client";

const SITES = [
  { id: "all", label: "All (UNIRAJ, RTU, Rajasthan Board)" },
  { id: "uoronline", label: "UNIRAJ only" },
  { id: "rtuonline", label: "RTU only" },
  { id: "rajasthanboard", label: "Rajasthan Board only" },
  { id: "pyqonline", label: "PYQ Online only" },
];
const LIMITS = [
  { value: 0, label: "Find new papers only" },
  { value: 50, label: "Find new papers + brand 50 PDFs" },
  { value: 100, label: "Find new papers + brand 100 PDFs" },
];

const select =
  "h-10 w-full border-2 border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary";

/** The one place to start a crawl: pick what to crawl, press Run. */
export function CrawlRunPanel({ running }: { running: boolean }) {
  const router = useRouter();
  const [site, setSite] = useState("all");
  const [limit, setLimit] = useState(50);
  const [busy, setBusy] = useState(false);

  async function run(path: "/admin/sync" | "/admin/sync/dispatch") {
    if (busy || running) return;
    setBusy(true);
    const toastId = toast.loading("Starting...");
    try {
      await bff(path, { method: "POST", body: { site, brand_limit: limit } });
      toast.success("Crawl started. This page updates by itself.", { id: toastId });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the crawl.", { id: toastId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 border-2 border-border bg-card p-5 shadow-hard-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide">
          What to crawl
          <select className={select} value={site} onChange={(e) => setSite(e.target.value)}>
            {SITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide">
          How much
          <select
            className={select}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {LIMITS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={() => void run("/admin/sync")}
          disabled={busy || running}
          className="gap-2 font-bold"
        >
          {busy ? <Spinner className="size-4" /> : <Play className="size-4 fill-current" />}
          {running ? "A crawl is running..." : "Run now"}
        </Button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Start this crawl on GitHub Actions instead? It uses GitHub runner minutes."))
              void run("/admin/sync/dispatch");
          }}
          disabled={busy || running}
          className="text-xs font-bold uppercase tracking-wide text-link hover:underline disabled:opacity-50"
        >
          Run on GitHub instead
        </button>
      </div>
    </div>
  );
}
