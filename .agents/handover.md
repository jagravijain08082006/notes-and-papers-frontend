# Handover (2026-10-25, third pass)

## State
- All public, user, and admin routes exist and match requirements.
- Verification passes cleanly: `npm run check` (0 errors, 0 warnings).
- Development server runs on port 3010 (`http://localhost:3010`), configured via `.env.local` to talk to local FastAPI backend (`http://localhost:8000/api/v1`).
- **Domain Taxonomy:** Catalog & papers organized across University, Competitive Exams, and School Boards via `ExamsCatalogView` and `exams-section.tsx`.
- **Download Pipeline:** Dedicated `/papers/[slug]/download` step page (`DownloadManager`) with metadata card, 3s countdown, auto-download stream, celebration notification, and embedded live PDF viewer.
- **Instant Search:** Instant dropdown with local search history (`notes_recent_searches`), 800ms debounce, and shimmer placeholder states.
- **Cloudflare OpenNext:** `wrangler.jsonc` configured with `"keep_names": false` and `<script>` polyfill added to `layout.tsx` to fix `__name is not defined` bug.
- **Canonical DMCA / Contact:** Standardized to `thecodinggiant@gmail.com`.
- **Query Cache:** `use-catalog.ts` caching tuned to 5m staleTime with refetchOnMount eliminated.

## Known gaps / next
1. Turnstile captcha integration on signup/upload/report (phase 4).
2. Privacy/Terms drafts legal review before public marketing.
3. Hindi / `hreflang` localization variant (future roadmap).

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `component_registry.md`, `module_index.md`.

