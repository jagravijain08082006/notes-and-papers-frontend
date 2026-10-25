"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  ExamSummary,
  Paginated,
  PaperSummary,
  SearchResponse,
  UniversityListItem,
} from "@/lib/api/types";
import {
  fetchUniversities,
  fetchExams,
  fetchPapers,
  fetchSearch,
  type SearchQuery,
} from "@/services/queries";

const CATALOG_STALE_TIME = 300_000; // 5 minutes

/**
 * `initial` is the server-rendered copy (so the HTML has real content for search engines and no-JS visitors).
 * Reuses server-rendered data for 5 minutes instead of immediately firing duplicate API calls on mount.
 */
export function useUniversities(initial?: UniversityListItem[] | null) {
  return useQuery({
    queryKey: ["universities"],
    queryFn: ({ signal }) => fetchUniversities(signal),
    initialData: initial ?? undefined,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useExams(kind: ExamSummary["kind"] | undefined, initial?: ExamSummary[] | null) {
  return useQuery({
    queryKey: ["exams", kind ?? "all"],
    queryFn: ({ signal }) => fetchExams(kind, signal),
    initialData: initial ?? undefined,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useLatestPapers(
  size: number,
  page: number = 1,
  initial?: Paginated<PaperSummary> | null,
) {
  return useQuery({
    queryKey: ["papers", "latest", size, page],
    queryFn: ({ signal }) => fetchPapers({ sort: "latest", page, size }, signal),
    initialData: page === 1 ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useSearch(params: SearchQuery, enabled: boolean) {
  return useQuery<SearchResponse>({
    queryKey: ["search", params],
    queryFn: ({ signal }) => fetchSearch(params, signal),
    enabled,
    placeholderData: keepPreviousData, // keep showing the old results while the next page loads
    staleTime: 30_000,
  });
}
