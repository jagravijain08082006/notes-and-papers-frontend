import { API_URL } from "@/lib/env";
import type { ErrorBody } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

export interface ApiOptions {
  query?: Query;
  /** ISR window in seconds. `false` disables caching (dynamic). */
  revalidate?: number | false;
  /** Cache tags used by `POST /api/revalidate`. See docs/projectflow.md section 9. */
  tags?: string[];
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/** Reading from the API is retried: the API runs on a free plan that now and then drops a connection or is still waking up. */
const RETRY_DELAYS_MS = [400, 1500, 4000];
const TRANSIENT_STATUS = new Set([502, 503, 504]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, init: RequestInit, safe: boolean): Promise<Response> {
  const tries = safe ? RETRY_DELAYS_MS.length + 1 : 1; // only GETs: repeating a POST could do the action twice
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, init);
      if (!TRANSIENT_STATUS.has(res.status) || attempt >= tries - 1) return res;
    } catch (e) {
      if (init.signal?.aborted || attempt >= tries - 1) throw e;
    }
    await sleep(RETRY_DELAYS_MS[attempt]);
  }
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { query, revalidate = 86400, tags, method = "GET", body, token, signal } = opts;
  const res = await fetchWithRetry(
    buildUrl(path, query),
    {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(revalidate === false || process.env.NODE_ENV !== "production"
        ? { cache: "no-store" as const }
        : { next: { revalidate, tags: [...(tags ?? []), "catalog"] } }),
    },
    method === "GET",
  );

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const data = (await res.json()) as ErrorBody;
      message = data.error?.message ?? data.detail ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Like `apiFetch` but resolves to `null` on 404 so pages can call `notFound()`. Other errors still throw. */
export async function apiFetchOrNull<T>(path: string, opts?: ApiOptions): Promise<T | null> {
  try {
    return await apiFetch<T>(path, opts);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
