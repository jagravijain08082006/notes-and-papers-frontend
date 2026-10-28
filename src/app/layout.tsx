import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { SocialCommunityPopup } from "@/components/shared/social-popup";
import { MascotGuide } from "@/components/shared/mascot-guide";
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
    url: `${SITE_URL}/`,
    description:
      "Free previous year question papers for Rajasthan University, school boards & competitive exams (UPSC, SSC, NEET). Download authentic PYQ PDFs free.",
  },
  appleWebApp: {
    title: SITE_NAME,
    capable: true,
    statusBarStyle: "default",
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/x-icon" sizes="48x48" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(typeof __name==='undefined'){window.__name=function(t,n){return Object.defineProperty(t,'name',{value:n,configurable:!0})}}",
          }}
        />
        <JsonLdScript
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: `${SITE_URL}/`,
                name: SITE_NAME,
                alternateName: [
                  "Notes & Papers",
                  "NotesAndPapers",
                  "Notes and Papers",
                  "notesandpaper",
                  "Notes and Paper",
                  "notesandpapers",
                  "Notes & Papers Academic Vault",
                  "notesandpapers.dpdns.org",
                ],
                description:
                  "Free previous year question papers for Rajasthan University (UNIRAJ), RTU, school boards & competitive exams. Download authentic PYQ PDFs free.",
                publisher: {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  legalName: SITE_NAME,
                  url: `${SITE_URL}/`,
                  sameAs: [`${SITE_URL}/`, "https://www.notesandpapers.dpdns.org/"],
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/icon-192.png`,
                  },
                },
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${SITE_URL}/search?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-uniraj`,
                name: "Rajasthan University (UNIRAJ) Papers",
                url: `${SITE_URL}/universities/rajasthan-university`,
                description:
                  "UNIRAJ previous year question papers for BA, BSc, BCom, BCA, B.Ed, MA",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-bcom`,
                name: "B.Com Question Papers",
                url: `${SITE_URL}/universities/rajasthan-university/bcom`,
                description: "UNIRAJ BCom Part 1, 2, 3 previous year question papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-bsc`,
                name: "B.Sc Question Papers",
                url: `${SITE_URL}/universities/rajasthan-university/bsc`,
                description: "UNIRAJ BSc Part 1, 2, 3 previous year question papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-bca`,
                name: "BCA Question Papers",
                url: `${SITE_URL}/universities/rajasthan-university/bca`,
                description: "UNIRAJ BCA Semester 1 to 6 question papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-bed`,
                name: "B.Ed Question Papers",
                url: `${SITE_URL}/universities/rajasthan-university/b-ed`,
                description: "UNIRAJ Bachelor of Education examination papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-ba`,
                name: "B.A Question Papers",
                url: `${SITE_URL}/universities/rajasthan-university/ba`,
                description: "UNIRAJ BA Part 1, 2, 3 previous year papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-rtu`,
                name: "RTU Kota B.Tech Papers",
                url: `${SITE_URL}/universities/rajasthan-technical-university`,
                description: "Rajasthan Technical University B.Tech engineering papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-exams`,
                name: "Competitive Exams (UPSC, SSC, NEET, GATE)",
                url: `${SITE_URL}/exams`,
                description: "Previous year question papers for national & state competitive exams",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-universities`,
                name: "All University Question Papers",
                url: `${SITE_URL}/universities`,
                description:
                  "Previous year question papers of Rajasthan University, RTU Kota and more",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-ssc`,
                name: "SSC Previous Year Papers",
                url: `${SITE_URL}/exams/ssc`,
                description: "SSC CGL, CHSL, MTS, GD previous year question papers PDF",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-sbi-clerk`,
                name: "SBI Clerk Previous Year Papers",
                url: `${SITE_URL}/exams/sbi-clerk`,
                description: "SBI Clerk (Junior Associate) prelims and mains previous year papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-cg-open-school`,
                name: "CG Open School Papers",
                url: `${SITE_URL}/exams/cg-open-school`,
                description: "Chhattisgarh State Open School Class 10 and 12 previous year papers",
              },
              {
                "@type": "SiteNavigationElement",
                "@id": `${SITE_URL}/#nav-boards`,
                name: "School Boards (RBSE & CBSE)",
                url: `${SITE_URL}/exams/uni-rajasthanboard`,
                description: "Class 10th & 12th board previous year papers and model papers",
              },
            ],
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
          <main
            id="main"
            className="mx-auto w-full max-w-7xl min-w-0 flex-1 overflow-x-clip px-3.5 py-8 sm:px-6 sm:py-10 lg:py-14"
          >
            {children}
          </main>
          <SiteFooter />
          <SocialCommunityPopup />
          <MascotGuide />
        </Providers>
      </body>
    </html>
  );
}
