# Handover (2026-10-26, seventh pass)

## State
- **Live Production Deployment:** Deployed to Cloudflare Workers on custom domain [https://notesandpapers.dpdns.org](https://notesandpapers.dpdns.org).
  - Version ID: `bcbc123c-087e-480e-842b-fae82a7adcc5`.
  - Custom Domains & Triggers: `notesandpapers.dpdns.org` and `www.notesandpapers.dpdns.org` (`custom_domain: true`).
  - Cache: 133 pre-rendered incremental cache entries uploaded to KV namespace `NEXT_INC_CACHE_KV`.
  - Assets: 78 static assets and chunks uploaded to Cloudflare Asset Storage.
- **Backend Production API:** [https://backend.notesandpapers.dpdns.org/health](https://backend.notesandpapers.dpdns.org/health) (HTTP 200 OK, running on Render).
- **Google Sitelinks, Favicon Strict Compliance & UNIRAJ Keywords (ADR-039):**
  - **Sitelinks Schema:** Embedded Schema.org `@graph` with `WebSite`, `Organization`, and an array of `SiteNavigationElement` entries in `src/app/layout.tsx` targeting primary courses (`UNIRAJ B.Com`, `B.Sc`, `BCA`, `B.Ed`, `B.A`, `RTU Kota B.Tech`, `RBSE`, `CBSE`).
  - **Favicon Strict Compliance:** Removed undersized `16x16` and `32x32` tags from `metadata.icons` (preventing Google rejection under Google's 48px+ favicon rule). Placed `src/app/icon.png` (192x192) and `src/app/apple-icon.png` (180x180) for native App Router static metadata serving.
  - **High-Intent Regional Keywords:** Injected `UNIRAJ`, `UOR`, `RU Jaipur`, and `RTU Kota` into `src/lib/seo.ts` (`courseMeta`), `src/app/universities/[university]/page.tsx` (`generateMetadata` & `<h1>`), and backend `app/ingest/seo_meta.py`.
  - **Footer Internal Link Equity:** Added a dedicated 5th column "Programmes" in `src/components/shared/site-footer.tsx` linking to high-traffic course pages sitewide.
- **Build & Health:** Production build (`npm run build`) and Cloudflare OpenNext deploy pass cleanly with 0 TypeScript/Turbopack errors (49/49 static and dynamic pages generated).
- **Seobility Audit & Server Configuration Hardening (ADR-038):**
  - **301 Permanent Redirects:** Enforced in `src/proxy.ts` middleware for all non-HTTPS (`http://`) and `www.*` requests to the canonical apex (`https://notesandpapers.dpdns.org`). Deployed Cloudflare custom domain trigger for `www.notesandpapers.dpdns.org` so DNS resolves to Cloudflare IPs.
  - **HSTS Preload:** Added `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` in `next.config.ts`.
  - **Zero Dynamic Parameter Internal Links:** Replaced search query links (`/search?q=...`) in home school board cards with clean static board routes (`/exams/${b.slug}`) with unique `aria-label` tags.
  - **Meta Description Budget:** Trimmed homepage meta description to 141 characters across `page.tsx` and `layout.tsx` (well under 1000px budget), and capped generic SEO helper in `seo.ts` to 150 chars.
  - **Image Alt Attributes:** Added `alt="Notes & Papers Logo"` to both site header and site footer logo `<Image>` tags, and fallback alt text for avatar images.
  - **H1 Content Echoing:** Aligned leading hero paragraph in `src/app/page.tsx` to verbatim include `previous year papers` and `turn study into success` directly below `<h1>`.
- **Paper Numbers & Sequential Badges:**
  - Added `BOARD_CLEAN_NAMES` and `cleanExamTitle` in `src/lib/exam-categories.ts` to normalize crawler names.
  - `PaperCard` and `PaperList` display explicit `Paper #{index + 1}` badges when multiple papers exist for a subject or year.
  - Total paper count and section badge counts synchronized in `exams/[slug]/page.tsx`.
- **School & State Education Boards Integration:**
  - Upgraded home page "Browse by university" into "Browse by university & school boards". Added major boards (RBSE, CBSE, UP Board, ICSE, MP Board, CG Open School) with neo-brutalist cards and filter pills (`All`, `Universities`, `School Boards`).
  - Added dedicated boards section with class/stream tags in `src/app/universities/page.tsx`.
- **UI/UX & Performance:**
  - Enforced minimum 16px font-size (`text-base` / `text-[16px]`) across all inputs, textareas, and selects sitewide to prevent mobile zoom.
  - Added slide-in `CommunityPopup` linking to Telegram (@notes_and_papers) and Instagram (@exam.notes.and.papers) with 10s auto-dismiss.
  - In-flight request deduplication map in `src/services/queries.ts` (`getJson`) preventing duplicate concurrent fetches.
  - Custom `useDebounce` hook in `src/hooks/use-debounce.ts` applied to search (450ms) and catalog (250ms).

## Known gaps / next
1. Inspect and Request Indexing for `https://notesandpapers.dpdns.org/` in Google Search Console to refresh Google's index cache.
2. Turnstile captcha integration on signup/upload/report (phase 4).
3. Connect dedicated apex domain (e.g. `notesandpapers.in` or `notesandpapers.com`) when ready for permanent brand equity.

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `component_registry.md`, `deployment.md`, `module_index.md`.


