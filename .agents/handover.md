# Handover (2026-11-12, ninth pass)

## SEO review and publishing (2026-11-15)

- User requests SEO review and pushing all changes, and explicitly chooses to keep the outer workspace local. Push only the nested backend/frontend application repositories; the wrapper origin incorrectly points at the frontend repository and must not be pushed over app main.
- Fixed metadata budgets (60/155), concise home/default descriptions, duplicate paper breadcrumb JSON-LD, resource-kind/language structured data, canonical sitemap origins, invalid sitemap page handling, and empty Notes hub noindex/sitemap exclusion. Removed unused home statistics fetch. Details and limitations: `docs/SEO-REVIEW.md`.
- Keep latest mobile preference: hide only Universities & Boards on phones, retain all exam categories. Full frontend check passes with 12 existing warnings / zero errors. Mobile no-JS SEO/schema/sitemap verification evidence is in backend `data/reports/seo-review-20261115/`; prior interaction evidence remains in `mobile-ui-20261115/`. Publishing follows verification; production deployment uses Vercel, not Cloudflare.

## Mobile public/user interface (2026-11-15)

- User requests a clean, simple mobile interface with minimal extra copy. **Latest clarification:** hide the screenshot's duplicate Universities & Boards section on phones only; retain it from `sm` up. Keep ExamsSection and all 11 EXAM_DOMAINS filters visible on mobile. The primary RTU/UNIRAJ/RBSE/Notes shortcuts remain visible. Compact two-column cards replace the tall one-column layout; do not remove exam categories when simplifying the screen.
- Mobile search uses a single-row labelled input/button; latest papers show four previews with View all. Menu labels/touch targets and footer links are simpler. Promotional and profile-nudge timers skip phone widths. Support remains login-gated with a small chat icon.
- Paper download action is above expandable details on mobile; About, preview and questions use native details. Search filters and avatar selection are expandable. Account cards are compact. Download errors have visible retry; success copy is brief and the embedded PDF stays closed until requested (`PdfPreview.autoOpenBlob=false`). Canonical share URLs use paperHref.
- Changed-file ESLint, Prettier and TypeScript passed. Headless Chromium checks at 320/390/430 px covered category visibility, menu, no horizontal overflow, search/filter use, guest download/chat login gates, fixture signed-in account/menu, download failure/retry/success and desktop layout. Account/download fixtures were isolated locally; no production writes. Screenshots and verification report: backend `data/reports/mobile-ui-20261115/`. Source changes are local, uncommitted and undeployed. Preserve earlier workspace-cleanup handover notes.
- Final browser run exercised all 11 category filters at each phone width, plus guest bookmark login. It passed with zero uncaught errors and zero unexpected console errors. A discovered BookmarkButton hydration mismatch (cached account query resolving between SSR and hydration) was fixed using the established useSyncExternalStore mounted snapshot pattern for disabled/saved state. Temporary fixture script and failed-run screenshots removed after verification; normal local preview uses the unchanged `.env.local`.
- Latest screenshot-specific change verified separately at 320/390/430/1280 px: Universities & Boards hidden only below `sm`; Exam categories and all 11 controls visible at every width; no horizontal overflow. Evidence: `visibility-verification.json` and updated `home-after.png` in the report folder. Normal preview is running at localhost:3010. No changes pushed/deployed in this mobile-edit task.

## Workspace cleanup (2026-11-15)

- Removed regenerable `.next`, `.open-next` and local `.wrangler` output while no Node/Python processes were running. Application source, public assets, node_modules, env files, `.vercel` deployment link and Cloudflare configuration were preserved. The next local build/typecheck recreates the generated output it needs; production is unaffected.
- Also removed old workspace debug logs/scratch experiments and Python bytecode: 10,484 generated files / 778.57 MiB overall. Maintenance wrappers now live in workspace `scripts/`; useful data/reports were retained. Local manifest: backend `data/reports/workspace-cleanup-20261115.json`. No application code or deployment was changed.

## Deployment target correction (2026-11-14)

- Backend fixes pushed as `1f28bdf` and verified live: health ready 200, admin overview 200 with rankings, SEO nine warnings, anonymous chat 401.
- Frontend fixes pushed as `3df47c8`. Production is Vercel, not the historical Cloudflare deployment. Use `npm.cmd run vercel:deploy`; `.vercel/project.json` is linked and the script exports committed source without Git history to avoid Hobby-plan author restrictions. The temporary export cleanup now verifies its absolute path.
- Cloudflare production build passed and Workers uploaded, but custom-domain trigger update failed with 100117. Cloudflare has no domain/zone routes for this site. No production DNS records were changed. Production deployment was completed via Vercel. See `.agents/deployment.md`.
- **Verified live:** Vercel deployment `dpl_6zwt2DzLozuLjbHkU94NuMTx7651` serves source commit `5c48de6` at `https://notesandpapers.dpdns.org`. Authenticated admin and SEO pages return 200 with new rankings, setup notice, Check index and Not checked controls; sampled JS/CSS assets return 200. Anonymous admin redirects to login and chat proxy returns 401. Backend ready/overview/SEO checks also pass. This supersedes older pending-deployment notes below.
- Temporary Vercel export cleanup hit a Windows EPERM after the successful READY/alias response. The verified export was removed and cleanup now retries transient locks. User environment files are restored. Reports are in backend `data/reports/deployment-20261114/`. Verification used live HTTP/SSR checks, not a full browser interaction test. Search Console is still unconfigured; nine undated papers remain flagged.

