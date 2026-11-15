import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLdScript } from "./json-ld";
import { breadcrumbLd } from "@/lib/seo";

export interface Crumb {
  name: string;
  path: string;
}

/** Visible breadcrumb trail + BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <ol className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap sm:gap-2 sm:border-2 sm:border-border sm:bg-card sm:px-4 sm:py-2.5 text-xs font-bold sm:uppercase sm:tracking-wider sm:shadow-hard-sm">
          {items.map((it, i) => {
            const last = i === items.length - 1;
            return (
              <li
                key={`${it.path}-${i}`}
                className={`min-w-0 shrink-0 items-center gap-1.5 ${i > 0 && i < items.length - 2 ? "hidden sm:inline-flex" : "inline-flex"}`}
              >
                {last ? (
                  <span
                    aria-current="page"
                    className="max-w-[20ch] xs:max-w-[26ch] sm:max-w-[40ch] truncate border border-border bg-primary px-2.5 py-1 font-bold text-primary-foreground shadow-hard-sm"
                    title={it.name}
                  >
                    {it.name}
                  </span>
                ) : (
                  <Link
                    href={it.path}
                    className="flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {i === 0 && <Home className="size-3.5" aria-hidden="true" />}
                    {i === 0 ? <span className="sr-only">{it.name}</span> : it.name}
                  </Link>
                )}
                {!last && (
                  <ChevronRight
                    className="size-3.5 shrink-0 text-muted-foreground/80"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLdScript data={breadcrumbLd(items)} />
    </>
  );
}
