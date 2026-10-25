# Handover (2026-10-25, fourth pass)

## State
- **Live Production Deployment:** Deployed to Cloudflare Workers on custom domain [https://notesandpapers.dpdns.org](https://notesandpapers.dpdns.org).
- **Backend Production API:** [https://backend.notesandpapers.dpdns.org/health](https://backend.notesandpapers.dpdns.org/health) (FastAPI running on Render).
- **Build & Health:** Production build (`npm run build`) and Cloudflare OpenNext deploy (`npm run cf:deploy`) pass cleanly with 0 TypeScript/Turbopack errors.
- **Local Dev Server:** Runs on port 3010 (`http://localhost:3010`) via Turbopack (`npm run dev`).
- **Google Search Console & SEO:**
  - Google verification meta tag `6kg8ml3F16HFts5p3ygtf5Kpr93ve4XNjX5fcRVbPl8` verified live in `src/app/layout.tsx`.
  - Dynamic sitemaps (`/sitemap.xml` and `/sitemaps/[type]/[file]`) extract incoming `req.url` origin at request time, ensuring all 4,139+ paper URLs emit canonical `https://notesandpapers.dpdns.org/...` URLs without build-time `localhost:3010` leaks.
  - `src/app/robots.ts` cleaned: removed unsupported `Host:` directive to clear Googlebot warnings.
  - IndexNow key live at `/indexnow-key.txt` (`d8e8d88bcb06e2901c2031fe56889b39`).
  - AI roadmap active at `/llms.txt`.
- **Paper Download Action Hero:** Redesigned in `src/components/shared/paper-page.tsx` into a high-impact neo-brutalist hero box featuring verified vault copy badge, watermark-free badge, matched outline Bookmark and Report buttons (`h-9`), trust highlights (Fast CDN, Print-Ready Vector, 100% Free), large `h-14` CTA, and online preview link.
- **Admin UI & Sync Dispatch:**
  - Standardized search bar & filter inputs to uniform `h-11` (44px) across all admin views (`src/components/admin/ui.tsx`, `select.tsx`).
  - Fixed table column squishing via `min-w-[54rem]` on `DataTable` with horizontal scroll and mono truncated URLs.
  - Added `InstantSyncButton` (`src/components/admin/instant-sync-button.tsx`) across admin navigation, overview, and SEO headers to trigger `daily-sync.yml` on GitHub Actions.

## Known gaps / next
1. Turnstile captcha integration on signup/upload/report (phase 4).
2. Privacy/Terms drafts legal review before public marketing.
3. Hindi / `hreflang` localization variant (future roadmap).

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `component_registry.md`, `deployment.md`, `module_index.md`.


