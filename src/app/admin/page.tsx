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
        actions={
          <Link
            href="/admin/imports"
            className="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            Crawl hub →
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published papers"
          value={k.papers_published}
          hint={`${k.papers_new_week} new this week`}
        />
        <StatCard
          label="Review queue"
          value={k.review_queue}
          tone={k.review_queue > 0 ? "warn" : undefined}
        />
        <StatCard
          label="Open reports"
          value={k.open_reports}
          tone={k.open_reports > 0 ? "warn" : undefined}
        />
        <StatCard
          label="Failed runs (24h)"
          value={k.failed_runs_24h}
          tone={k.failed_runs_24h > 0 ? "bad" : undefined}
        />
      </div>

      <p className="mt-3 text-xs font-semibold text-muted-foreground">
        Last 7 days: {k.searches_7d.toLocaleString("en-IN")} searches ·{" "}
        {k.downloads_7d.toLocaleString("en-IN")} downloads · {k.indexed_pages.toLocaleString("en-IN")}{" "}
        pages indexed
      </p>

      <section
        aria-labelledby="last-run"
        className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-2 border-border bg-card px-4 py-3 text-sm shadow-hard-sm"
      >
        <h2 id="last-run" className="text-xs font-black uppercase tracking-wider">
          Last crawl
        </h2>
        {o.last_run ? (
          <>
            <StatusBadge status={o.last_run.status} />
            <span className="font-bold">{o.last_run.source_name}</span>
            <span className="text-muted-foreground">
              {o.last_run.new_count} new · {o.last_run.failed_count} failed ·{" "}
              {fmtDate(o.last_run.finished_at ?? o.last_run.created_at)}
            </span>
            <Link href={`/admin/runs/${o.last_run.id}`} className="text-link underline font-medium">
              Details
            </Link>
          </>
        ) : (
          <span className="text-muted-foreground">No run yet. The sync runs nightly.</span>
        )}
        <Link
          href="/admin/runs"
          className="ml-auto text-xs font-bold uppercase tracking-wider text-link hover:underline"
        >
          All runs →
        </Link>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <BarChart title="New papers" data={o.charts.new_papers} />
        <BarChart title="Searches" data={o.charts.searches} />
        <BarChart title="Downloads" data={o.charts.downloads} />
      </div>
    </>
  );
}
