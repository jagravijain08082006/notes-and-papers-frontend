import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { NoPermission } from "@/components/admin/no-permission";
import { ReportReplyDialog } from "@/components/admin/report-reply-dialog";
import { UserControls } from "@/components/admin/user-controls";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { Avatar } from "@/components/profile/avatar";
import { ApiError } from "@/lib/api/client";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminReport, AdminUserDetail, Paginated } from "@/lib/api/types";

export default async function UserDetailPage(props: { params: Promise<{ id: string }> }) {
  const me = await getMe();
  if (me?.role !== "admin") return <NoPermission />;
  const { id } = await props.params;
  const user = await authedFetch<AdminUserDetail>(`/admin/users/${id}`, {}, `/admin/users/${id}`).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) return null;
    throw e;
  });
  if (!user) notFound();

  // Fetch support inquiries and chat requests from this user
  const userReports = user.email
    ? await authedFetch<Paginated<AdminReport>>(
        "/admin/reports",
        { query: { q: user.email, size: 10 } },
        `/admin/reports`,
      ).catch(() => null)
    : null;

  const rows: [string, string | null][] = [
    ["Name", user.display_name],
    ["Email", user.email],
    ["Phone", user.phone],
    ["College", user.college],
    ["Course", user.course],
    ["City", user.city],
    ["State", user.state],
    ["Joined", fmtDate(user.created_at)],
    ["User ID", user.id],
  ];

  return (
    <>
      <PageHeader
        title={user.display_name ?? "(no name)"}
        description={user.email ?? "No email on this account"}
        actions={
          <div className="flex items-center gap-2">
            {user.email && (
              <a
                href={`mailto:${user.email}?subject=${encodeURIComponent("Notes & Papers Support")}`}
                className="inline-flex h-9 items-center gap-1.5 border-2 border-border bg-card px-3 text-xs font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard"
              >
                <Mail className="size-3.5 text-primary" aria-hidden="true" /> Email User
              </a>
            )}
            <Link
              href="/admin/users"
              className="inline-flex h-9 items-center gap-1.5 border-2 border-border bg-card px-3 text-xs font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" /> All users
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Role" value={user.role} tone={user.role === "admin" ? "warn" : undefined} />
        <StatCard label="Status" value={user.is_banned ? "banned" : "active"} tone={user.is_banned ? "bad" : undefined} />
        <StatCard label="Bookmarks" value={user.bookmark_count} hint={`${user.note_count} notes uploaded`} />
      </div>

      <section className="mt-6 grid gap-6 border-2 border-border bg-card p-5 shadow-hard-sm md:grid-cols-[auto_1fr]">
        <Avatar value={user.avatar} className="size-24" />
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="eyebrow text-muted-foreground">{k}</dt>
              <dd className="break-words text-sm font-medium">
                {v ? v : <span className="font-normal text-muted-foreground">not set</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* User Support Queries & Chat Requests */}
      <section className="mt-6 space-y-3" aria-labelledby="queries-h">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" aria-hidden="true" />
            <h2 id="queries-h" className="text-base sm:text-lg font-bold uppercase tracking-wide text-foreground">
              User Support Queries &amp; Chat Requests
            </h2>
          </div>
          {user.email && (
            <Link
              href={`/admin/reports?q=${encodeURIComponent(user.email)}`}
              className="text-xs font-bold uppercase tracking-wider text-link underline hover:text-foreground"
            >
              View in Hub →
            </Link>
          )}
        </div>

        {userReports?.items && userReports.items.length > 0 ? (
          <div className="space-y-3">
            {userReports.items.map((r) => {
              const parts = r.details?.split("\n\n[Admin Reply]:") ?? [];
              const userMsg = parts[0] ?? "";
              const adminReply = parts.length > 1 ? parts.slice(1).join("\n\n[Admin Reply]:") : null;

              return (
                <div
                  key={r.id}
                  className="border-2 border-border bg-card p-4 shadow-hard-sm space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center border border-border bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                        {r.reason === "support_chat" ? "💬 Chat Request" : r.reason ?? "Report"}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {fmtDate(r.created_at)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-foreground whitespace-pre-wrap">
                    {userMsg}
                  </p>

                  {adminReply && (
                    <div className="border-l-2 border-primary bg-primary/10 p-2 text-xs">
                      <span className="font-extrabold uppercase text-[10px] text-muted-foreground block mb-0.5">
                        Your Admin Reply:
                      </span>
                      <p className="font-medium text-foreground whitespace-pre-wrap">{adminReply}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                    <ReportReplyDialog report={r} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              No support inquiries or chat queries submitted by this user yet.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-2" aria-labelledby="ctl-h">
        <h2 id="ctl-h" className="text-xl">
          Role and access
        </h2>
        <UserControls user={user} isSelf={user.id === me.id} />
      </section>
    </>
  );
}
