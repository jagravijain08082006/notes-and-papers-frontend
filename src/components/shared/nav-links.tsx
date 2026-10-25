"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Desktop navigation with the current section highlighted. */
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {items.map((n) => {
        const active = path === n.href || path.startsWith(`${n.href}/`);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-2 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all",
              active
                ? "border-border bg-primary text-primary-foreground shadow-hard-sm"
                : "border-transparent text-foreground/80 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-hard-sm",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
