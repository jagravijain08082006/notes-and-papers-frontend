# Known issues

- With the API down, home and `/universities/{university}` show empty states and deeper pages show the error page (500); intended (ADR-007).
- Privacy and Terms are drafts and need legal review before launch.
- The production build downloads Google Fonts (Geist), so it needs network access.
- Supabase Auth is untested locally (no project); the developer login exercises everything after the token.
- Next.js writes its own managed block into the repo-root `AGENTS.md`; project rules live in `.agents/AGENTS.md`.

## Resolved issues
- **Cloudflare OpenNext `__name is not defined` (Resolved):** In `@opennextjs/cloudflare` build, esbuild injected helper wrappers around functions in `next-themes` script evaluated in global browser context before bundle initialized. Resolved by disabling `keep_names` in `wrangler.jsonc` and adding `<script>` polyfill fallback in `src/app/layout.tsx`.
- **Mobile layout overflow in admin & search (Resolved):** Search bar dropdown positioning, sticky filters, and wide table containers across admin views now enforce strict responsive breakpoints (`overflow-x-auto`, `w-full`, and bounded popovers).
- **Mobile PaperCard viewport overflow (Resolved):** Added `overflow-x: hidden; max-width: 100vw;` to `html, body`, constrained `PaperList` and `PaperCard` with `grid-cols-1 w-full min-w-0 max-w-full`, and added `break-words` on titles.
- **Search dropdown empty state (Resolved):** Dropdown popup now completely hides when the input is empty and no recent searches are saved in `localStorage`.
- **Googlebot Host directive warning (Resolved):** Google Search Console flagged non-standard `Host:` directive in `robots.txt`. Removed from `src/app/robots.ts` so Googlebot parses directives cleanly with zero warnings.
- **Dynamic sitemap localhost:3010 leak (Resolved):** Sitemaps were resolving base URL from fallback during build. Refactored `sitemap.xml` and `/sitemaps/[type]/[file]` to dynamically derive `baseUrl` from incoming `req.url` request origin, ensuring all 4,139+ paper URLs emit canonical `https://notesandpapers.dpdns.org`.
- **Paper download action hero redesign (Resolved):** Paper download card was low-contrast and awkward. Replaced with high-impact hero section with verified vault & watermark-free badges, matched outline bookmark/report buttons, trust indicators, large CTA, and online preview link.
- **Google Search "hidden from public indexing" (Resolved):** Conditional `noindex` directives across `universities/[university]`, `exams/[slug]`, and course/term routes previously sent `noindex` when paper counts were zero or backend was cold. Replaced with unconditional `index: true, follow: true` and rich snippet directives (`max-snippet:-1, max-image-preview:large`) in `src/lib/seo.ts`.
- **Google snippet showing "DigitalPlat Domain" (Resolved):** Site name was being attributed to dynamic DNS domain host. Embedded `WebSite` JSON-LD schema into `<head>` in `src/app/layout.tsx` with explicit `name: "Notes & Papers"`, `alternateName`, `applicationName`, and `og:site_name`.
- **Missing search result favicon / generic globe (Resolved):** Google Search requires root-level and 48px-multiple icons. Added `/icon-192.png`, `/favicon.ico`, `/icon.png`, and `/apple-touch-icon.png` in `public/` and linked them in `<head>`.
- **Competitor crawler link contamination (Resolved):** Live preview and paper titles sometimes contained third-party crawler URLs (a2zsubject, uroroonline, etc.). Sanitized via `src/lib/sanitize-preview.ts`.
- **Duplicate API calls on typing/browsing (Resolved):** Added `useDebounce` hook (450ms search, 250ms catalog) and in-flight request coalescing map in `src/services/queries.ts` (`getJson`).
- **Sequential paper numbering and count badges (Resolved):** Added `Paper #{index + 1}` badges and `BOARD_CLEAN_NAMES` normalization in `src/lib/exam-categories.ts`.
- **HTTP -> HTTPS and WWW -> Non-WWW Redirects (Resolved):** Enabled 301 Permanent Redirects in `src/proxy.ts` middleware and HSTS preload headers in `next.config.ts`, ensuring non-secure or www traffic is seamlessly redirected to canonical HTTPS.
- **Internal links with dynamic query parameters (Resolved):** Replaced `/search?q=...` links in home school boards section with clean static routes (`/exams/${b.slug}`) with distinct `aria-label` tags.
- **Meta description length exceeding 1000px budget (Resolved):** Shortened homepage meta description to 141 characters across `page.tsx` and `layout.tsx`, and capped SEO helper to 150 characters.
- **Missing image alt attributes (Resolved):** Added explicit alt text to site header, site footer, and avatar components.
- **H1 keywords absent from page content (Resolved):** Updated leading hero paragraph on home page to prominently repeat "previous year papers" and "turn study into success".
- **Window scroll jumping on conversation select (Resolved):** `chatEndRef.current.scrollIntoView()` scrolled the entire browser window whenever an admin clicked a student thread. Replaced with inner container scroll: `chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight`.
- **Nested button hydration error (Resolved):** `SupportChat` rendered `<button><NoteyAvatar /></button>` where `NoteyAvatar` also returned a `<button>`. Added conditional check in `NoteyAvatar` to render semantic `<div>` when `onClick` is omitted.
- **Client CORS block on support inquiries (Resolved):** `apiFetch("/contact/my")` directly targeted Render backend from `localhost:3010`, triggering browser CORS blocks. Switched client calls to same-origin Next.js BFF proxy (`/api/backend/contact`).
- **Admin reports 422 Unprocessable Entity (Resolved):** FastAPI strictly validated `status: Literal["open", "resolved", "dismissed"]`. Querying `status=all` failed validation. Removed `status=all` from queries and handled filtering client-side.
- **Persistent black dot and duplicate messages in student chat (Resolved):** Removed hardcoded status dots from mascot button; conditioned indicator strictly on unread admin replies. Added `sanitizeMessages` to deduplicate stored tour completion alerts and added a "Clear Chat" button.


