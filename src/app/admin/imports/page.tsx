import { AdminAction } from "@/components/admin/admin-action";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { InstantSyncButton } from "@/components/admin/instant-sync-button";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";

interface SiteResult {
  imported?: Record<string, number>;
  scraped?: { resources?: number; problems?: number };
}
interface Job {
  id: string;
  status: string;
  payload: { site?: string; refresh?: boolean; result?: Record<string, SiteResult> };
  error: string | null;
  created_at: string;
  started_at: string | null;
}
interface Imports {
  papers_by_source: Record<string, number>;
  jobs: Job[];
}
interface SyncJob {
  id: string;
  status: string;
  created_at: string;
  error: string | null;
  result: {
    new_papers?: number;
    seconds?: number;
    problems?: string[];
    sites?: Record<string, { scraped?: number; skipped?: string; error?: string }>;
    branding?: { branded?: number; failed?: number };
  } | null;
}
interface Branding {
  total: number;
  branded: number;
  failed: number;
  pending: number;
  jobs: {
    id: string;
    status: string;
    created_at: string;
    error: string | null;
    payload: {
      limit?: number | null;
      site?: string | null;
      result?: { branded?: number; failed?: number; seconds?: number };
    };
  }[];
}

export default async function ImportsPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const [data, brand, sync] = await Promise.all([
    authedFetch<Imports>("/admin/imports", {}, "/admin/imports"),
    authedFetch<Branding>("/admin/branding", {}, "/admin/imports"),
    authedFetch<{ jobs: SyncJob[] }>("/admin/sync", {}, "/admin/imports"),
  ]);
  const running =
    data.jobs.some((j) => j.status === "queued" || j.status === "running") ||
    brand.jobs.some((j) => j.status === "queued" || j.status === "running") ||
    sync.jobs.some((j) => j.status === "queued" || j.status === "running");

  return (
    <>
      <AutoRefresh active={running} />
      <PageHeader
        title="Data imports"
        description="Scrape the uoronline.com, rtuonline.com and pyqonline.com listing pages and load them into the database. PDFs are linked, never copied."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminAction
              label="Import everything"
              path="/admin/imports"
              body={{ site: "all" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="uoronline only"
              path="/admin/imports"
              body={{ site: "uoronline" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="rtuonline only"
              path="/admin/imports"
              body={{ site: "rtuonline" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="pyqonline only"
              path="/admin/imports"
              body={{ site: "pyqonline" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="Re-fetch pages"
              path="/admin/imports"
              body={{ site: "all", refresh: true }}
              success="Import started"
              disabled={running}
              confirm="Ignore the page cache and fetch every listing page again?"
            />
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(data.papers_by_source).map(([k, v]) => (
          <StatCard key={k} label={`Papers from ${k}`} value={v} />
        ))}
      </div>

      <section className="mt-10 space-y-5" aria-labelledby="sync-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 id="sync-h" className="text-2xl">
              Daily sync
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              The nightly job: scrape all three sites, import new papers, flag removed ones, fill
              search metadata, brand a batch of PDFs and tell the website and search engines. It
              also runs by itself from GitHub Actions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InstantSyncButton label="Instant Sync (GitHub Actions)" inProgress={running} />
            <AdminAction
              label="Run local sync"
              path="/admin/sync"
              body={{ site: "all", brand_limit: 300 }}
              success="Local sync started"
              disabled={running}
              confirm="Run the full sync now locally? It can take a while."
            />
          </div>
        </div>
        {sync.jobs.length > 0 ? (
          <ul className="divide-y border-2 border-border bg-card text-sm">
            {sync.jobs.map((j) => (
              <li key={j.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={j.status} />
                  <span className="text-muted-foreground">{fmtDate(j.created_at)}</span>
                  {j.result && (
                    <span>
                      {j.result.new_papers ?? 0} new papers, {j.result.branding?.branded ?? 0}{" "}
                      branded
                      {j.result.seconds ? ` in ${Math.round(j.result.seconds)}s` : ""}
                    </span>
                  )}
                </div>
                {(j.result?.problems ?? []).map((p) => (
                  <p key={p} className="text-destructive">
                    {p}
                  </p>
                ))}
                {j.error && !j.result?.problems?.length && (
                  <p className="text-destructive">{j.error}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-2 border-border bg-card p-4 shadow-hard-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 border border-border bg-success/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success">
                ● Cron Pipeline Ready
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Nightly at 02:00 UTC (GitHub Actions)
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Automated scraper sync is scheduled on GitHub Actions. Press <strong>Instant Sync</strong> or <strong>Run local sync</strong> above to trigger an immediate scrape.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-5" aria-labelledby="brand-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 id="brand-h" className="text-2xl">
              PDF branding
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Downloads each source PDF, replaces the watermark, adds the front and back cover
              pages, stores the file and backs it up. Papers that are done are served from our own
              storage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminAction
              label="Brand next 200"
              path="/admin/branding"
              body={{ limit: 200 }}
              success="Branding started"
              disabled={running}
            />
            <AdminAction
              label="Brand all remaining"
              path="/admin/branding"
              body={{ limit: 20000 }}
              success="Branding started"
              disabled={running}
              confirm="Download and brand every remaining paper? This can take a long time."
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Published papers" value={brand.total} />
          <StatCard label="Branded and stored" value={brand.branded} />
          <StatCard label="Waiting" value={brand.pending} />
          <StatCard
            label="Failed (see reason on the paper)"
            value={brand.failed}
            tone={brand.failed ? "warn" : undefined}
          />
        </div>
        {brand.jobs.length > 0 ? (
          <ul className="divide-y border-2 border-border bg-card text-sm">
            {brand.jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center gap-3 p-3">
                <StatusBadge status={j.status} />
                <span className="text-muted-foreground">{fmtDate(j.created_at)}</span>
                {j.payload.result && (
                  <span>
                    {j.payload.result.branded ?? 0} branded, {j.payload.result.failed ?? 0} failed
                    {j.payload.result.seconds ? ` in ${Math.round(j.payload.result.seconds)}s` : ""}
                  </span>
                )}
                {j.error && <span className="text-destructive">{j.error}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-2 border-border bg-card p-4 shadow-hard-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 border border-border bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                Branding Storage: {brand.branded.toLocaleString("en-IN")} / {brand.total.toLocaleString("en-IN")} Papers Done
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {brand.pending} Waiting
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              All branded PDFs are saved with front &amp; back cover pages and served directly from high-speed storage.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className=" mb-4 text-2xl">Recent jobs</h2>
        {data.jobs.length === 0 ? (
          <div className="border-2 border-border bg-card p-4 shadow-hard-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              All 3 Sources Active &amp; Indexed
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              uoronline, rtuonline, and pyqonline have all papers cataloged into the database. Run &quot;Import everything&quot; above to re-crawl.
            </p>
          </div>
        ) : (
          <ul className="divide-y border-2 border-border bg-card text-sm">
            {data.jobs.map((j) => (
              <li key={j.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={j.status} />
                  <span className="font-medium">{j.payload.site ?? "all"}</span>
                  <span className="text-muted-foreground">{fmtDate(j.created_at)}</span>
                </div>
                {j.error && <p className="text-destructive">{j.error}</p>}
                {j.payload.result &&
                  Object.entries(j.payload.result).map(([site, r]) => (
                    <p key={site} className="text-muted-foreground">
                      {site}: {r.scraped?.resources ?? 0} found, {r.imported?.papers ?? 0} saved,{" "}
                      {r.imported?.listings ?? 0} listings, {r.scraped?.problems ?? 0} flagged.
                    </p>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
