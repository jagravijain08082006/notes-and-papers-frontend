# Handover (2026-10-25, fifth pass)

## State
- **Live Production Deployment:** Deployed to Cloudflare Workers on custom domain [https://notesandpapers.dpdns.org](https://notesandpapers.dpdns.org).
  - Version ID: `6b2ad4ad-bb12-41b7-85b6-337b6a3a2325`.
  - Cache: 133 pre-rendered incremental cache entries uploaded to KV namespace `NEXT_INC_CACHE_KV`.
  - Assets: 78 static assets and chunks uploaded to Cloudflare Asset Storage.
- **Backend Production API:** [https://backend.notesandpapers.dpdns.org/health](https://backend.notesandpapers.dpdns.org/health) (HTTP 200 OK, running on Render).
- **Build & Health:** Production build (`npm run build`) and Cloudflare OpenNext deploy (`npm run cf:deploy`) pass cleanly with 0 TypeScript/Turbopack errors (47/47 static and dynamic pages generated).
- **Paper Numbers & Sequential Badges:**
  - Added `BOARD_CLEAN_NAMES` and `cleanExamTitle` in `src/lib/exam-categories.ts` to normalize crawler names (e.g., `rajasthan-4th-grade` -> "Rajasthan 4th Grade", `uni-rajasthanboard` -> "RBSE Board (Rajasthan BSER)").
  - `PaperCard` and `PaperList` display explicit `Paper #{index + 1}` badges when multiple papers exist for a subject or year.
  - Total paper count and section badge counts synchronized in `exams/[slug]/page.tsx`.
- **School & State Education Boards Integration:**
  - Upgraded home page "Browse by university" into "Browse by university & school boards". Added major boards (RBSE, CBSE, UP Board, ICSE, MP Board, CG Open School) with neo-brutalist cards and filter pills (`All`, `Universities`, `School Boards`).
  - Added dedicated boards section with class/stream tags in `src/app/universities/page.tsx`.
- **UI/UX & Icon Audit:**
  - Lucide icons added across all 11 educational categories and pages (`interactive-card.tsx`, `exams-catalog-view.tsx`, `universities/[university]/page.tsx`, `notes/page.tsx`).
  - Enforced minimum 16px font-size (`text-base` / `text-[16px]`) across all inputs, textareas, and selects sitewide to prevent mobile zoom.
  - Default light theme with dark mode toggle persistence via `next-themes` and `localStorage`.
  - Added slide-in `CommunityPopup` linking to Telegram (@notes_and_papers) and Instagram (@exam.notes.and.papers) with 10s auto-dismiss and close button.
  - Link scrubbing in `src/lib/sanitize-preview.ts` removing competitor crawler domains.
- **Performance & Debouncing:**
  - Custom `useDebounce` hook in `src/hooks/use-debounce.ts` applied to global search (450ms) and catalog search (250ms) with shimmer skeletons.
  - In-flight request deduplication map in `src/services/queries.ts` (`getJson`) preventing duplicate concurrent fetches.
  - QueryClient tuned: `staleTime: 5m`, `gcTime: 15m`, `refetchOnWindowFocus: false`.
- **Google Search & SEO Resolution:**
  - Removed conditional `noindex` across dynamic routes that previously triggered "hidden from public indexing" flags. Enabled Googlebot rich snippets (`max-snippet:-1, max-image-preview:large`) in `src/lib/seo.ts`.
  - Solved "DigitalPlat Domain" snippet issue by embedding `WebSite` JSON-LD schema into `<head>` with explicit `name: "Notes & Papers"`, `alternateName`, and `og:site_name`.
  - Added root-level 192x192 PNG (`/icon-192.png`), `/favicon.ico`, `/icon.png`, and `/apple-touch-icon.png` in `public/` and linked them in `<head>` to fix Google Search globe icon.

## Known gaps / next
1. Inspect and Request Indexing for `https://notesandpapers.dpdns.org/` in Google Search Console to refresh Google's index cache.
2. Turnstile captcha integration on signup/upload/report (phase 4).
3. Connect dedicated apex domain (e.g. `notesandpapers.in` or `notesandpapers.com`) when ready for permanent brand equity.

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `component_registry.md`, `deployment.md`, `module_index.md`.


