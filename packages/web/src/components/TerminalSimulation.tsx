"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

// --- Step definitions ---

type Step =
  | { type: "header" }
  | { type: "input"; text: string }
  | { type: "step"; label: string; detail?: string; time?: string }
  | { type: "response"; lines: string[] }
  | { type: "subagents"; agents: { name: string; status: string }[] };

const SEQUENCE: (Step | { type: "delay"; ms: number })[] = [
  { type: "header" },
  { type: "delay", ms: 600 },
  { type: "input", text: "set up codevator for this project" },
  { type: "delay", ms: 700 },
  { type: "step", label: "Read", detail: "~/.claude/settings.json", time: "1s" },
  { type: "delay", ms: 400 },
  { type: "step", label: "Write", detail: "hooks configured", time: "1s" },
  { type: "delay", ms: 500 },
  { type: "response", lines: [
    "Codevator is set up. I've configured the hooks in your",
    "Claude Code settings. Music will play automatically when",
    "I start working and stop when I need your input.",
  ]},
  { type: "delay", ms: 2000 },
  { type: "input", text: "refactor the auth module to use JWT" },
  { type: "delay", ms: 800 },
  { type: "step", label: "Read", detail: "src/auth/session.ts, src/auth/middleware.ts", time: "2s" },
  { type: "delay", ms: 500 },
  { type: "step", label: "Read", detail: "src/utils/crypto.ts", time: "1s" },
  { type: "delay", ms: 400 },
  { type: "step", label: "Edit", detail: "src/auth/session.ts (+34 -18)", time: "3s" },
  { type: "delay", ms: 500 },
  { type: "step", label: "Edit", detail: "src/auth/middleware.ts (+21 -9)", time: "2s" },
  { type: "delay", ms: 400 },
  { type: "step", label: "Run", detail: "npm test — 14 passed", time: "3s" },
  { type: "delay", ms: 600 },
  { type: "subagents", agents: [
    { name: "Types", status: "Updated 3 interfaces" },
    { name: "Docs", status: "Regenerated API docs" },
  ]},
  { type: "delay", ms: 700 },
  { type: "response", lines: [
    "Done. I've migrated the auth module from session-based",
    "to JWT tokens. Updated the middleware, added token",
    "verification, and all 14 tests are passing.",
  ]},
];

// Pre-compute reveal timestamps
function buildTimeline() {
  const steps: Step[] = [];
  const revealTimes: number[] = [];
  let elapsed = 400;

  for (const item of SEQUENCE) {
    if (item.type === "delay") {
      elapsed += item.ms;
    } else {
      steps.push(item);
      revealTimes.push(elapsed);
      elapsed += 100;
    }
  }

  return { steps, revealTimes, totalDuration: elapsed };
}

const { steps: STEPS, revealTimes: REVEAL_TIMES, totalDuration: TOTAL_DURATION } = buildTimeline();

// --- Components ---

function RevealItem({ children, revealed }: { children: ReactNode; revealed: boolean }) {
  return (
    <div
      className="transition-all duration-[400ms] ease-out"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(6px)",
      }}
    >
      {children}
    </div>
  );
}

function getFileStats(loopKey: number) {
  const stats = [
    { files: 3, added: 55, removed: 27 },
    { files: 5, added: 127, removed: 34 },
    { files: 2, added: 89, removed: 21 },
  ];
  return stats[loopKey % stats.length];
}

