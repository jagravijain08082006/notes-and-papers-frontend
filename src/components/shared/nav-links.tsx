"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GraduationCap, School, ScrollText } from "lucide-react";
import { DetailsMenu } from "@/components/ui/details-menu";
import { EXAM_DOMAINS } from "@/lib/exam-categories";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
}

/** Desktop navigation with Rajasthan pillars highlighted and accessible 'Other Exams' mega-dropdown. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();

  const isOtherActive =
    path === "/boards" ||
    path.startsWith("/categories") ||
    (path.startsWith("/exams") && !path.startsWith("/exams/uni-rajasthanboard")) ||
    (path.startsWith("/universities") &&
      !path.startsWith("/universities/rajasthan-university") &&
      !path.startsWith("/universities/rajasthan-technical-university"));

  // Keep search at the end
  const mainLinks = items.filter((n) => n.href !== "/search");
  const searchLink = items.find((n) => n.href === "/search");

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {mainLinks.map((n) => {
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

      {/* OTHER EXAMS & ARCHIVES DROPDOWN */}
      <DetailsMenu
        className="relative"
        summary={
          <summary
            className={cn(
              "flex items-center gap-1 cursor-pointer border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all list-none",
              isOtherActive
                ? "border-border bg-primary text-primary-foreground shadow-hard-sm"
                : "border-transparent text-foreground/80 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-hard-sm",
            )}
          >
            Other Exams
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </summary>
        }
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 w-[520px] border-2 border-border bg-card p-3.5 shadow-hard space-y-3">
          {/* Quick Section Jump */}
          <div className="grid grid-cols-3 gap-2 pb-2.5 border-b-2 border-border/60">
            <Link
              href={routes.boards}
              className="flex flex-col items-center justify-center p-2 text-center border-2 border-border/40 hover:border-border hover:bg-primary/20 transition-all shadow-hard-sm"
            >
              <School className="size-4 text-muted-foreground mb-1" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">All Boards</span>
              <span className="text-[10px] text-muted-foreground">CBSE, UP, ICSE</span>
            </Link>
            <Link
              href={routes.universities}
              className="flex flex-col items-center justify-center p-2 text-center border-2 border-border/40 hover:border-border hover:bg-primary/20 transition-all shadow-hard-sm"
            >
              <GraduationCap className="size-4 text-muted-foreground mb-1" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Universities</span>
              <span className="text-[10px] text-muted-foreground">Full Catalog</span>
            </Link>
            <Link
              href={routes.exams}
              className="flex flex-col items-center justify-center p-2 text-center border-2 border-border/40 hover:border-border hover:bg-primary/20 transition-all shadow-hard-sm"
            >
              <ScrollText className="size-4 text-muted-foreground mb-1" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Competitive</span>
              <span className="text-[10px] text-muted-foreground">UPSC, GATE, SSC</span>
            </Link>
          </div>

          {/* Categories Grid */}
          <div>
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              By Category / Stream
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {EXAM_DOMAINS.filter((d) => d.id !== "all").map((domain) => {
                const Icon = domain.icon;
                const active = path === `/categories/${domain.id}`;
                return (
                  <Link
                    key={domain.id}
                    href={`/categories/${domain.id}`}
                    className={cn(
                      "flex items-center gap-2 p-1.5 text-xs font-bold uppercase tracking-wide border border-transparent transition-all hover:border-border hover:bg-accent hover:text-accent-foreground",
                      active && "border-border bg-primary text-primary-foreground",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{domain.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t-2 border-border/60 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground hover:text-primary transition-colors"
            >
              View Full 10 Category Directory →
            </Link>
          </div>
        </div>
      </DetailsMenu>

      {/* SEARCH LINK */}
      {searchLink && (
        <Link
          key={searchLink.href}
          href={searchLink.href}
          aria-current={path === "/search" ? "page" : undefined}
          className={cn(
            "border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all",
            path === "/search"
              ? "border-border bg-primary text-primary-foreground shadow-hard-sm"
              : "border-transparent text-foreground/80 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-hard-sm",
          )}
        >
          {searchLink.label}
        </Link>
      )}
    </nav>
  );
}
