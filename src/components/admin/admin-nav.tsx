"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  Flag,
  Gauge,
  BookImage,
  History,
  Inbox,
  Radio,
  Search,
  Server,
  Upload,
  Settings,
  Users,
  Globe,
} from "lucide-react";
import type { Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: Gauge, admin: true },
  { href: "/admin/review", label: "Review queue", icon: ClipboardCheck },
  { href: "/admin/papers", label: "Papers", icon: FileText },
  { href: "/admin/notes", label: "Notes", icon: Inbox },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/imports", label: "Crawler", icon: Upload, admin: true },
  { href: "/admin/sources", label: "Sources", icon: Globe, admin: true },
  { href: "/admin/runs", label: "Crawl runs", icon: History, admin: true },
  { href: "/admin/content", label: "Content", icon: Database, admin: true },
  { href: "/admin/seo", label: "SEO", icon: BarChart3, admin: true },
  { href: "/admin/analytics", label: "Analytics", icon: Radio, admin: true },
  { href: "/admin/covers", label: "Cover pages", icon: BookImage, admin: true },
  { href: "/admin/insights", label: "Search insights", icon: Search, admin: true },
  { href: "/admin/users", label: "Users", icon: Users, admin: true },
  { href: "/admin/system", label: "System status", icon: Server, admin: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, admin: true },
  { href: "/admin/audit", label: "Audit log", icon: History, admin: true },
];

export function AdminNav({ role }: { role: Role }) {
  const path = usePathname();
  const items = ITEMS.filter((i) => !i.admin || role === "admin");
  return (
    <div className="flex flex-col gap-3 min-w-0 max-w-full">
      <nav
        aria-label="Admin"
        className="flex w-full min-w-0 max-w-full gap-1.5 overflow-x-auto pb-2 border-b-2 border-border/30 lg:border-none lg:flex-col lg:overflow-visible lg:pb-0 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              // Admin pages are rarely opened one after another: no background fetch of all 17 pages on every visit.
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 border-2 border-transparent px-3 py-2 text-xs font-bold uppercase tracking-wide hover:border-border hover:bg-muted transition-colors",
                active && "border-border bg-primary text-primary-foreground shadow-hard-sm",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