## SEO warnings and unavailable Search Console data (2026-11-14)
- Applied 73 verified live metadata corrections: 70 missing years and 3 explicit sample-paper reclassifications. Live audit warnings fell from 91 to 18; all changes have `paper.metadata_repair` audit records. Applied/verified reports are in backend `data/reports/metadata-repair-applied-20261114T163748Z.json` and `seo-repair-verification-20261114.json`.
- Remaining 18 records are genuinely undated in the checked evidence (8 Army, 6 JEE LMN/RST, 3 Drug Inspector, 1 RTU). They remain visible for review; no years were fabricated. Evidence/procedure: backend `docs/SEO-REPAIR.md`.
- New shared recovery rules handle verified AIBE edition years, valid packed dates and explicit sample papers in both the importer and repeat-safe CLI `repair-metadata [--apply]`. Existing years, public slugs/statuses and custom metadata are preserved by the repair.
- SEO dashboard now distinguishes unavailable metrics from zeros, labels unverified indexing as `Not checked`, separates audit/sync timestamps, shows Search Console setup/sync status and offers admin audit/sync actions. URL search, issue links, index-state filters and per-paper metadata edit links work. Contract types are `AdminSeoOverview` and `AdminSeoPage`.
- Backend stores separate audit and Search Console states in settings; failed Google syncs preserve metrics and return nonzero CLI status. Successful reporting windows clear stale performance metrics without inventing negative indexing status.
- Checks passed: isolated PostgreSQL repair/idempotence/permissions/filters/sync-state scenarios, frontend rendered states, backend Ruff, changed-file frontend lint and TypeScript. Google API responses in tests were fixtures. Temporary database stopped/removed.
- Live data repairs are complete. Backend/frontend code still needs deployment. Local Search Console credentials and property are absent; actual indexing/performance cannot be verified until a valid property/service-account connection is configured. Original data had no Search Console metrics.

## Most-downloaded papers and most-searched terms (2026-11-14)
- Overview now shows top 10 papers/terms with 7/30/90-day filters. Insights and Analytics reuse `ActivityRankings` for top 15, count labels, canonical paper/search links, no-result counts and empty states.
- Backend `app/services/insights.py` is the shared ranking implementation. Downloads use server `events.download_success` records rather than the obsolete `downloads` table or combined view/click counts. Search terms use `search_logs`, normalize case/whitespace, and omit blank/filter-only terms. Analytics search totals/daily charts use the same search log source.
- `/admin/overview` now includes optional `top_downloads`/`top_searches` arrays in the frontend contract. Existing insight routes keep their core fields and add supporting metadata. Browser `/events` no longer accepts `download_success` (only the download handler records it).
- Isolated PostgreSQL integration checks passed for ranking, date boundaries, normalization, no-result counts, limits, empty data, admin permissions, endpoint responses, analytics consistency and rejection of forged download-success events. Panel render checks, backend Ruff, changed-file frontend lint, and frontend TypeScript passed. No browser/deployment verification performed.
- Deploy backend before frontend. Temporary test database was stopped and removed; project/production data was untouched. See backend `docs/API.md` activity rankings section.

## Account-only support chat (2026-11-14)
- Chat now requires login in both widget and API, including `/contact` and `/contact/my` compatibility routes. Ownership uses the unique `user:<account UUID>` key; name/email come from authentication. Browser guest IDs and submitted emails cannot select conversations.
- Legacy guest/email conversations remain staff-only; no automatic ownership migration. No database migration is required. Backend details and verification: `../notes-and-papers-backend-repo/docs/CHAT.md`.
- Widget gates the composer, resumes on the original route after login, clears private state when accounts change, handles expired sessions, and protects sends from stale polling responses. Contact form also requires login. Admin console guards duplicate sends/stale polling, clears draft when selecting another conversation, and caps replies at 2,000 characters.
- Verification passed: isolated PostgreSQL HTTP flow tests (real JWT verification, fixture account cache), ownership/role checks, contact compatibility, unread counts, 10 simultaneous first sends, 5 simultaneous replies, validation and audited deletion. Rendered widget login/loading/account checks, backend Ruff, changed-file frontend lint and TypeScript pass. No real-browser test was run.
- Both backend and frontend changes need deployment. No production data was changed; temporary local PostgreSQL was stopped.

