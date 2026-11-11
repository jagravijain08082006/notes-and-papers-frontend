# Handover (2026-11-11, eighth pass)

## State
- **Live Production Deployments:**
  - **Vercel Production Deployment:** [https://notes-and-papers-frontend-5ywo31agi-the-coding-giants-projects.vercel.app](https://notes-and-papers-frontend-5ywo31agi-the-coding-giants-projects.vercel.app) (HTTP 200 OK, Git Commit `feebbc9`).
  - **Custom Domain:** [https://notesandpapers.dpdns.org](https://notesandpapers.dpdns.org) (Cloudflare edge, HTTP 200 OK).
- **Backend Production API:** [https://backend.notesandpapers.dpdns.org/health](https://backend.notesandpapers.dpdns.org/health) / Render [https://notes-and-papers-backend.onrender.com/healthz](https://notes-and-papers-backend.onrender.com/healthz) (HTTP 200 OK, Git Commit `2fa97f5`).
- **Support Chat Console & Helpdesk Hub (ADR-041):**
  - **Two-Pane Admin Helpdesk (`SupportChatConsole`):** Replaced legacy reports table with dedicated two-pane conversation console in `/admin/reports` (`src/components/admin/support-chat-console.tsx`). Features live search across students/queries, unread message indicators, and quick status toggle (`Resolve` / `Reopen`).
  - **Window Scroll Jumping Eliminated:** Replaced whole-window `scrollIntoView()` with inner-container scrolling `chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight`, preventing page jumps when clicking conversations.
  - **Individual Student Thread Isolation:** Groups messages strictly by student email/ticket ID so conversations never cross-contaminate.
  - **Real-Time Notification Badges:** Integrated a 30s polling cycle in `src/components/admin/admin-nav.tsx` displaying a live red pulsing count badge for open queries. Unopened conversations in `SupportChatConsole` display a glowing dot and bold header, automatically marking as seen upon selection.
- **Guest Support Chat Companion (`SupportChat` - ADR-041):**
  - **Clean Status Badging:** Removed permanent black status dots from mascot button and header; notification dot renders strictly when an unread admin response arrives.
  - **Message Deduplication & Reset:** Sanitizes stored messages on mount via `sanitizeMessages`, prevents repeated "Tour completed!" appends, and provides a one-click "Clear Chat" history action (`Trash2`).
  - **Hydration Fix:** Refactored `NoteyAvatar` (`src/components/account/notey-avatar.tsx`) to render semantic `<div>` when `onClick` is absent, permanently resolving the HTML `<button>` inside `<button>` hydration error.
- **BFF Same-Origin Proxying for Client APIs (ADR-043):**
  - Routed all client support actions (`POST /contact`, `GET /contact/my`) through same-origin Next.js BFF proxy (`/api/backend/contact`). Next.js performs server-to-server dispatch to FastAPI, completely bypassing cross-origin CORS limitations on Render.
  - Fixed FastAPI 422 enum validation by eliminating `status=all` from report fetch queries.
- **Academic Hub 4-Card Hierarchy (ADR-042):**
  - Standardized "All (Universities & Boards)" section cards on homepage (`src/components/shared/home-sections.tsx`) into exact sequence:
    1. **Rajasthan Technical University (RTU)**
    2. **Rajasthan University (UNIRAJ)**
    3. **School Boards Hub** (RBSE, CBSE, UP Board, ICSE, MP Board, All School Boards)
    4. **Other Exams** (Competitive exams: SSC, SBI Clerk, UPSC, GATE, NEET)
  - Applied distinctive visual styling: `School` icon for boards, `Award` icon for competitive exams.
- **Build & Health:** Production build (`npm run check`) passes with 0 TypeScript and 0 ESLint errors.

## Known gaps / next
1. Inspect and Request Indexing for top university/board hub URLs in Google Search Console to accelerate crawl queue processing.
2. Turnstile captcha integration on signup/upload/report (phase 4).
3. Connect dedicated custom apex domain (e.g. `notesandpapers.in` or `notesandpapers.com`) when ready for permanent brand equity.

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `component_registry.md`, `deployment.md`, `module_index.md`.


