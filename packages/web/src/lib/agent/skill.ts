import { createHash } from "node:crypto";
import {
  CODEVATOR_SKILL_DESCRIPTION,
  CODEVATOR_SKILL_MARKDOWN,
  CODEVATOR_SKILL_NAME,
} from "./codevator-skill";

export {
  CODEVATOR_SKILL_DESCRIPTION,
  CODEVATOR_SKILL_MARKDOWN,
  CODEVATOR_SKILL_NAME,
};

export function skillSha256(): string {
  return createHash("sha256").update(CODEVATOR_SKILL_MARKDOWN).digest("hex");
}

export function skillDigest(): string {
  return `sha256:${skillSha256()}`;
}