export function TerminalSimulation() {
  const [elapsed, setElapsed] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const [phase, setPhase] = useState<"playing" | "fading-out" | "fading-in">("fading-in");
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startLoop = useCallback(() => {
    startRef.current = performance.now();
    setElapsed(0);
    setPhase("fading-in");
    fadeTimerRef.current = setTimeout(() => setPhase("playing"), 700);

    function tick() {
      const ms = performance.now() - startRef.current;
      setElapsed(ms);

      if (ms > TOTAL_DURATION + 3500) {
        setPhase("fading-out");
        fadeTimerRef.current = setTimeout(() => {
          setLoopKey((k) => k + 1);
        }, 1000);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    startLoop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, [loopKey, startLoop]);

  // Throttled auto-scroll
  const lastScrollRef = useRef(0);
  useEffect(() => {
    if (elapsed - lastScrollRef.current > 250 && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      lastScrollRef.current = elapsed;
    }
  }, [elapsed]);

  const isWorking = elapsed > REVEAL_TIMES[0] && elapsed < TOTAL_DURATION;
  const fileStats = getFileStats(loopKey);

  const contentOpacity = phase === "fading-out" ? 0 : 1;
  const contentTransition = phase === "fading-out" ? "opacity 1s ease-in-out" : "opacity 0.7s ease-out";

  return (
    <div
      className="w-full max-w-xl rounded-[10px] overflow-hidden select-none flex flex-col bg-[#0e0e0e]"
      style={{
        boxShadow:
          "0 28px 70px rgba(0,0,0,0.25), 0 14px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.08)",
        height: 420,
      }}
    >
      {/* Title bar */}
      <div className="relative flex items-center h-7 px-2.5 bg-[#161616] border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-[6px]">
          <span className="w-[10px] h-[10px] rounded-full bg-white/[0.15]" />
          <span className="w-[10px] h-[10px] rounded-full bg-white/[0.15]" />
          <span className="w-[10px] h-[10px] rounded-full bg-white/[0.15]" />
        </div>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] text-white/40">
          claude-code
        </span>
      </div>

      {/* Main content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden font-mono text-[12px] flex flex-col justify-end"
        style={{ opacity: contentOpacity, transition: contentTransition }}
      >
        <div className="px-4 pt-4 pb-2 space-y-2.5">
          {STEPS.map((step, i) => {
            const revealed = elapsed >= REVEAL_TIMES[i];

            switch (step.type) {
              case "header":
                return (
                  <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                    <div className="space-y-0.5 pb-1">
                      <div>
                        <span className="text-white/25">&gt; </span>
                        <span className="text-white/50">claude-code</span>
                      </div>
                      <div className="text-white/25">Claude Code v1.0.29</div>
                      <div className="text-white/15">~/project · main</div>
                    </div>
                  </RevealItem>
                );

              case "input":
                return (
                  <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                    <div className="border border-white/[0.08] px-3 py-2 text-white/90 rounded-sm">
                      {step.text}
                    </div>
                  </RevealItem>
                );

              case "step":
                return (
                  <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400/70 text-[8px] leading-[18px]">&#x25CF;</span>
                      <span className="text-white/60">{step.label}</span>
                      {step.detail && (
                        <span className="text-white/25">{step.detail}</span>
                      )}
                      {step.time && (
                        <span className="text-white/15 ml-auto shrink-0">{step.time}</span>
                      )}
                    </div>
                  </RevealItem>
                );

              case "response":
                return (
                  <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                    <div className="py-1 space-y-0.5">
                      {step.lines.map((line, j) => (
                        <div key={j} className="text-white/70 leading-[18px]">{line}</div>
                      ))}
                    </div>
                  </RevealItem>
                );

              case "subagents":
                return (
                  <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                    <div className="space-y-1.5 pl-5">
                      {step.agents.map((agent, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-purple-400/70 text-[8px]">&#x25CF;</span>
                          <span className="text-white/70">{agent.name}</span>
                          <span className="text-white/25">· {agent.status}</span>
                        </div>
                      ))}
                    </div>
                  </RevealItem>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 px-4 pb-3 pt-2 space-y-1.5 border-t border-white/[0.04] font-mono">
        {/* Input prompt */}
        <div className="flex items-center gap-1.5">
          <span className="text-lumon-mint text-[13px] font-bold">❯</span>
          <span className="text-white/20 text-[12px]">Ask, search, or run a command</span>
          <span className="w-[6px] h-[14px] bg-white/40 animate-pulse ml-0.5" />
        </div>

        {/* Status line */}
        <div className="flex items-center gap-0 text-[10px] leading-none">
          <span className="text-white/40">cli</span>
          <span className="text-white/10 mx-1.5">|</span>
          <span className="text-purple-400/70">Opus 4.6</span>
          <span className="text-white/10 mx-1.5">|</span>
          <span className="flex items-center gap-1">
            <span className="flex h-[6px] w-12 rounded-full overflow-hidden bg-white/[0.06]">
              <span
                className="h-full rounded-full bg-white/20 transition-[width] duration-[2s] ease-linear"
                style={{ width: isWorking ? "82%" : "69%" }}
              />
            </span>
            <span className="text-white/25">{isWorking ? "82%" : "69%"}</span>
          </span>
          <span className="text-white/10 mx-1.5">|</span>
          <span className="text-white/30">(</span>
          <span className="text-yellow-400/60">master</span>
          <span className="text-white/15 mx-0.5">|</span>
          <span className="text-white/30">{fileStats.files} files</span>
          <span className="text-green-400/50 ml-1">+{fileStats.added}</span>
          <span className="text-red-400/50 ml-0.5">-{fileStats.removed}</span>
          <span className="text-white/30">)</span>
        </div>

        {/* Codevator status */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {isWorking ? (
            <>
              <span className="text-lumon-mint/60 animate-pulse">&#x25C9;</span>
              <span className="text-lumon-mint/40">elevator mode · playing</span>
            </>
          ) : (
            <>
              <span className="text-white/15">&#x25C9;</span>
              <span className="text-white/20">elevator mode · volume 70%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
