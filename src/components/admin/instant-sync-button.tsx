"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { bff } from "@/services/api-client";
import { cn } from "@/lib/utils";

interface InstantSyncButtonProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function InstantSyncButton({
  variant = "primary",
  size = "sm",
  className,
  label = "Instant Sync",
  showIcon = true,
}: InstantSyncButtonProps) {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function handleSync() {
    if (running) return;
    setRunning(true);
    const toastId = toast.loading("Dispatching instant sync on GitHub Actions...");

    try {
      // First try the dedicated GitHub Actions dispatch endpoint
      try {
        await bff("/admin/sync/dispatch", {
          method: "POST",
          body: { site: "all", brand_limit: 1500 },
        });
      } catch (dispatchErr) {
        // Fallback to the standard admin sync endpoint if needed
        console.warn("Direct dispatch endpoint failed, trying fallback:", dispatchErr);
        await bff("/admin/sync", {
          method: "POST",
          body: { site: "all", brand_limit: 300 },
        });
      }

      toast.success("Instant sync dispatched on GitHub Actions! Workflow started.", {
        id: toastId,
        description: "Scrape, metadata index and PDF branding will process in background.",
      });
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to dispatch instant sync. Please check logs.",
        { id: toastId },
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={running}
      aria-label="Run instant sync cron job on GitHub Actions"
      className={cn(
        "gap-2 font-bold uppercase tracking-wide text-xs shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0",
        className,
      )}
    >
      {running ? (
        <RefreshCw className="size-3.5 animate-spin text-current" aria-hidden="true" />
      ) : showIcon ? (
        <Zap className="size-3.5 fill-current text-current" aria-hidden="true" />
      ) : null}
      <span>{running ? "Dispatching..." : label}</span>
    </Button>
  );
}
