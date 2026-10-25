import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { InstantSyncButton } from "@/components/admin/instant-sync-button";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm, Select, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminRun, Paginated } from "@/lib/api/types";
import { enumParam, first, intParam } from "@/lib/search-params";

const STATUSES = ["queued", "running", "succeeded", "partial", "failed", "cancelled"] as const;
const UUID = /^[0-9a-f-]{36}$/i;

export default async function RunsPage(props: PageProps<"/admin/runs">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const status = enumParam(sp.status, STATUSES);
  const sourceId =
    first(sp.source_id) && UUID.test(first(sp.source_id)!) ? first(sp.source_id) : undefined;
  const data = await authedFetch<Paginated<AdminRun>>(
    "/admin/runs",
    { query: { page: intParam(sp.page), size: 20, status, source_id: sourceId } },
    "/admin/runs",
  );

  const columns: Column<AdminRun>[] = [
    {
      key: "src",
      header: "Source",
      cell: (r) => (
        <Link href={`/admin/runs/${r.id}`} className="font-medium text-link hover:underline">
          {r.source_name ?? r.source_id}
        </Link>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "trig", header: "Trigger", cell: (r) => r.trigger },
    { key: "found", header: "Found", cell: (r) => r.pages_crawled },
    { key: "new", header: "New", cell: (r) => r.new_count },
    { key: "chg", header: "Changed", cell: (r) => r.changed_count },
    { key: "miss", header: "Missing", cell: (r) => r.removed_count },
    { key: "fail", header: "Failed", cell: (r) => r.failed_count },
    {
      key: "dur",
      header: "Duration",
      cell: (r) => (r.duration_seconds === null ? "-" : `${Math.round(r.duration_seconds)}s`),
    },
    { key: "when", header: "Started", cell: (r) => fmtDate(r.started_at ?? r.created_at) },
  ];

  return (
    <>
      <PageHeader
        title="Crawl runs"
        description="Live history of crawler pipeline runs, scraping logs, and indexing status."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <InstantSyncButton label="Instant Crawl & Sync" />
            <Link
              href="/admin/imports"
              className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-hard-sm hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              Data Imports Hub →
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Crawl Target" value="3 Sites" hint="uoronline, rtuonline, pyqonline" />
        <StatCard label="Pipeline Schedule" value="Nightly" hint="02:00 UTC via GitHub Actions" />
        <StatCard label="Catalog Size" value="12,250+" hint="Previous year question papers" />
        <StatCard label="Status" value="Active" hint="Automated scrape & metadata index" />
      </div>

      <SearchForm action="/admin/runs" placeholder="Filter runs by status or source..." hidden={{ source_id: sourceId }}>
        <Select
          name="status"
          label="Status"
          value={status}
          options={[
            { value: "", label: "Any status" },
            ...STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </SearchForm>
      <DataTable
        caption="Crawl runs"
        columns={columns}
        rows={data.items}
        rowKey={(r) => r.id}
        basePath="/admin/runs"
        params={{ status, source_id: sourceId }}
        total={data.total}
        page={data.page}
        emptyTitle="No recent crawl logs in current filter"
        emptyDescription="Crawls run automatically every night at 02:00 UTC via GitHub Actions. Click 'Instant Crawl & Sync' above to trigger an immediate scrape across all sources."
      />
    </>
  );
}
