import { NextRequest, NextResponse } from "next/server";
import {
  CONTENT_SIGNAL,
  CORS_HEADERS,
  DISCOVERY_LINK_HEADER,
} from "@/lib/agent/constants";
import {
  estimateMarkdownTokens,
  getMarkdownForPath,
  prefersMarkdown,
} from "@/lib/agent/markdown";

const HTML_PAGES = new Set(["/", "/docs", "/sounds", "/roadmap"]);

function isHtmlPage(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname || "/";
  return HTML_PAGES.has(normalized);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (prefersMarkdown(request.headers.get("accept"))) {
    const markdown = getMarkdownForPath(pathname);
    if (markdown) {
      const tokens = estimateMarkdownTokens(markdown);
      const headers: Record<string, string> = {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Length": String(new TextEncoder().encode(markdown).byteLength),
        Vary: "Accept",
        "x-markdown-tokens": String(tokens),
        "Content-Signal": CONTENT_SIGNAL,
        "Cache-Control": "public, max-age=3600",
        ...CORS_HEADERS,
        Link: DISCOVERY_LINK_HEADER,
      };

      if (request.method === "HEAD") {
        return new NextResponse(null, { status: 200, headers });
      }

      return new NextResponse(markdown, { status: 200, headers });
    }
  }

  const response = NextResponse.next();
  response.headers.append("Vary", "Accept");

  if (isHtmlPage(pathname)) {
    response.headers.append("Link", DISCOVERY_LINK_HEADER);
  }

  return response;
}

export const config = {
  matcher: ["/", "/docs", "/docs/:path*", "/sounds", "/sounds/:path*", "/roadmap", "/roadmap/:path*"],
};
