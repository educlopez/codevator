import { parseArgs, run } from "./commands.js";

const { command, args } = parseArgs(process.argv.slice(2));
run(command, args).catch(() => process.exit(1));
