import { corsPreflight, jsonResponse } from "@/lib/agent/http";
import { getApiCatalog } from "@/lib/agent/catalogs";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse(getApiCatalog(), "application/linkset+json");
}

export function HEAD() {
  return GET();
}

export function OPTIONS() {
  return corsPreflight();
}
