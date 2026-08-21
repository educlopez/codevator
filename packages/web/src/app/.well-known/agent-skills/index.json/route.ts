import { corsPreflight, jsonResponse } from "@/lib/agent/http";
import { getSkillsIndex } from "@/lib/agent/catalogs";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse(getSkillsIndex());
}

export function HEAD() {
  return GET();
}

export function OPTIONS() {
  return corsPreflight();
}
