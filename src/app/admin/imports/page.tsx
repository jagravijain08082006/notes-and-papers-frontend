import { AdminAction } from "@/components/admin/admin-action";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { CrawlRunPanel } from "@/components/admin/crawl-run-panel";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";

interface SyncJob {
  id: string;
  status: string;
  created_at: string;
  error: string | null;
  result: {
    new_papers?: number;
    seconds?: number;
    problems?: string[];
    branding?: { branded?: number; failed?: number };
  } | null;
}
interface Branding {
  total: number;
  branded: number;
  failed: number;
  pending: number;
  jobs: { status: string }[];
}
interface Imports {
  papers_by_source: Record<string, number>;
  jobs: { status: string }[];
}

const active = (jobs: { status: string }[]) =>
  jobs.some((j) => j.status === "queued" || j.status === "running");

export default async function CrawlerPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const [data, brand, sync] = await Promise.all([
    authedFetch<Imports>("/admin/imports", {}, "/admin/imports"),
    authedFetch<Branding>("/admin/branding", {}, "/admin/imports"),
    authedFetch<{ jobs: SyncJob[] }>("/admin/sync", {}, "/admin/imports"),
  ]);
  const running = active(data.jobs) || active(brand.jobs) || active(sync.jobs);
  const bySource = Object.entries(data.papers_by_source);

  return (
    <>
      <AutoRefresh active={running} />
      <PageHeader
        title="Crawler"
        description="Finds new papers on the source sites, brands the PDFs and stores them. It also runs by itself every night."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Papers" value={brand.total} />
        <StatCard label="Branded and stored" value={brand.branded} />
        <StatCard label="Waiting" value={brand.pending} />
        <StatCard
          label="Failed"
          value={brand.failed}
          tone={brand.failed ? "warn" : undefined}
          hint="Reason is shown on the paper"
        />
      </div>
      {bySource.length > 0 && (
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          By source: {bySource.map(([k, v]) => `${k} ${v.toLocaleString("en-IN")}`).join(" · ")}
        </p>
      )}

      <section className="mt-8 space-y-3" aria-labelledby="run-h">
        <h2 id="run-h" className="text-xl">
          Run a crawl
        </h2>
        <CrawlRunPanel running={running} />
      </section>

      <section className="mt-8 space-y-3" aria-labelledby="runs-h">
        <h2 id="runs-h" className="text-xl">
          Recent runs
        </h2>
        {sync.jobs.length === 0 ? (
          <p className="border-2 border-border bg-card p-4 text-sm text-muted-foreground">
            No runs yet. The first one starts tonight, or press Run now.
          </p>
        ) : (
          <ul className="divide-y border-2 border-border bg-card text-sm">
            {sync.jobs.map((j) => (
              <li key={j.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={j.status} />
                  <span className="text-muted-foreground">{fmtDate(j.created_at)}</span>
                  {j.result && (
                    <span>
                      {j.result.new_papers ?? 0} new papers · {j.result.branding?.branded ?? 0}{" "}
                      branded
                      {j.result.seconds ? ` · ${Math.round(j.result.seconds)}s` : ""}
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
        )}
      </section>

      <details className="mt-8 border-2 border-border bg-card p-4">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide">
          More actions
        </summary>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Only load the listing pages into the database, without branding any PDF.
            </p>
            <div className="flex flex-wrap gap-2">
              <AdminAction
                label="Import all"
                path="/admin/imports"
                body={{ site: "all" }}
                success="Import started"
                disabled={running}
              />
              <AdminAction
                label="Import again, ignoring the page cache"
                path="/admin/imports"
                body={{ site: "all", refresh: true }}
                success="Import started"
                disabled={running}
                confirm="Ignore the page cache and fetch every listing page again?"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Brand PDFs without crawling: replaces the watermark, adds the cover pages and stores the
              file.
            </p>
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
        </div>
      </details>
    </>
  );
}
