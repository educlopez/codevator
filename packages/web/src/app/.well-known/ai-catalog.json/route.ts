import { corsPreflight, jsonResponse } from "@/lib/agent/http";
import { getAiCatalog } from "@/lib/agent/catalogs";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse(getAiCatalog());
}

export function HEAD() {
  return GET();
}

export function OPTIONS() {
  return corsPreflight();
}
