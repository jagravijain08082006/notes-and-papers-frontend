import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { API_URL } from "@/lib/env";

/**
 * GET /api/download/<slug>
 * Authenticated binary PDF streaming endpoint.
 * Returns the attachment with proper content-disposition and content-type headers.
 */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const token = await getAccessToken();
  if (!token) return toLogin(req, slug);

  const upstream = await fetch(`${API_URL}/papers/${encodeURIComponent(slug)}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "manual",
    cache: "no-store",
  }).catch(() => null);

  if (upstream?.status === 200 && upstream.body) return pdf(upstream.body, slug);

  const target = upstream?.headers.get("location");
  if (upstream && upstream.status >= 300 && upstream.status < 400 && target) {
    const file = await fetch(target, { cache: "no-store" }).catch(() => null);
    if (file?.ok && file.body) return pdf(file.body, slug);
    return unavailable();
  }
  if (upstream?.status === 404) {
    return new NextResponse("This PDF is still being prepared. Please try again later.", {
      status: 404,
    });
  }
  if (upstream?.status === 401) return toLogin(req, slug);
  return unavailable();
}

function toLogin(req: Request, slug: string) {
  const login = new URL("/login", req.url);
  login.searchParams.set("next", `/papers/${slug}/download`);
  return NextResponse.redirect(login);
}

function unavailable() {
  return new NextResponse("The file is temporarily unavailable. Please try again.", {
    status: 502,
  });
}

function pdf(body: ReadableStream<Uint8Array>, slug: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
