import type { Metadata } from "next";
import Link from "next/link";
import { Award, GraduationCap, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NotFoundTv } from "@/components/shared/not-found-tv";
import { SearchBar } from "@/components/shared/search-bar";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section
      aria-labelledby="nf-heading"
      className="mx-auto grid max-w-5xl items-center gap-8 py-8 sm:py-14 lg:grid-cols-[auto_1fr] lg:gap-14"
    >
      <NotFoundTv />
      <div className="space-y-6">
        <p className="eyebrow inline-block border-2 border-border bg-accent px-2.5 py-1 text-accent-foreground font-bold uppercase tracking-wider text-xs shadow-hard-sm">
          Page not found
        </p>
        <h1 id="nf-heading" className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">
          We could not find <br className="hidden sm:block" />
          that page
        </h1>
        <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          The paper may have been renamed, or its PDF is not ready yet. Search for it below, or
          browse our catalog from the start.
        </p>
        <div className="max-w-xl">
          <SearchBar />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "primary", size: "md" }),
              "w-full flex items-center justify-center gap-2",
            )}
          >
            <Home className="size-4" aria-hidden="true" />
            <span>Go to home</span>
          </Link>
          <Link
            href={routes.universities}
            className={cn(
              buttonVariants({ variant: "outline", size: "md" }),
              "w-full flex items-center justify-center gap-2",
            )}
          >
            <GraduationCap className="size-4" aria-hidden="true" />
            <span>Universities</span>
          </Link>
          <Link
            href={routes.exams}
            className={cn(
              buttonVariants({ variant: "outline", size: "md" }),
              "w-full flex items-center justify-center gap-2",
            )}
          >
            <Award className="size-4" aria-hidden="true" />
            <span>Exams & Boards</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
