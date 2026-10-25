"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InteractiveCardLinkProps {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function InteractiveCardLink({
  href,
  title,
  subtitle,
  badge,
  icon,
  className,
}: InteractiveCardLinkProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Card
      className={cn(
        "group h-full transition-all border-2 border-border",
        loading
          ? "border-primary bg-primary/10 shadow-none translate-x-0.5 translate-y-0.5"
          : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard",
        className,
      )}
    >
      <Link
        href={href}
        onClick={() => setLoading(true)}
        className="relative flex h-full flex-col justify-between p-4 sm:p-5 outline-none"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            {icon ? (
              <span className="grid size-10 shrink-0 place-items-center border-2 border-border bg-primary text-foreground shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {icon}
              </span>
            ) : null}
            {loading ? (
              <span className="inline-flex items-center gap-1.5 border border-border bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm animate-pulse ml-auto">
                <Loader2 className="size-3 animate-spin" />
                Opening...
              </span>
            ) : badge ? (
              <span className="border border-border bg-background px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground ml-auto">
                {badge}
              </span>
            ) : null}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-2xl font-bold tracking-normal text-foreground group-hover:text-link transition-colors leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end pt-2 border-t border-border/20">
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" aria-hidden="true" />
        </div>
      </Link>
    </Card>
  );
}
