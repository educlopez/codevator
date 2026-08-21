import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = join(webRoot, "../../skills/codevator/SKILL.md");
const outPath = join(webRoot, "src/lib/agent/codevator-skill.ts");

const markdown = readFileSync(skillPath, "utf8");
const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/);
const descriptionMatch = frontmatter?.[1].match(/^description:\s*(.*)$/m);
const description = descriptionMatch?.[1]?.trim();

if (!description) {
  throw new Error("Could not parse description from skills/codevator/SKILL.md");
}

const contents = `/** Canonical copy of ../../../../skills/codevator/SKILL.md for agent discovery. */
export const CODEVATOR_SKILL_NAME = "codevator";

export const CODEVATOR_SKILL_DESCRIPTION =
  ${JSON.stringify(description)};

export const CODEVATOR_SKILL_MARKDOWN = ${JSON.stringify(markdown)};
`;

writeFileSync(outPath, contents);
const digest = createHash("sha256").update(markdown).digest("hex");
console.log(`Wrote ${outPath}`);
console.log(`sha256:${digest}`);
