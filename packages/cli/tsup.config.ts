import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/bin.ts",
  },
  format: ["esm"],
  target: "node20",
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
