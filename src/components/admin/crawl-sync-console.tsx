"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Server,
  Zap,
  Play,
  RotateCw,
  Sliders,
  CheckCircle2,
  Clock,
  Save,
  Globe,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { bff } from "@/services/api-client";
import { cn } from "@/lib/utils";

export interface CrawlConfig {
  default_runner?: "server" | "github_actions";
  default_site?: "all" | "uoronline" | "rtuonline" | "pyqonline";
  brand_limit?: number;
  daily_crawling_enabled?: boolean;
  schedule_status?: "active" | "paused_for_quota";
}

interface CrawlSyncConsoleProps {
  initialConfig?: CrawlConfig;
  running?: boolean;
}

const SITES = [
  { id: "all", label: "All Sources", desc: "UNIRAJ, RTU Kota & PYQ Online" },
  { id: "uoronline", label: "UNIRAJ (uoronline)", desc: "University of Rajasthan" },
  { id: "rtuonline", label: "RTU Kota (rtuonline)", desc: "Rajasthan Technical University" },
  { id: "pyqonline", label: "PYQ Online", desc: "CBSE, RBSE & School/State Boards" },
] as const;

const LIMITS = [
  { value: 0, label: "0 (Scrape only)", desc: "Metadata & catalog only (instant, no PDFs)" },
  { value: 50, label: "50 PDFs", desc: "Fast batch (~1-2 mins, lowest server load)" },
  { value: 200, label: "200 PDFs", desc: "Standard recommended batch" },
  { value: 500, label: "500 PDFs", desc: "Deep batch (intensive)" },
  { value: 1500, label: "1500 PDFs", desc: "Full bulk batch" },
] as const;

