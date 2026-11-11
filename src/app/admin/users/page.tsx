import Link from "next/link";
import { Eye } from "lucide-react";
import { AdminAction } from "@/components/admin/admin-action";
import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { UserRoleSelect } from "@/components/admin/user-controls";
import { PageHeader, SearchForm, Select, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminUser, Paginated } from "@/lib/api/types";
import { enumParam, first, intParam } from "@/lib/search-params";

export default async function UsersPage(props: PageProps<"/admin/users">) {
  const me = await getMe();
  if (me?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const role = enumParam(sp.role, ["user", "moderator", "admin"] as const);
  const q = first(sp.q)?.trim().slice(0, 120);
  const data = await authedFetch<Paginated<AdminUser>>(
    "/admin/users",
    { query: { role, q, page: intParam(sp.page), size: 25 } },
    "/admin/users",
  );

  const cols: Column<AdminUser>[] = [
    {
      key: "name",
      header: "User",
      className: "min-w-[14rem]",
      cell: (u) => (
        <div className="space-y-0.5">
          <Link
            href={`/admin/users/${u.id}`}
            className="font-bold text-foreground hover:text-link hover:underline line-clamp-1 transition-colors"
          >
            {u.display_name ?? "(no name)"}
          </Link>
          <p className="break-all text-xs text-muted-foreground">{u.email ?? "no email"}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      className: "w-36 whitespace-nowrap",
      cell: (u) => <UserRoleSelect user={u} isSelf={u.id === me.id} compact />,
    },
    {
      key: "banned",
      header: "Status",
      className: "w-28 whitespace-nowrap",
      cell: (u) => (
        <span
          className={
            u.is_banned
              ? "inline-flex items-center border-2 border-border bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground shadow-hard-sm"
              : "inline-flex items-center border-2 border-border bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success"
          }
        >
          {u.is_banned ? "Banned" : "Active"}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      className: "w-40 text-xs text-muted-foreground whitespace-nowrap",
      cell: (u) => fmtDate(u.created_at),
    },
    {
      key: "ctl",
      header: "Actions",
      className: "w-44 text-right whitespace-nowrap",
      cell: (u) => {
        const isSelf = u.id === me.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Link
              href={`/admin/users/${u.id}`}
              className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-hard active:translate-x-px active:translate-y-px"
            >
              <Eye className="size-3.5" aria-hidden="true" /> View
            </Link>
            {!isSelf && (
              <AdminAction
                label={u.is_banned ? "Unban" : "Ban"}
                path={`admin/users/${u.id}`}
                method="PATCH"
                body={{ is_banned: !u.is_banned }}
                confirm={
                  u.is_banned
                    ? undefined
                    : "Ban this user? They will be signed out of every API call."
                }
                variant={u.is_banned ? "outline" : "destructive"}
                size="sm"
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Change user roles, ban abusive accounts, or open a profile to inspect detailed account history."
      />
      <SearchForm action="/admin/users" q={q} placeholder="Search users by name, email or college...">
        <Select
          name="role"
          label="Role"
          value={role}
          options={[
            { value: "", label: "All roles" },
            { value: "user", label: "User" },
            { value: "moderator", label: "Moderator" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </SearchForm>
      <DataTable
        caption="Users"
        columns={cols}
        rows={data.items}
        rowKey={(u) => u.id}
        basePath="/admin/users"
        params={{ role, q }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle={q ? `No users match "${q}"` : "No users yet"}
        minWidth="min-w-[42rem]"
      />
    </>
  );
}
