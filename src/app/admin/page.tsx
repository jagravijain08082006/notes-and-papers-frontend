import { redirect } from "next/navigation";
import { BarChart, PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { NoPermission } from "@/components/admin/no-permission";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminOverview } from "@/lib/api/types";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const me = await getMe();
  if (me?.role === "moderator") redirect("/admin/review");
  if (me?.role !== "admin") return <NoPermission />;
  const o = await authedFetch<AdminOverview>("/admin/overview", { query: { days: 30 } }, "/admin");
  const k = o.kpis;

  return (
    <>
      <PageHeader
        title="Overview"
        description="What the platform is doing right now."
        actions={
          <Link
            href="/admin/imports"
            className="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            Open Crawl Hub →
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published papers"
          value={k.papers_published}
          hint={`${k.papers_total} in total`}
        />
        <StatCard
          label="New this week"
          value={k.papers_new_week}
          hint={`${k.papers_new_today} today`}
        />
        <StatCard
          label="Review queue"
          value={k.review_queue}
          tone={k.review_queue > 0 ? "warn" : undefined}
          hint="Waiting for a moderator"
        />
        <StatCard
          label="Failed runs (24h)"
          value={k.failed_runs_24h}
          tone={k.failed_runs_24h > 0 ? "bad" : undefined}
        />
        <StatCard label="Searches (7d)" value={k.searches_7d} />
        <StatCard label="Downloads (7d)" value={k.downloads_7d} />
        <StatCard
          label="Open reports"
          value={k.open_reports}
          tone={k.open_reports > 0 ? "warn" : undefined}
        />
        <StatCard
          label="Indexed pages"
          value={k.indexed_pages}
          hint={`${k.tracked_pages} tracked`}
        />
      </div>

      <section aria-labelledby="last-run" className="mt-6 border-2 border-border bg-card p-5 shadow-hard-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 id="last-run" className="text-xl sm:text-2xl font-display uppercase tracking-wider">
            Crawl Pipeline Status
          </h2>
          <Link
            href="/admin/runs"
            className="text-xs font-bold uppercase tracking-wider text-link hover:underline"
          >
            View All Crawl Runs →
          </Link>
        </div>

        {o.last_run ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            <StatusBadge status={o.last_run.status} />
            <span className="font-bold">{o.last_run.source_name}</span>
            <span className="text-muted-foreground">
              {o.last_run.new_count} new · {o.last_run.changed_count} changed ·{" "}
              {o.last_run.failed_count} failed ·{" "}
              {fmtDate(o.last_run.finished_at ?? o.last_run.created_at)}
            </span>
            <Link href={`/admin/runs/${o.last_run.id}`} className="text-link underline font-medium">
              Run Details
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 border border-border bg-success/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success">
                ● Automated Pipeline Scheduled
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Nightly Sync (02:00 UTC via GitHub Actions)
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated scrapers crawl university listings nightly. You can also trigger an immediate scrape from the{" "}
              <Link href="/admin/imports" className="text-link underline font-medium">
                Data Imports &amp; Crawl Hub
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <BarChart title="New papers" data={o.charts.new_papers} />
        <BarChart title="Searches" data={o.charts.searches} />
        <BarChart title="Downloads" data={o.charts.downloads} />
      </div>
    </>
  );
}
