import { corsPreflight, jsonResponse } from "@/lib/agent/http";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse({ ok: true, service: "codevator" });
}

export function HEAD() {
  return GET();
}

export function OPTIONS() {
  return corsPreflight();
}
