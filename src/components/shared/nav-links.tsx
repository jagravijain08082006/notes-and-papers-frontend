"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DetailsMenu } from "@/components/ui/details-menu";
import { EXAM_DOMAINS } from "@/lib/exam-categories";
import { cn } from "@/lib/utils";

/** Desktop navigation with the current section highlighted and accessible Categories mega-dropdown. */
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  const isCategoriesActive = path.startsWith("/categories");

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {items.map((n) => {
        const active = path === n.href || (n.href !== "/" && path.startsWith(`${n.href}/`));
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all",
              active
                ? "border-border bg-primary text-primary-foreground shadow-hard-sm"
                : "border-transparent text-foreground/80 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-hard-sm",
            )}
          >
            {n.label}
          </Link>
        );
      })}

      {/* ALL CATEGORIES DROPDOWN */}
      <DetailsMenu
        className="relative"
        summary={
          <summary
            className={cn(
              "flex items-center gap-1 cursor-pointer border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all list-none",
              isCategoriesActive
                ? "border-border bg-primary text-primary-foreground shadow-hard-sm"
                : "border-transparent text-foreground/80 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-hard-sm",
            )}
          >
            Categories
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </summary>
        }
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 w-[500px] border-2 border-border bg-card p-3 shadow-hard">
          <div className="grid grid-cols-2 gap-1.5 pb-2.5 border-b-2 border-border/60">
            {EXAM_DOMAINS.filter((d) => d.id !== "all").map((domain) => {
              const Icon = domain.icon;
              const active = path === `/categories/${domain.id}`;
              return (
                <Link
                  key={domain.id}
                  href={`/categories/${domain.id}`}
                  className={cn(
                    "flex items-center gap-2 p-2 text-xs font-bold uppercase tracking-wide border border-transparent transition-all hover:border-border hover:bg-accent hover:text-accent-foreground",
                    active && "border-border bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{domain.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-2 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground hover:text-primary transition-colors"
            >
              All 10 Exam &amp; Board Categories Directory →
            </Link>
          </div>
        </div>
      </DetailsMenu>
    </nav>
  );
}
