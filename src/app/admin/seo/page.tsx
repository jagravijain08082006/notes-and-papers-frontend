import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm, Select, StatCard, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import { enumParam, first, intParam } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AdminAction } from "@/components/admin/admin-action";
import type { AdminSeoOverview, AdminSeoPage as SeoPageRow } from "@/lib/api/types";
interface Pages {
  items: SeoPageRow[];
  total: number;
  page: number;
  size: number;
}
interface IssueGroup {
  issue: string;
  count: number;
  sample: string[];
}

const SORTS = ["clicks", "impressions", "position", "ctr"] as const;
const PAGE_TYPES = ["paper", "subject", "course", "term", "home", "exam", "exams", "university", "universities", "board"] as const;

export default async function SeoPage(props: PageProps<"/admin/seo">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const sort = enumParam(sp.sort, SORTS, "clicks")!;
  const order = enumParam(sp.order, ["asc", "desc"] as const, "desc")!;
  const pageType = enumParam(sp.page_type, PAGE_TYPES);
  const q = first(sp.q)?.trim().slice(0, 300);
  const issue = first(sp.issue)?.slice(0, 80);
  const indexStatus = enumParam(sp.index_status, ["indexed", "not_indexed", "unknown"] as const);
  const [ov, pages, issues] = await Promise.all([
    authedFetch<AdminSeoOverview>("/admin/seo/overview", {}, "/admin/seo"),
    authedFetch<Pages>(
      "/admin/seo/pages",
      { query: { sort, order, page_type: pageType, q, issue, index_status: indexStatus, page: intParam(sp.page), size: 50 } },
      "/admin/seo",
    ),
    authedFetch<IssueGroup[]>("/admin/seo/issues", {}, "/admin/seo"),
  ]);
  const unknown = ov.unknown ?? Math.max(0, ov.pages - ov.indexed - ov.not_indexed);
  const hasPerformance = (ov.pages_with_metrics ?? 0) > 0 || ov.search_console?.status === "ok";

  const cols: Column<SeoPageRow>[] = [
    {
      key: "url",
      header: "Page",
      className: "min-w-[280px] max-w-sm",
      cell: (p) => {
        const pathOnly = p.url.replace(/^https?:\/\/[^/]+/, "");
        return (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            title={p.url}
            className="truncate block font-mono text-xs text-link hover:underline max-w-[280px] sm:max-w-sm"
          >
            {pathOnly}
          </a>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      className: "whitespace-nowrap font-medium text-xs uppercase tracking-wider text-muted-foreground",
      cell: (p) => p.page_type ?? "-",
    },
    {
      key: "idx",
      header: "Index evidence",
      className: "whitespace-nowrap",
      cell: (p) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider border",
            p.indexed === true
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              : p.indexed === false
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                : "bg-muted text-muted-foreground border-border",
          )}
        >
          {p.indexed === null ? "Not checked" : p.indexed ? "Seen on Google" : "Not indexed"}
        </span>
      ),
    },
    {
      key: "inspect",
      header: "Google check",
      className: "whitespace-nowrap",
      cell: (p) => <AdminAction label="Check index" path="admin/seo/inspect" body={{ url: p.url }}
        disabled={!ov.search_console?.configured} success="Google indexing status checked." />,
    },
    {
      key: "clicks",
      header: "Clicks",
      sortKey: "clicks",
      className: "text-right tabular-nums whitespace-nowrap font-bold",
      cell: (p) => p.clicks?.toLocaleString("en-IN") ?? "-",
    },
    {
      key: "impr",
      header: "Impressions",
      sortKey: "impressions",
      className: "text-right tabular-nums whitespace-nowrap font-bold",
      cell: (p) => p.impressions?.toLocaleString("en-IN") ?? "-",
    },
    {
      key: "pos",
      header: "Position",
      sortKey: "position",
      className: "text-right tabular-nums whitespace-nowrap font-mono text-xs",
      cell: (p) => (p.position === null ? "-" : p.position.toFixed(1)),
    },
    {
      key: "issues",
      header: "Issues",
      className: "min-w-[220px]",
      cell: (p) =>
        p.issues.length ? (
          <div className="flex flex-wrap gap-1">
            {p.issues.map((iss) => (
              <span
                key={iss}
                className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
              >
                {iss.replace(/_/g, " ")}
              </span>
            ))}
            {p.paper_id && <Link href={`/admin/review/${p.paper_id}`} className="text-xs font-semibold text-link underline">Edit metadata</Link>}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">none</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="SEO"
        description={`Page metadata audit: ${fmtDate(ov.last_audited)}. Search Console sync: ${ov.last_synced ? fmtDate(ov.last_synced) : "not run yet"}.`}
        actions={<div className="flex flex-wrap gap-2">
          <AdminAction label="Refresh page audit" path="admin/seo/refresh" success="Page metadata audit refreshed." />
          <AdminAction label="Sync Search Console" path="admin/seo/sync" disabled={!ov.search_console?.configured} success="Search Console metrics synced." />
        </div>}
      />
      <div className="mb-5 space-y-2 border-2 border-border bg-card p-4 text-sm">
        {!ov.search_console?.configured ? (
          <>
            <p className="font-bold">Search Console data is not connected</p>
            <p className="text-muted-foreground">Set GOOGLE_SC_CREDENTIALS_JSON and GOOGLE_SC_SITE_URL on the backend and scheduled job, enable the Search Console API, and grant the service account access to the property. Then run Sync Search Console.</p>
          </>
        ) : ov.search_console.status === "error" ? (
          <p className="text-destructive">{ov.search_console.error || "Search Console sync failed. Check the property and service-account access."}</p>
        ) : ov.search_console.status !== "ok" ? (
          <p className="text-muted-foreground">Search Console is configured. Run a sync to import search performance.</p>
        ) : (
          <p className="text-muted-foreground">Search performance period: {ov.search_console.period_start} to {ov.search_console.period_end}.</p>
        )}
        <p className="text-xs text-muted-foreground">“Not checked” means indexing has not been verified. No impressions does not mean a page is not indexed; use Google Search Console URL Inspection to confirm it. A missing year is a metadata warning, not proof that Google cannot index a page.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked pages" value={ov.pages} />
        <StatCard label="Seen on Google" value={unknown === ov.pages ? "Not checked" : ov.indexed} hint={`${unknown.toLocaleString("en-IN")} not checked · ${ov.not_indexed} confirmed not indexed`} />
        <StatCard
          label="Clicks / impressions"
          value={hasPerformance ? `${(ov.clicks ?? 0).toLocaleString("en-IN")} / ${(ov.impressions ?? 0).toLocaleString("en-IN")}` : "Not available"}
        />
        <StatCard
          label="Pages with issues"
          value={ov.pages_with_issues}
          tone={ov.pages_with_issues ? "warn" : undefined}
        />
      </div>

      {issues.length > 0 && (
        <section aria-labelledby="issues-h" className="mt-8">
          <h2 id="issues-h" className="mb-4 text-2xl font-bold">
            Issues
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {issues.map((g) => (
              <li
                key={g.issue}
                className="border-2 border-border bg-card p-4 shadow-hard-sm transition-all hover:shadow-hard"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/admin/seo?issue=${encodeURIComponent(g.issue)}`} className="font-bold text-sm text-link hover:underline">
                    {g.issue.replace(/_/g, " ")}
                  </Link>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 tabular-nums">
                    {g.count.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="mt-2 break-all font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 border border-border/40">
                  e.g. {g.sample[0]?.replace(/^https?:\/\/[^/]+/, "")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="pages-h" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 id="pages-h" className="text-2xl font-bold">
            Pages
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {pages.total.toLocaleString("en-IN")} pages tracked
          </span>
        </div>
        {issue && <p className="mb-3 text-sm">Showing: {issue.replace(/_/g, " ")} · <Link href="/admin/seo" className="text-link underline">Clear filters</Link></p>}
        <SearchForm action="/admin/seo" q={q} placeholder="Filter pages by URL or path..." hidden={{ issue, sort, order }}>
          <Select
            name="page_type"
            label="Page type"
            value={pageType}
            options={[
              { value: "", label: "All types" },
              ...PAGE_TYPES.map((t) => ({
                value: t,
                label: t,
              })),
            ]}
          />
          <Select name="index_status" label="Index evidence" value={indexStatus} options={[
            { value: "", label: "All index states" }, { value: "unknown", label: "Not checked" },
            { value: "indexed", label: "Seen on Google" }, { value: "not_indexed", label: "Not indexed" },
          ]} />
        </SearchForm>
        <DataTable
          caption="Pages by search performance"
          columns={cols}
          rows={pages.items}
          rowKey={(p) => p.url}
          basePath="/admin/seo"
          params={{ page_type: pageType, q, issue, index_status: indexStatus }}
          sort={sort}
          order={order}
          total={pages.total}
          page={pages.page}
          size={pages.size}
          emptyTitle="No page data yet"
          emptyDescription="Run the daily workflow (seo-sync) to fill this in."
        />
      </section>
    </>
  );
}

