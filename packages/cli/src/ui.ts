import * as p from "@clack/prompts";
import pc from "picocolors";

export { p, pc };

export function intro() {
  p.intro(pc.bgCyan(pc.black(" codevator ")));
}

export function outro(msg: string) {
  p.outro(msg);
}

export function success(msg: string) {
  p.log.success(msg);
}

export function info(msg: string) {
  p.log.info(msg);
}

export function warn(msg: string) {
  p.log.warn(msg);
}

export function error(msg: string) {
  p.log.error(msg);
}

export function volumeBar(level: number): string {
  const filled = Math.round(level / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}
