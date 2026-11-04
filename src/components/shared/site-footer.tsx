import Image from "next/image";
import Link from "next/link";
import { getNavFlags } from "@/lib/api/nav-flags";
import { ContactDetails } from "./contact-details";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";

export async function SiteFooter() {
  const flags = await getNavFlags();
  const COLUMNS = [
    {
      title: "Explore",
      links: [
        { href: routes.uniraj, label: "UNIRAJ Jaipur (UOR)" },
        { href: routes.rtu, label: "RTU Kota Engineering" },
        { href: routes.rbse, label: "Rajasthan Board (RBSE)" },
        ...(flags.notes ? [{ href: "/notes", label: "Notes" }] : []),
        { href: routes.universities, label: "All Universities" },
        { href: routes.boards, label: "All School Boards" },
        { href: routes.exams, label: "Competitive Exams" },
        { href: "/search", label: "Search papers" },
      ],
    },
    {
      title: "Courses",
      links: [
        { href: "/universities/rajasthan-university/bcom", label: "UNIRAJ B.Com" },
        { href: "/universities/rajasthan-university/bsc", label: "UNIRAJ B.Sc" },
        { href: "/universities/rajasthan-university/bca", label: "UNIRAJ BCA" },
        { href: "/universities/rajasthan-university/b-ed", label: "UNIRAJ B.Ed" },
        { href: "/universities/rajasthan-university/ba", label: "UNIRAJ B.A" },
        { href: "/universities/rajasthan-technical-university", label: "RTU Kota B.Tech" },
      ],
    },
    {
      title: "Help",
      links: [
        ...(flags.uploads ? [{ href: "/upload", label: "Upload a paper" }] : []),
        { href: "/downloads", label: "My downloads" },
        { href: "/contact", label: "Request a paper" },
        { href: "/about", label: "About" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/terms", label: "Terms of use" },
        { href: "/takedown", label: "Takedown request" },
      ],
    },
  ];
  return (
    <footer className="mt-20 border-t-4 border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link
              href="/"
              aria-label={`${SITE_NAME} home`}
              className="flex items-center gap-2.5 font-display text-2xl uppercase leading-[1.2]"
            >
              <Image
                src="/favicon/android-chrome-192x192.png"
                alt="Notes & Papers Logo"
                width={36}
                height={36}
                className="size-9 border-2 border-border"
              />
              {SITE_NAME}
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Free previous year question papers and notes for university students and exam
              aspirants.
            </p>
            <ContactDetails className="space-y-2 text-sm font-medium text-foreground" />
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 text-xs font-black uppercase tracking-wider text-foreground">
                {col.title}
              </p>
              <ul className="space-y-2.5 text-sm font-medium">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-2 hover:underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Disclaimer & DMCA Copyright Notice: kept in a visible box on purpose */}
        <div className="mt-12 border-2 border-border bg-muted/30 p-5 sm:p-6 shadow-hard-sm">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <span className="size-2 bg-accent inline-block border border-border" aria-hidden="true" />
                Disclaimer
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The resources, notes, and previous year question papers provided on this network are solely for educational purposes to help students prepare for exams.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <span className="size-2 bg-primary inline-block border border-border" aria-hidden="true" />
                DMCA &amp; Copyright
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                If you find any copyrighted material hosted on our server that belongs to you, please mail us immediately at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL || "thecodinggiant@gmail.com"}`}
                  className="font-bold text-link underline hover:text-foreground"
                >
                  {CONTACT_EMAIL || "thecodinggiant@gmail.com"}
                </a>
                . We will remove the content within 48 to 72 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-border bg-muted/20 px-4 py-3 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-7xl text-center text-xs font-medium text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
