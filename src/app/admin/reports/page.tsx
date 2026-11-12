import Link from "next/link";
import { AdminAction } from "@/components/admin/admin-action";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ReportReplyDialog } from "@/components/admin/report-reply-dialog";
import { SupportChatConsole } from "@/components/admin/support-chat-console";
import { PageHeader, SearchForm, Select, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch } from "@/lib/api/server";
import type { AdminChatSummary, AdminReport, Paginated } from "@/lib/api/types";
import { enumParam, first, intParam } from "@/lib/search-params";
import { MessageSquare, Table } from "lucide-react";

const STATUSES = ["open", "resolved", "dismissed"] as const;

export default async function ReportsPage(props: PageProps<"/admin/reports">) {
  const sp = await props.searchParams;
  const status = enumParam(sp.status, STATUSES, "open");
  const q = first(sp.q)?.trim().slice(0, 120);
  const view = first(sp.view) === "table" ? "table" : "chat";

  const [chats, tableData] = await Promise.all([
    view === "chat"
      ? authedFetch<AdminChatSummary[]>(
          "/admin/chats",
          { query: { limit: 150 } },
          "/admin/reports",
        ).catch(() => [] as AdminChatSummary[])
      : Promise.resolve([] as AdminChatSummary[]),
    view === "table"
      ? authedFetch<Paginated<AdminReport>>(
          "/admin/reports",
          { query: { status, q, page: intParam(sp.page), size: 20 } },
          "/admin/reports",
        )
      : Promise.resolve({ items: [], total: 0, page: 1, size: 20 } as Paginated<AdminReport>),
  ]);

  const columns: Column<AdminReport>[] = [
    {
      key: "reason",
      header: "Type",
      className: "w-28 whitespace-nowrap",
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-border ${
            r.reason === "support_chat"
              ? "bg-primary/20 text-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {r.reason === "support_chat" ? "💬 Support" : r.reason ?? "-"}
        </span>
      ),
    },
    {
      key: "details",
      header: "User Message & Chat",
      cell: (r) => {
        const parts = r.details?.split("\n\n[Admin Reply]:") ?? [];
        const userMsg = parts[0] ?? "";
        const adminReply = parts.length > 1 ? parts.slice(1).join("\n\n[Admin Reply]:") : null;

        return (
          <div className="max-w-md space-y-1.5">
            <p className="whitespace-pre-line text-xs sm:text-sm font-medium text-foreground">
              {userMsg}
            </p>

            {adminReply && (
              <div className="border-l-2 border-primary bg-primary/10 p-2 text-xs">
                <span className="font-extrabold uppercase text-[10px] text-muted-foreground block mb-0.5">
                  Admin Response:
                </span>
                <p className="font-medium text-foreground whitespace-pre-wrap">{adminReply}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground font-mono">
              {r.email}
              {r.paper_slug && (
                <>
                  {" · "}
                  <Link
                    href={`/papers/${r.paper_slug}`}
                    className="text-link underline"
                    target="_blank"
                  >
                    {r.paper_slug}
                  </Link>
                </>
              )}
            </p>
          </div>
        );
      },
    },
    { key: "when", header: "Received", className: "w-36 text-xs text-muted-foreground whitespace-nowrap", cell: (r) => fmtDate(r.created_at) },
    { key: "status", header: "Status", className: "w-24 whitespace-nowrap", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "act",
      header: "Actions",
      className: "w-64 text-right whitespace-nowrap",
      cell: (r) => (
        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
          <ReportReplyDialog report={r} />
          {r.status === "open" && (
            <>
              <AdminAction
                label="Resolve"
                path={`admin/reports/${r.id}`}
                method="PATCH"
                body={{ status: "resolved" }}
                variant="outline"
                size="sm"
              />
              {r.paper_id && (
                <AdminAction
                  label="Unpublish"
                  path={`admin/reports/${r.id}`}
                  method="PATCH"
                  body={{ status: "resolved", unpublish_paper: true }}
                  confirm="Resolve this report and take the paper off the site?"
                  size="sm"
                />
              )}
              <AdminAction
                label="Dismiss"
                path={`admin/reports/${r.id}`}
                method="PATCH"
                body={{ status: "dismissed" }}
                variant="outline"
                size="sm"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageHeader
          title={view === "chat" ? "Support Chat" : "Paper Reports"}
          description={
            view === "chat"
              ? "1-on-1 live chat conversations with website guests and students."
              : "Broken file reports and copyright takedown requests on specific papers."
          }
        />

        {/* View Mode Switcher */}
        <div className="inline-flex items-center border-2 border-border bg-card p-1 shadow-hard-xs self-start sm:self-center">
          <Link
            href="/admin/reports?view=chat"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              view === "chat"
                ? "bg-primary text-primary-foreground shadow-hard-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span>Support Chat</span>
          </Link>
          <Link
            href="/admin/reports?view=table"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              view === "table"
                ? "bg-primary text-primary-foreground shadow-hard-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table className="size-3.5" />
            <span>Paper Reports</span>
          </Link>
        </div>
      </div>

      {view === "chat" ? (
        <SupportChatConsole
          key={chats.length + (chats[0]?.id ?? "")}
          initialChats={chats}
          initialQuery={q ?? ""}
        />
      ) : (
        /* Legacy Table View */
        <>
          <SearchForm action="/admin/reports" q={q} placeholder="Search by email, message text, or topic...">
            <input type="hidden" name="view" value="table" />
            <Select
              name="status"
              label="Status"
              value={status}
              options={STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </SearchForm>
          <DataTable
            caption="Support & Reports"
            columns={columns}
            rows={tableData.items}
            rowKey={(r) => r.id}
            basePath="/admin/reports"
            params={{ status, q, view: "table" }}
            total={tableData.total}
            page={tableData.page}
            size={tableData.size}
            emptyTitle={q ? `No queries match "${q}"` : status === "open" ? "Inbox zero" : "Nothing here"}
            emptyDescription="No reports or support queries in this view."
            minWidth="min-w-[46rem]"
          />
        </>
      )}
    </>
  );
}
