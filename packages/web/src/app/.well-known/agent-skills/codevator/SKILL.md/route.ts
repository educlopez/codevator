import { corsPreflight, textResponse } from "@/lib/agent/http";
import { CODEVATOR_SKILL_MARKDOWN } from "@/lib/agent/codevator-skill";

export const dynamic = "force-static";

export function GET() {
  return textResponse(CODEVATOR_SKILL_MARKDOWN, "text/markdown");
}

export function HEAD() {
  return GET();
}

export function OPTIONS() {
  return corsPreflight();
}