## Admin overview crash fix (2026-11-14)
- Reproduced `/admin/overview` raising `AttributeError: type object 'ChatConversation' has no attribute 'status'`. One-to-one chat has no ticket status in either the ORM or migration 0008.
- Backend `app/routers/admin.py` now counts all conversations for the existing `chats_open` KPI; unread conversations remain a separate count. Frontend overview hint now says "conversations".
- In-memory regression verified overview responses for 7/30/90 days, separate total/unread counts, and empty charts. Backend Ruff and frontend typecheck pass; frontend lint has no errors and 12 existing warnings. No database writes, migrations, or deployment performed.
- Deploy the backend fix to repair the live dashboard; the frontend text change is cosmetic. React production error 441 masks a Server Component exception; the supplied browser digest has not been matched to live server logs.

## State
- **Live Production Deployments:**
  - **Vercel Production Deployment:** [https://notes-and-papers-frontend-5ywo31agi-the-coding-giants-projects.vercel.app](https://notes-and-papers-frontend-5ywo31agi-the-coding-giants-projects.vercel.app) (HTTP 200 OK).
  - **Custom Domain:** [https://notesandpapers.dpdns.org](https://notesandpapers.dpdns.org) (Cloudflare edge, HTTP 200 OK).
- **Backend Production API:** [https://backend.notesandpapers.dpdns.org/health](https://backend.notesandpapers.dpdns.org/health) / Render [https://notes-and-papers-backend.onrender.com/healthz](https://notes-and-papers-backend.onrender.com/healthz) (HTTP 200 OK, Alembic `0008`).
- **True 1-on-1 Live Support Chat Without Ticket Clutter (ADR-044):**
  - **Clean Guest Chat Widget (`src/components/shared/support-chat.tsx`):**
    - Removed all ticket UI (`Ticket #...`, `Open`, `Resolved`), automated bot `"Got it!"` messages, and spammy tour completion alerts.
    - Persistent browser `guest_id` (`np_chat_guest_id_v1`) + optional name/email field lets anonymous guests chat immediately without form walls, while keeping 100% continuity into 1 conversation per user/email.
    - Real-time DB polling via BFF `/api/backend/chat`: every 5s when open; every 25s when closed (only if user has chatted) for unread badge dot (`unread_by_guest > 0`). Zero permanent dot.
    - Preserves exported `SupportChatTrigger` for `/contact` page launchers.
  - **Clean Admin 1-on-1 Helpdesk Console (`src/components/admin/support-chat-console.tsx`):**
    - Backed by `/api/backend/admin/chats*`: shows exactly **ONE row per user/guest** ordered by most recent message. Repeat messages never generate duplicate chats.
    - Live unread count badges (`unread_by_admin`) on individual conversations and in sidebar `AdminNav` (`/api/backend/admin/chats/unread` every 15s + instant `np:admin-chat-updated` event).
    - Inner container auto-scroll (`scrollTop = scrollHeight`) prevents browser window jumping.
    - Clean `"Support Chat"` / `"Paper Reports"` view switcher in `/admin/reports` (`src/app/admin/reports/page.tsx`).
- **BFF & API Cleanliness:** Added `"chat"` to `ALLOWED` in `src/lib/bff.ts`; switched `ContactForm` (`src/components/shared/contact-form.tsx`) to use same-origin BFF proxy.
- **Academic Hub 4-Card Hierarchy (ADR-042):** Standardized homepage cards: RTU -> UNIRAJ -> School Boards Hub -> Other Exams.
- **Build & Health:** `npm run check` (`eslint` + `next typegen && tsc --noEmit`) passes with 0 errors.

## Known gaps / next
1. Inspect and Request Indexing for top university/board hub URLs in Google Search Console to accelerate crawl queue processing.
2. Turnstile captcha integration on signup/upload/report (phase 4).
3. Connect dedicated custom apex domain (e.g. `notesandpapers.in` or `notesandpapers.com`) when ready for permanent brand equity.

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `component_registry.md`, `deployment.md`, `module_index.md`.


## 2026-11-14 SEO follow-up (current state)

- Live missing-year warnings now **9** (eight Army/one RTU), down from 91, following 82 audited corrections. Latest nine: six verified JEE dates and three practice-bank classifications. Evidence/remaining records in backend `docs/SEO-REPAIR.md` and `data/reports/remaining-seo-20261114/applied-verification.json`.
- User confirmed no Search Console setup. Backend live check and GitHub secret names confirm unset. All 14,859 index states remain unverified. No Google calls tested live.
- SEO table now reuses AdminAction for per-row Check index; backend admin-only `/seo/inspect` checks known tracked URLs and preserves prior evidence on Google failure/unknown verdicts. Disabled until configured. Shared `AdminSeoInspectResult` documents success shape. Backend deploy before frontend; all code/UI changes remain uncommitted/undeployed.
- Isolated PostgreSQL/API checks passed; Ruff, frontend changed-file lint and TypeScript passed. Previous admin crash/chat login/ranking changes remain pending deployment. See backend handover for run reports.

