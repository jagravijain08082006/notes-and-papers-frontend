import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SITE_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DetailsMenu } from "@/components/ui/details-menu";
import { getNavFlags } from "@/lib/api/nav-flags";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const flags = await getNavFlags();
  const NAV = [
    { href: routes.rbse, label: "RBSE Board" },
    { href: routes.uniraj, label: "UNIRAJ Jaipur" },
    { href: routes.rtu, label: "RTU Kota" },
    ...(flags.notes ? [{ href: "/notes", label: "Notes" }] : []),
    { href: "/search", label: "Search" },
  ];
  const RAJASTHAN_MOBILE = [
    { href: routes.rbse, label: "RBSE Rajasthan Board (9th–12th)" },
    { href: routes.uniraj, label: "UNIRAJ Jaipur (UOR)" },
    { href: routes.rtu, label: "RTU Kota Engineering" },
  ];
  const OTHER_MOBILE = [
    { href: routes.boards, label: "All School Boards" },
    { href: routes.universities, label: "All Universities" },
    { href: routes.exams, label: "Competitive Exams" },
    { href: routes.categories, label: "Categories Directory" },
    ...(flags.notes ? [{ href: "/notes", label: "Notes" }] : []),
    { href: "/search", label: "Search Papers" },
    ...(flags.uploads ? [{ href: "/upload", label: "Upload" }] : []),
    { href: "/account", label: "My Account" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
          <Image
            src="/favicon/android-chrome-192x192.png"
            alt="Notes & Papers Logo"
            width={36}
            height={36}
            priority
            className="size-8 shrink-0 border-2 border-border shadow-hard-sm sm:size-9"
          />
          <span className="font-display text-base uppercase leading-[1.2] tracking-wide sm:text-xl">
            Notes <span className="text-accent">&amp;</span> Papers
          </span>
        </Link>

        <NavLinks items={NAV} />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {/* a thin line separates the theme switch from the account buttons */}
          <span aria-hidden="true" className="mx-0.5 hidden h-6 w-0.5 bg-border/60 sm:block" />
          <UserMenu />
          {/* <details> keeps the mobile menu working with JavaScript disabled */}
          <DetailsMenu
            className="relative md:hidden"
            summary={
              <summary
                aria-label="Open menu"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "cursor-pointer list-none",
                )}
              >
                <Menu className="size-5" aria-hidden="true" />
              </summary>
            }
          >
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-14 w-64 space-y-1 border-2 border-border bg-card p-2 shadow-hard"
            >
              <div className="border-b-2 border-border/60 pb-1 mb-1">
                <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Rajasthan Core
                </p>
                {RAJASTHAN_MOBILE.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="block px-3 py-2 text-xs font-black uppercase tracking-wide bg-primary/20 hover:bg-primary border border-border/40 my-1 transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
              <div>
                <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Other Archives
                </p>
                {OTHER_MOBILE.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="block px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-muted transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
              <div className="border-t-2 border-border/60 pt-2.5 mt-2 px-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              <div className="border-t-2 border-border/60 pt-2 mt-2">
                <Link
                  href="/signup"
                  className="block w-full text-center py-2 bg-primary text-primary-foreground border-2 border-border font-bold uppercase text-xs shadow-hard-sm hover:shadow-hard transition-all"
                >
                  Create Account (Sign Up)
                </Link>
              </div>
            </nav>
          </DetailsMenu>
        </div>
      </div>
    </header>
  );
}
