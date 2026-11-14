# Component Registry

## ui (atoms)
- **Button / buttonVariants:** src/components/ui/button.tsx
- **Input:** src/components/ui/input.tsx
- **Field (label, `*`, inline error, hint):** src/components/ui/field.tsx
- **Textarea (500 cap + live counter):** src/components/ui/textarea.tsx
- **PasswordStrength:** src/components/ui/password-strength.tsx
- **Card / Badge / Skeleton / Spinner:** src/components/ui/{card,badge,skeleton,spinner}.tsx

## shared (molecules)
- **Providers (theme, TanStack Query, Toaster):** src/components/shared/providers.tsx
- **SiteHeader / SiteFooter / ThemeToggle / OfflineBanner:** src/components/shared/
- **CommunityPopup (Telegram/Instagram slide-in modal with 10s auto-dismiss & close):** src/components/shared/community-popup.tsx
- **SearchBar (GET form + suggestions, 450ms debounce, in-flight coalescing, shimmer, local history):** src/components/shared/search-bar.tsx
- **PaperCard / PaperList / PaperListSkeleton (`Paper #{index+1}` sequence badges, safe links):** src/components/shared/paper-card.tsx, paper-list.tsx
- **DownloadManager (countdown, auto-download, success state, embedded preview):** src/components/shared/download-manager.tsx
- **ExamsCatalogView (domain tabs: All, University, Competitive, School Board; debounced search):** src/components/shared/exams-catalog-view.tsx
- **UniversitiesSection (home section with Universities & School Boards 4-col grid & filter pills):** src/components/shared/home-sections.tsx
- **ExamsSection (dynamic home/exams showcase with active filters):** src/components/shared/exams-section.tsx
- **InteractiveCard (icon tiles for courses, terms, subjects):** src/components/shared/interactive-card.tsx
- **Pagination (link based):** src/components/shared/pagination.tsx
- **Breadcrumbs (+JSON-LD) / JsonLdScript:** src/components/shared/breadcrumbs.tsx, json-ld.tsx
- **FaqAccordion (`<details>`):** src/components/shared/faq-accordion.tsx
- **EmptyState:** src/components/shared/empty-state.tsx
- **AuthCard / LoginForm / SignupForm / ForgotPasswordForm (min 16px font inputs):** auth-card.tsx, auth-forms.tsx
- **TakedownForm:** src/components/shared/takedown-form.tsx
- **ProsePage (legal/static pages):** src/components/shared/prose-page.tsx

- **UserMenu / SignOutButton / DevLoginForm:** src/components/shared/{user-menu,sign-out-button,dev-login-form}.tsx
- **BookmarkButton / ReportDialog (supports variant, size) / PdfPreview:** src/components/shared/{bookmark-button,report-dialog,pdf-preview}.tsx
- **PaperPage (high-impact hero download card + trust badges):** src/components/shared/paper-page.tsx
- **UploadForm / ContactForm (min 16px font inputs):** src/components/shared/{upload-form,contact-form}.tsx
- **SupportChat / SupportChatTrigger (login-required account chat, session identity, live polling, interactive tour):** src/components/shared/support-chat.tsx
- **NoteyAvatar (animated mascot avatar with conditional semantic div/button rendering):** src/components/account/notey-avatar.tsx

## hooks & lib utilities
- **useDebounce (delay-based generic debounce hook):** src/hooks/use-debounce.ts
- **sanitizePreviewLink (strips third-party crawler URLs):** src/lib/sanitize-preview.ts
- **cleanExamTitle / BOARD_CLEAN_NAMES:** src/lib/exam-categories.ts
- **buildMetadata / buildGooglebotDirectives:** src/lib/seo.ts
- **getJson (in-flight request deduplication map):** src/services/queries.ts

## admin (src/components/admin)
- **SupportChatConsole (1-on-1 DB-synced helpdesk console, 1 row per unique user, live unread badges, zero-jump scroll):** support-chat-console.tsx
- **ReportReplyDialog (individual ticket reply modal with direct status resolution):** report-reply-dialog.tsx
- **AdminNav, NoPermission, DataTable (min-w-[54rem] scroll-slim), StatCard, BarChart, StatusBadge, PageHeader, SearchForm (uniform h-11), Select:** admin-nav.tsx, no-permission.tsx, data-table.tsx, ui.tsx
- **InstantSyncButton (GitHub Actions daily-sync trigger with toast):** instant-sync-button.tsx
- **AdminAction (button -> API -> toast -> refresh):** admin-action.tsx
- **ReviewEditor, SourceCard, NewSourceForm, SettingsForm, UserControls, content-editors:** matching files

## Not built yet
YearTabs, AdSlot.

- **ActivityRankings (admin top downloaded papers and search terms, counts, links, no-result hints, period/empty states):** src/components/admin/activity-rankings.tsx; shared by overview, Insights and Analytics.
