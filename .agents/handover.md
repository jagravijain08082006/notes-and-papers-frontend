# Handover (2026-11-12, ninth pass)

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


