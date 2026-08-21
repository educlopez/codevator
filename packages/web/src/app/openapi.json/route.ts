import { corsPreflight, jsonResponse } from "@/lib/agent/http";
import { getOpenApiDocument } from "@/lib/agent/catalogs";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse(getOpenApiDocument(), "application/vnd.oai.openapi+json");
}

export function HEAD() {
  return GET();
}

export function OPTIONS() {
  return corsPreflight();
}
