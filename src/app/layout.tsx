import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { SocialCommunityPopup } from "@/components/shared/social-popup";
import { JsonLdScript } from "@/components/shared/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/env";

const display = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const body = Space_Grotesk({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Free Previous Year Question Papers`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free previous year question papers for Rajasthan University, school boards & competitive exams (UPSC, SSC, NEET). Download authentic PYQ PDFs free.",
  applicationName: SITE_NAME,
  keywords: [
    "notes and papers",
    "notes and papers dpdns",
    "notesandpapers",
    "notesandpapers dpdns org",
    "notes and papers question papers",
    "previous year question papers",
    "free question papers pdf",
    "rajasthan university papers",
    "rtu previous year papers",
    "cbse question papers",
    "rbse board papers",
    "upsc pyq",
    "ssc pyq",
  ],
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    title: `${SITE_NAME} - Free Previous Year Question Papers`,
    description:
      "Free previous year question papers for Rajasthan University, school boards & competitive exams (UPSC, SSC, NEET). Download authentic PYQ PDFs free.",
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  verification: {
    google: "6kg8ml3F16HFts5p3ygtf5Kpr93ve4XNjX5fcRVbPl8",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FACC15" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

import { RouteProgressBar } from "@/components/shared/route-progress-bar";
import { Suspense } from "react";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(typeof __name==='undefined'){window.__name=function(t,n){return Object.defineProperty(t,'name',{value:n,configurable:!0})}}",
          }}
        />
        <JsonLdScript
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            alternateName: [
              "Notes & Papers",
              "NotesAndPapers",
              "Notes and Papers",
              "Notes & Papers Academic Vault",
            ],
            url: SITE_URL,
            image: `${SITE_URL}/icon-192.png`,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <Providers>
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          <a
            href="#main"
            className="sr-only z-50 border-2 bg-primary px-4 py-2 font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <OfflineBanner />
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-7xl min-w-0 flex-1 overflow-x-clip px-3.5 py-8 sm:px-6 sm:py-10 lg:py-14">
            {children}
          </main>
          <SiteFooter />
          <SocialCommunityPopup />
        </Providers>
      </body>
    </html>
  );
}
