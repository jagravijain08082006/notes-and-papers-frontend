import { DataTable, type Column } from "@/components/admin/data-table";
import { InstantSyncButton } from "@/components/admin/instant-sync-button";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm, Select, StatCard, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import { enumParam, first, intParam } from "@/lib/search-params";
import { cn } from "@/lib/utils";

interface SeoOverview {
  pages: number;
  indexed: number;
  not_indexed: number;
  clicks: number;
  impressions: number;
  pages_with_issues: number;
  last_synced: string | null;
}
interface SeoPageRow {
  url: string;
  page_type: string | null;
  indexed: boolean | null;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  issues: string[];
}
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

export default async function SeoPage(props: PageProps<"/admin/seo">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const sort = enumParam(sp.sort, SORTS, "clicks")!;
  const order = enumParam(sp.order, ["asc", "desc"] as const, "desc")!;
  const pageType = enumParam(sp.page_type, ["paper", "subject", "course", "term", "home"] as const);
  const [ov, pages, issues] = await Promise.all([
    authedFetch<SeoOverview>("/admin/seo/overview", {}, "/admin/seo"),
    authedFetch<Pages>(
      "/admin/seo/pages",
      { query: { sort, order, page_type: pageType, page: intParam(sp.page), size: 50 } },
      "/admin/seo",
    ),
    authedFetch<IssueGroup[]>("/admin/seo/issues", {}, "/admin/seo"),
  ]);
  void first;

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
      header: "Indexed",
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
          {p.indexed === null ? "unknown" : p.indexed ? "yes" : "no"}
        </span>
      ),
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
        description={`Search Console data (28 days) plus problems found in our own pages. Last synced ${fmtDate(ov.last_synced)}.`}
        actions={<InstantSyncButton />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked pages" value={ov.pages} />
        <StatCard label="Indexed" value={ov.indexed} hint={`${ov.not_indexed} not indexed`} />
        <StatCard
          label="Clicks / impressions"
          value={`${ov.clicks.toLocaleString("en-IN")} / ${ov.impressions.toLocaleString("en-IN")}`}
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
                  <p className="font-bold text-sm text-foreground">
                    {g.issue.replace(/_/g, " ")}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 tabular-nums">
                    {g.count.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="mt-2 truncate font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 border border-border/40">
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
        <SearchForm action="/admin/seo" placeholder="Filter pages by URL or path...">
          <Select
            name="page_type"
            label="Page type"
            value={pageType}
            options={[
              { value: "", label: "All types" },
              ...["paper", "subject", "course", "term", "home"].map((t) => ({
                value: t,
                label: t,
              })),
            ]}
          />
        </SearchForm>
        <DataTable
          caption="Pages by search performance"
          columns={cols}
          rows={pages.items}
          rowKey={(p) => p.url}
          basePath="/admin/seo"
          params={{ page_type: pageType }}
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

