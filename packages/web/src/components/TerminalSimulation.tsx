"use client";

import { useEffect, useRef, useState } from "react";

const TERMINAL_LINES = [
  { type: "prompt", text: "> Analyzing codebase structure..." },
  { type: "tool", text: "  Reading src/components/App.tsx" },
  { type: "tool", text: "  Reading src/utils/api.ts" },
  { type: "tool", text: "  Searching for 'handleSubmit'..." },
  { type: "result", text: "  Found 3 matches across 2 files" },
  { type: "prompt", text: "> Writing implementation..." },
  { type: "tool", text: "  Editing src/components/Form.tsx" },
  { type: "tool", text: "  Running npm test..." },
  { type: "result", text: "  Tests: 14 passed, 0 failed" },
  { type: "prompt", text: "> Refactoring validation logic..." },
  { type: "tool", text: "  Reading src/utils/validate.ts" },
  { type: "tool", text: "  Editing src/utils/validate.ts" },
];

export function TerminalSimulation() {
  const [visibleLines, setVisibleLines] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= TERMINAL_LINES.length) return 0;
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="w-full max-w-xl bg-lumon-dark rounded-lg border border-lumon-green/20 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2 bg-lumon-dark border-b border-lumon-green/10">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="font-mono text-xs text-lumon-gray ml-2">claude-code</span>
      </div>
      <div className="p-4 h-64 overflow-hidden font-mono text-sm">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`leading-relaxed ${
              line.type === "prompt"
                ? "text-lumon-mint font-semibold"
                : line.type === "result"
                  ? "text-green-400"
                  : "text-lumon-gray"
            }`}
          >
            {line.text}
          </div>
        ))}
        <span className="inline-block w-2 h-4 bg-lumon-mint animate-pulse" />
      </div>
    </div>
  );
}
