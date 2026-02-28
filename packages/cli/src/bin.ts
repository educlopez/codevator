import fs from "node:fs";
import { parseArgs, run } from "./commands.js";
import { setSessionId } from "./player.js";

// Claude Code passes hook context as JSON on stdin. Extract session_id
// so session tracking uses a stable identifier instead of process.ppid
// (which changes with every hook invocation).
if (!process.stdin.isTTY) {
  try {
    const input = fs.readFileSync(0, "utf-8").trim();
    if (input) {
      const data = JSON.parse(input);
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    }
  } catch {
    // Not JSON or no stdin — fall back to process.ppid
  }
}

const { command, args } = parseArgs(process.argv.slice(2));
run(command, args).catch(() => process.exit(1));
