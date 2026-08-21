import { NextResponse } from "next/server";
import { CONTENT_SIGNAL, CORS_HEADERS } from "./constants";

export { CONTENT_SIGNAL, CORS_HEADERS, DISCOVERY_LINK_HEADER } from "./constants";

export function jsonResponse(
  data: unknown,
  contentType = "application/json",
  extraHeaders?: HeadersInit,
): NextResponse {
  return new NextResponse(JSON.stringify(data, null, 2) + "\n", {
    status: 200,
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=3600",
      "Content-Signal": CONTENT_SIGNAL,
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function textResponse(
  body: string,
  contentType: string,
  extraHeaders?: HeadersInit,
): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=3600",
      "Content-Signal": CONTENT_SIGNAL,
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
    },
  });
}
