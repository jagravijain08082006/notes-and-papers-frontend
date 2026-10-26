import Image from "next/image";
import Link from "next/link";
import { getNavFlags } from "@/lib/api/nav-flags";
import { ContactDetails } from "./contact-details";
import { SITE_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";

export async function SiteFooter() {
  const flags = await getNavFlags();
  const COLUMNS = [
    {
      title: "Programmes",
      links: [
        { href: "/universities/rajasthan-university/bcom", label: "UNIRAJ B.Com Papers" },
        { href: "/universities/rajasthan-university/bsc", label: "UNIRAJ B.Sc Papers" },
        { href: "/universities/rajasthan-university/bca", label: "UNIRAJ BCA Papers" },
        { href: "/universities/rajasthan-university/b-ed", label: "UNIRAJ B.Ed Papers" },
        { href: "/universities/rajasthan-university/ba", label: "UNIRAJ B.A Papers" },
        { href: "/universities/rajasthan-technical-university", label: "RTU Kota B.Tech" },
      ],
    },
    {
      title: "Explore",
      links: [
        { href: routes.universities, label: "Universities" },
        { href: routes.exams, label: "Competitive exams" },
        { href: "/exams/uni-rajasthanboard", label: "RBSE Board Papers" },
        { href: "/exams/uni-cbseboardonline", label: "CBSE Sample Papers" },
        ...(flags.notes ? [{ href: "/notes", label: "Notes" }] : []),
        { href: "/search", label: "Search papers" },
      ],
    },
    {
      title: "Help",
      links: [
        ...(flags.uploads ? [{ href: "/upload", label: "Upload a paper" }] : []),
        { href: "/contact", label: "Request a paper" },
        { href: "/about", label: "About" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy policy" },
        { href: "/terms", label: "Terms of use" },
        { href: "/takedown", label: "Takedown request" },
      ],
    },
  ];
  return (
    <footer className="mt-20 border-t-4 border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              A free academic library of previous year question papers and study notes for university students and competitive exam aspirants.
            </p>
            <ContactDetails />
            <div className="flex gap-1.5 pt-1" aria-hidden="true">
              <span className="size-3 border-2 border-border bg-primary" />
              <span className="size-3 border-2 border-border bg-accent" />
              <span className="size-3 border-2 border-border bg-foreground" />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow mb-3.5 inline-block bg-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground border border-border shadow-hard-sm">
                {col.title}
              </p>
              <ul className="space-y-2.5 text-sm font-medium">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground hover:text-foreground transition-colors hover:underline hover:decoration-2 hover:underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Disclaimer & DMCA Copyright Notice (from reference) */}
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
                DMCA & Copyright
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                If you find any copyrighted material hosted on our server that belongs to you, please mail us immediately at{" "}
                <a
                  href="mailto:thecodinggiant@gmail.com"
                  className="font-bold text-link underline hover:text-foreground"
                >
                  thecodinggiant@gmail.com
                </a>
                . We will remove the content within 48 to 72 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-border bg-muted/20 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left text-xs text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p>Question papers belong to their respective universities, boards and examination bodies.</p>
        </div>
      </div>
    </footer>
  );
}
