import Link from "next/link";
import { ArrowRight, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { listNotes } from "@/lib/api/public";
import type { Paginated, NoteSummary } from "@/lib/api/types";
import { parsePositiveInt } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 604800;
const SIZE = 20;

export async function generateMetadata(props: PageProps<"/notes">) {
  const sp = await props.searchParams;
  return buildMetadata({
    title: "Notes for Rajasthan University | Notes & Papers",
    description: "Student notes for Rajasthan University subjects, free to read and download.",
    path: "/notes",
    // thin until notes exist; filtered/paged views are never indexed
    noindex: Object.keys(sp).length > 0,
    keywords: [
      "student notes",
      "rajasthan university notes",
      "uniraj study material",
      "handwritten notes pdf",
      "notes and papers",
    ],
  });
}

async function load(page: number, q: string): Promise<Paginated<NoteSummary>> {
  try {
    return await listNotes({ page, size: SIZE, q: q || undefined });
  } catch {
    return { items: [], total: 0, page, size: SIZE };
  }
}

export default async function NotesPage(props: PageProps<"/notes">) {
  const sp = await props.searchParams;
  const q = [sp.q].flat()[0]?.toString().slice(0, 120) ?? "";
  const page = parsePositiveInt([sp.page].flat()[0]?.toString());
  const data = await load(page, q);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl break-words leading-tight">Notes</h1>
        <form action="/notes" role="search" className="flex flex-col sm:flex-row max-w-xl gap-2">
          <label htmlFor="notes-q" className="sr-only">
            Search notes
          </label>
          <input
            id="notes-q"
            name="q"
            defaultValue={q}
            maxLength={120}
            placeholder="Search notes by title or subject"
            className="h-11 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-3.5 text-base"
          />
          <button
            className="inline-flex h-11 items-center justify-center gap-2 w-full sm:w-auto border-2 border-border bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
            type="submit"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </form>
      </header>

      {data.items.length === 0 ? (
        <EmptyState
          title={q ? `No notes for "${q}"` : "No notes yet"}
          description="Student notes appear here once they are reviewed. You can share yours too."
          action={{ href: "/upload", label: "Upload notes" }}
        />
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {data.items.map((n) => (
              <li key={n.slug}>
                <Card className="group h-full transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard border-2 border-border">
                  <Link href={`/notes/${n.slug}`} className="flex h-full flex-col justify-between p-4 sm:p-5">
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-11 sm:size-12 shrink-0 place-items-center border-2 border-border bg-primary text-foreground shadow-hard-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                        <FileText className="size-5 sm:size-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h2 className="font-bold text-lg sm:text-xl leading-snug group-hover:text-link transition-colors">{n.title}</h2>
                        {n.description && (
                          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground">
                            {n.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {n.course_name && <Badge tone="primary">{n.course_name}</Badge>}
                          {n.subject_name && <Badge>{n.subject_name}</Badge>}
                        </div>
                      </div>
                      <ArrowRight className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                    </div>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            size={data.size}
            total={data.total}
            hrefFor={(p) =>
              `/notes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`
            }
          />
        </>
      )}
    </div>
  );
}
