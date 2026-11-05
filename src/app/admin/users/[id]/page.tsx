import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NoPermission } from "@/components/admin/no-permission";
import { UserControls } from "@/components/admin/user-controls";
import { PageHeader, StatCard, fmtDate } from "@/components/admin/ui";
import { Avatar } from "@/components/profile/avatar";
import { ApiError } from "@/lib/api/client";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminUserDetail } from "@/lib/api/types";

export default async function UserDetailPage(props: { params: Promise<{ id: string }> }) {
  const me = await getMe();
  if (me?.role !== "admin") return <NoPermission />;
  const { id } = await props.params;
  const user = await authedFetch<AdminUserDetail>(`/admin/users/${id}`, {}, `/admin/users/${id}`).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) return null;
    throw e;
  });
  if (!user) notFound();

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
          <Link
            href="/admin/users"
            className="inline-flex h-9 items-center gap-1.5 border-2 border-border bg-card px-3 text-xs font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> All users
          </Link>
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

      <section className="mt-6 space-y-2" aria-labelledby="ctl-h">
        <h2 id="ctl-h" className="text-xl">
          Role and access
        </h2>
        <UserControls user={user} isSelf={user.id === me.id} />
      </section>
    </>
  );
}
