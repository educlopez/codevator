export type RoadmapItem = {
  title: string;
  description: string;
  status: string;
};

const SHEET_CSV_URL =
  process.env.NEXT_PUBLIC_ROADMAP_SHEET_URL ??
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOHhA4uNMlT-TdBNJXoYblx6090Qj3OIb2jhPtZrTWrFrmH0E7uaTmm8b5mdCySU1_GA8d_dDZvyaB/pub?gid=0&single=true&output=csv";

export const FALLBACK_ITEMS: RoadmapItem[] = [
  {
    title: "Multi-agent mode",
    description:
      "Set up codevator for Claude Code, Codex, or OpenCode. Each agent gets its own hooks and session tracking.",
    status: "Done",
  },
  {
    title: "Spotify integration",
    description:
      "Use Spotify as a sound mode on macOS. Codevator fades your music in when coding starts and fades out when done.",
    status: "Done",
  },
  {
    title: "Custom sounds",
    description:
      "Upload your own MP3 or WAV files as a custom sound mode. Use any audio you want while your agent works.",
    status: "Exploring",
  },
  {
    title: "More agents support",
    description:
      "Extend codevator beyond Claude Code. Support for Cursor, Windsurf, Codex, and OpenCode.",
    status: "Exploring",
  },
  {
    title: "Sound themes",
    description:
      "Downloadable theme packs — lofi, jazz, nature, coffee shop, and more. Curated sets of sounds for different vibes.",
    status: "Exploring",
  },
];

/** Parse a single CSV line, handling quoted fields that may contain commas */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(csv: string): RoadmapItem[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  return lines
    .slice(1)
    .map((line) => {
      const cols = parseCSVLine(line);
      return {
        title: cols[0]?.trim() ?? "",
        description: cols[1]?.trim() ?? "",
        status: cols[2]?.trim() || "Exploring",
      };
    })
    .filter((item) => item.title);
}

const STATUS_ORDER = ["In Progress", "Planned", "Exploring", "Done"];

export type RoadmapGroup = { status: string; items: RoadmapItem[] };

export function groupByStatus(items: RoadmapItem[]): RoadmapGroup[] {
  const map = new Map<string, RoadmapItem[]>();
  for (const item of items) {
    const list = map.get(item.status);
    if (list) list.push(item);
    else map.set(item.status, [item]);
  }

  const groups: RoadmapGroup[] = [];
  for (const status of STATUS_ORDER) {
    const items = map.get(status);
    if (items) groups.push({ status, items });
  }
  // Include any statuses not in the predefined order
  for (const [status, items] of map) {
    if (!STATUS_ORDER.includes(status)) {
      groups.push({ status, items });
    }
  }
  return groups;
}

export async function fetchRoadmapItems(): Promise<RoadmapItem[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  if (!res.ok) return FALLBACK_ITEMS;
  const csv = await res.text();
  const items = parseCSV(csv);
  return items.length > 0 ? items : FALLBACK_ITEMS;
}
