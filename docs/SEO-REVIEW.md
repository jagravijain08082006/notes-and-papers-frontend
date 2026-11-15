# Technical SEO review — 15 November 2026

This review covers the mobile changes and representative public routes. It is not a Google index inventory, a ranking guarantee, or an editorial review of every imported paper.

## Changes

- Metadata follows the project's 60-character title and 155-character description budgets. Home and default descriptions were shortened without adding visible marketing copy. Open Graph and Twitter fields use the same metadata values.
- Paper pages emit one BreadcrumbList; the shared Breadcrumbs component supplies it. LearningResource labels now match the actual resource kind, including mock tests, answer keys and syllabuses. Language is included only when explicitly recognized; bilingual records include both languages.
- Sitemap URLs always use the configured site origin, matching canonical links rather than an incoming preview/alias hostname. Invalid page numbers and duplicate static sitemap pages return 404.
- An empty Notes hub has noindex and is excluded from the static sitemap. Empty notes sitemap pages return 404 instead of manufacturing a hub entry. Transient API errors do not by themselves set the notes hub to noindex.
- Removed an unused home-page statistics request. Added Next.js's smooth-scroll declaration to match the existing CSS.
- Paper descriptions, previews and questions remain server-rendered inside native details elements and work without JavaScript. The user-requested Universities & Boards duplicate section remains hidden only on phones; core university shortcuts and all 11 exam category controls remain accessible.

## Verification

- Full frontend `npm run check`: lint and TypeScript passed, with 12 pre-existing lint warnings and no errors. Changed-file formatting and whitespace checks passed. Backend Ruff passed.
- Mobile Chromium with JavaScript disabled checked home, universities, RBSE class 10, exam collections, a paper, a practice bank, Notes, search, login and the download step: status, one H1, canonical/robots metadata, social tags, JSON-LD, accessible FAQ answers and image responses.
- Shared metadata checks exercised length limits, canonical/social consistency, noindex, six resource kinds and explicit/unknown/bilingual language values.
- Sitemap checks parse the index and advertised feeds, confirm canonical origins and exclusion of private/download URLs, reject invalid page numbers and test a request made through the local IP alias.
- The preceding mobile interaction checks cover 320/390/430 px, all 11 category filters, search, native details, guest chat/bookmark/download login gates, fixture signed-in account and download retry, and desktop rendering. No production account/download writes were made.

Local evidence is retained in backend `data/reports/seo-review-20261115/verification.json` and `data/reports/mobile-ui-20261115/`. Temporary verification scripts are not part of the permanent source test suite.

## Remaining work

The admin Search Console API connection still needs its service-account credentials and property configuration. The user's Search Console screenshots already establish some search visibility; an unconfigured dashboard does not mean the site has no Google traffic. Nine papers were still awaiting reliable year evidence at the last live audit. Imported titles and descriptions need continued editorial review; technically valid tags do not certify their quality or content rights.

References: [Google mobile-first guidance](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing), [canonical and sitemap consistency](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), and [FAQ rich-result limitations](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
