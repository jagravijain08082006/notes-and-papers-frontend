import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/env";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessOptions,
  refreshOptions,
  secondsLeft,
  type TokenPair,
} from "@/lib/auth/cookies";

const PRIVATE = ["/admin", "/account", "/bookmarks", "/downloads", "/upload"];

/**
 * Keeps the session alive (swaps the refresh token for a new access token when the old one is about to expire)
 * and gates signed-in-only routes. Role checks (admin/moderator) are enforced again by the API and the admin layout.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const cfVisitor = request.headers.get("cf-visitor");
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("::1");

  const isHttp =
    !isLocal &&
    (forwardedProto === "http" ||
      (cfVisitor ? cfVisitor.includes('"scheme":"http"') : false) ||
      (!forwardedProto && request.nextUrl.protocol === "http:"));
  const isWww = host.startsWith("www.");

  // 301 Permanent Redirect for HTTP -> HTTPS and www -> non-www canonical domain
  if (isHttp || isWww) {
    const cleanHost = host.replace(/^www\./i, "");
    const destination = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      `https://${cleanHost || "notesandpapers.dpdns.org"}`
    );
    return NextResponse.redirect(destination, 301);
  }

  // Rewrite shorthand sitemap URLs submitted in Google Search Console (e.g. /papers/1.xml -> /sitemaps/papers/1.xml)
  const sitemapShorthand = request.nextUrl.pathname.match(
    /^\/(papers|courses|subjects|exams|static)\/(\d+\.xml)$/
  );
  if (sitemapShorthand) {
    const destination = new URL(
      `/sitemaps/${sitemapShorthand[1]}/${sitemapShorthand[2]}`,
      request.url
    );
    return NextResponse.rewrite(destination);
  }

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let tokens: TokenPair | null = null;

  if (secondsLeft(access) < 60 && refresh) {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    }).catch(() => null);
    if (res?.ok) tokens = (await res.json()) as TokenPair;
  }

  const signedIn = tokens !== null || secondsLeft(access) > 0;
  const path = request.nextUrl.pathname;
  if (!signedIn && PRIVATE.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    const redirect = NextResponse.redirect(url);
    if (refresh && !tokens) {
      redirect.cookies.delete(REFRESH_COOKIE);
      redirect.cookies.delete(ACCESS_COOKIE);
    }
    return redirect;
  }

  if (tokens) {
    // Visible to the page being rendered now, and stored in the browser for the next requests.
    request.cookies.set(ACCESS_COOKIE, tokens.access_token);
    const response = NextResponse.next({ request });
    response.cookies.set(ACCESS_COOKIE, tokens.access_token, accessOptions(tokens.expires_in));
    response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, refreshOptions());
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap|sitemaps/|indexnow).*)"],
};
