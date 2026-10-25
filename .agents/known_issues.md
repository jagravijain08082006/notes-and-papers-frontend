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
- **Exam year papers cards redesign (Resolved):** Replaced cramped single-container table rows on `/exams/[slug]` with spacious, prominent individual neo-brutalist cards with generous spacing, prominent tags, and hover lift.


