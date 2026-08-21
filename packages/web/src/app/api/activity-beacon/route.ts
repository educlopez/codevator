import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|preview|lighthouse|pagespeed|slurp|facebookexternalhit|embedly|discord|slack|telegram|whatsapp|reddit/i;
const PATH_PATTERN = /^\/(?!\/)[^\\]*$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

const ACTIVITY_INGEST_URL = "https://educalvolopez.com/api/activity";
const MAX_GEO_FIELD_LENGTH = 200;

export async function POST(request: Request) {
  const secret = process.env.ACTIVITY_INGEST_HMAC_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const { path, title } = payload as { path?: unknown; title?: unknown };

  if (typeof path !== "string" || path.length > 500 || !PATH_PATTERN.test(path)) {
    return NextResponse.json({ ok: false, error: "invalid_path" }, { status: 400 });
  }

  if (title !== undefined && (typeof title !== "string" || title.length > 500)) {
    return NextResponse.json({ ok: false, error: "invalid_title" }, { status: 400 });
  }

  const cityHeader = request.headers.get("x-vercel-ip-city");
  let decodedCity: string | undefined;
  if (cityHeader) {
    try {
      decodedCity = decodeURIComponent(cityHeader);
    } catch {
      decodedCity = undefined;
    }
  }
  const city =
    decodedCity && decodedCity.length <= MAX_GEO_FIELD_LENGTH ? decodedCity : undefined;

  const countryHeader = request.headers.get("x-vercel-ip-country");
  const country = countryHeader && COUNTRY_CODE_PATTERN.test(countryHeader) ? countryHeader : undefined;

  const regionHeader = request.headers.get("x-vercel-ip-country-region") ?? undefined;
  const region =
    regionHeader && regionHeader.length <= MAX_GEO_FIELD_LENGTH ? regionHeader : undefined;

  const body = JSON.stringify({
    source: "codevator",
    type: "visit",
    idempotency_key: `codevator:visit:${randomUUID()}`,
    speed: "signal",
    meta: {
      path,
      ...(title ? { title } : {}),
      ...(city ? { city } : {}),
      ...(country ? { country } : {}),
      ...(region ? { region } : {}),
    },
  });

  const signature = createHmac("sha256", secret).update(body).digest("hex");

  try {
    await fetch(ACTIVITY_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-activity-signature": signature,
      },
      body,
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Forwarding to the activity feed is best-effort; never fail the beacon on its account.
  }

  return NextResponse.json({ ok: true });
}
