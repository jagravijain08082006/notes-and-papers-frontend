"use client";

import { useRef, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { previewUrl } from "@/lib/api/urls";

interface PdfPreviewProps {
  slug: string;
  title: string;
  src?: string;
  blobUrl?: string | null;
  defaultOpen?: boolean;
  pages?: number | null;
}

/**
 * Custom Neo-Brutalist in-page PDF Viewer.
 * When `blobUrl` is provided (e.g. from an in-memory download), it displays
 * the exact downloaded file directly with zero API calls.
 */
export function PdfPreview({
  slug,
  title,
  src,
  blobUrl,
  defaultOpen = false,
  pages,
}: PdfPreviewProps) {
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const open = userToggled ?? (defaultOpen || Boolean(blobUrl));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle printing
  const handlePrint = () => {
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      window.print();
    }
  };

  const activeSrc = blobUrl ?? src ?? previewUrl(slug);

  return (
    <section
      aria-labelledby={`preview-heading-${slug}`}
      className={`space-y-4 transition-all ${
        isFullscreen
          ? "fixed inset-0 z-[100] flex flex-col bg-background p-4 sm:p-6"
          : ""
      }`}
    >
      {/* TOOLBAR & HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-border bg-card p-3.5 shadow-hard-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow flex items-center gap-1.5 border border-border bg-primary px-2.5 py-1 font-bold text-primary-foreground shadow-hard-sm">
            <Sparkles className="size-3.5" />
            Official Reader
          </span>
          {pages ? (
            <span className="inline-flex items-center gap-1 border border-border bg-muted px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {pages} Pages
            </span>
          ) : null}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {open && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 gap-1.5 px-2.5 text-xs font-bold uppercase tracking-wider shadow-none hover:bg-primary/20"
                title="Print question paper"
              >
                <Printer className="size-3.5" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              <a
                href={activeSrc}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-primary/20 hover:shadow-hard-sm"
                title="Open in new window"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Pop Out</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen((f) => !f)}
                className="h-8 gap-1.5 px-2.5 text-xs font-bold uppercase tracking-wider shadow-none hover:bg-primary/20"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="size-3.5" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </Button>
            </>
          )}

          <Button
            variant={open ? "secondary" : "primary"}
            size="sm"
            onClick={() => setUserToggled(!open)}
            aria-expanded={open}
            className="h-8 gap-1.5 px-3 text-xs font-bold uppercase tracking-wider shadow-hard-sm hover:shadow-hard"
          >
            {open ? (
              <>
                <EyeOff className="size-3.5" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                Open Document Viewer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* VIEWER FRAME */}
      {open && (
        <div
          className={`overflow-hidden border-2 border-border bg-muted shadow-hard-lg ${
            isFullscreen ? "flex-1 w-full" : "h-[75vh] min-h-[520px] w-full"
          }`}
        >
          <iframe
            ref={iframeRef}
            src={activeSrc}
            title={`${title} (PDF Document Viewer)`}
            loading="lazy"
            className="h-full w-full border-none bg-muted"
          />
        </div>
      )}
    </section>
  );
}