export function CrawlSyncConsole({ initialConfig = {}, running = false }: CrawlSyncConsoleProps) {
  const router = useRouter();

  const [runner, setRunner] = useState<"server" | "github_actions">(
    initialConfig.default_runner || "server",
  );
  const [site, setSite] = useState<"all" | "uoronline" | "rtuonline" | "pyqonline">(
    initialConfig.default_site || "all",
  );
  const [brandLimit, setBrandLimit] = useState<number>(
    typeof initialConfig.brand_limit === "number" ? initialConfig.brand_limit : 200,
  );
  const [dailyEnabled, setDailyEnabled] = useState<boolean>(
    initialConfig.daily_crawling_enabled ?? true,
  );

  const [busy, setBusy] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Trigger sync on chosen environment
  async function handleTrigger(targetRunner: "server" | "github_actions") {
    if (busy || running) return;

    const isServer = targetRunner === "server";
    const endpoint = isServer ? "/admin/sync" : "/admin/sync/dispatch";
    const runnerName = isServer ? "FastAPI Server" : "GitHub Actions";

    const confirmMsg = isServer
      ? `Run crawl & sync for "${site}" (${brandLimit} PDFs) directly on the backend server?\n\nThis runs as a background task on the server and uses 0 GitHub Actions minutes.`
      : `Dispatch crawl & sync for "${site}" (${brandLimit} PDFs) on GitHub Actions?\n\nThis will trigger daily-sync.yml and consume GitHub runner minutes.`;

    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    const toastId = toast.loading(`Starting crawl & sync on ${runnerName}...`);

    try {
      await bff(endpoint, {
        method: "POST",
        body: { site, brand_limit: brandLimit },
      });

      toast.success(
        isServer
          ? "Server sync started successfully! Running in background."
          : "GitHub Actions workflow dispatched successfully!",
        {
          id: toastId,
          description: `Target: ${site.toUpperCase()} | Brand limit: ${brandLimit} PDFs`,
        },
      );
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to trigger sync on ${runnerName}.`,
        { id: toastId },
      );
    } finally {
      setBusy(false);
    }
  }

  // Save default configuration to server settings
  async function handleSaveConfig() {
    setSavingSettings(true);
    const toastId = toast.loading("Saving crawl & sync configuration to server...");

    try {
      await bff("/admin/settings", {
        method: "PUT",
        body: {
          crawl_config: {
            default_runner: runner,
            default_site: site,
            brand_limit: brandLimit,
            daily_crawling_enabled: dailyEnabled,
            schedule_status: "paused_for_quota",
          },
        },
      });

      toast.success("Crawl configuration saved as server default!", { id: toastId });
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save configuration.",
        { id: toastId },
      );
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="border-2 border-border bg-card p-5 shadow-hard-sm space-y-6">
      {/* Top Banner: Status & 5-Day Schedule Pause Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider">
              GitHub Actions Schedule: Paused for 5 Days (Free Quota Guard)
            </span>
            <p className="mt-0.5 text-muted-foreground leading-relaxed">
              Automatic nightly cron is temporarily paused until <strong>Nov 01, 2026</strong> to protect your account (1,837 / 2,000 mins used). Use <strong>Crawl on Server</strong> below for unlimited, zero-cost syncs!
            </p>
          </div>
        </div>
        <Badge tone="default" className="shrink-0 bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-600/40">
          ⏸️ Cron Paused
        </Badge>
      </div>

      {/* Control Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Where to Crawl (Target Runner) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              1. Where to Crawl (Execution Engine)
            </label>
            <span className="text-[11px] text-muted-foreground">Select runner</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRunner("server")}
              className={cn(
                "flex flex-col text-left p-3.5 border-2 transition-all cursor-pointer relative",
                runner === "server"
                  ? "border-primary bg-primary/10 shadow-hard-xs font-semibold"
                  : "border-border bg-card hover:bg-muted/30 opacity-80",
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  <Server className="h-4 w-4 text-primary" />
                  On Server
                </span>
                <Badge tone="primary" className="text-[9px] px-1.5 py-0">
                  0 Min Cost
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                FastAPI background worker. 100% Free, bypasses GitHub Actions quota completely.
              </p>
              {runner === "server" && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRunner("github_actions")}
              className={cn(
                "flex flex-col text-left p-3.5 border-2 transition-all cursor-pointer relative",
                runner === "github_actions"
                  ? "border-primary bg-primary/10 shadow-hard-xs font-semibold"
                  : "border-border bg-card hover:bg-muted/30 opacity-80",
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  <Zap className="h-4 w-4 text-accent" />
                  GitHub Actions
                </span>
                <Badge tone="accent" className="text-[9px] px-1.5 py-0">
                  Runner Minutes
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                Dispatches daily-sync.yml to GitHub Cloud Ubuntu runner.
              </p>
              {runner === "github_actions" && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 2. Which Sites to Crawl */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              2. Which Sites to Crawl
            </label>
            <span className="text-[11px] text-muted-foreground">Select scope</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SITES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSite(s.id as typeof site)}
                className={cn(
                  "flex flex-col text-left p-2.5 border-2 transition-all cursor-pointer",
                  site === s.id
                    ? "border-primary bg-primary/10 font-bold shadow-hard-xs"
                    : "border-border bg-card hover:bg-muted/30 opacity-80 text-muted-foreground",
                )}
              >
                <span className="text-xs font-semibold">{s.label}</span>
                <span className="text-[10px] text-muted-foreground truncate">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. PDF Branding & Sync Limit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              3. Branding Limit (Batch Size)
            </label>
            <span className="text-[11px] font-mono text-primary font-bold">
              {brandLimit} PDFs
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {LIMITS.map((lim) => (
              <button
                key={lim.value}
                type="button"
                onClick={() => setBrandLimit(lim.value)}
                className={cn(
                  "py-2 px-1 text-center border-2 transition-all cursor-pointer text-xs",
                  brandLimit === lim.value
                    ? "border-primary bg-primary text-primary-foreground font-bold shadow-hard-xs"
                    : "border-border bg-card hover:bg-muted/30 text-foreground",
                )}
                title={lim.desc}
              >
                {lim.value}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {LIMITS.find((l) => l.value === brandLimit)?.desc}
          </p>
        </div>

        {/* 4. Automated Daily Schedule Preference */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              4. Daily Crawling Mode
            </label>
            <span className="text-[11px] text-muted-foreground">Automation setting</span>
          </div>

          <div className="flex items-center justify-between p-3 border-2 border-border bg-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">
                Daily Automatic Crawling
              </p>
              <p className="text-[11px] text-muted-foreground">
                {dailyEnabled ? "Enabled (runs daily sync task)" : "Disabled (manual triggers only)"}
              </p>
            </div>
            <Button
              type="button"
              variant={dailyEnabled ? "primary" : "outline"}
              size="sm"
              onClick={() => setDailyEnabled(!dailyEnabled)}
            >
              {dailyEnabled ? "Active" : "Paused"}
            </Button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t-2 border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action Button based on chosen runner */}
          {runner === "server" ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => handleTrigger("server")}
              disabled={busy || running}
              className="gap-2 font-bold"
            >
              {busy ? <Spinner className="size-4" /> : <Play className="h-4 w-4 fill-current" />}
              Crawl & Sync Now on Server
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleTrigger("github_actions")}
              disabled={busy || running}
              className="gap-2 font-bold"
            >
              {busy ? <Spinner className="size-4" /> : <Zap className="h-4 w-4 fill-current" />}
              Crawl & Sync on GitHub Actions
            </Button>
          )}

          {/* Quick Alternate Runner Trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTrigger(runner === "server" ? "github_actions" : "server")}
            disabled={busy || running}
            className="text-xs gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Trigger on {runner === "server" ? "GitHub Actions" : "Server"} instead
          </Button>
        </div>

        {/* Save Configuration to Server */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSaveConfig}
          disabled={savingSettings}
          className="text-xs gap-1.5"
        >
          {savingSettings ? <Spinner className="size-4" /> : <Save className="h-3.5 w-3.5" />}
          Save as Server Default
        </Button>
      </div>
    </div>
  );
}
