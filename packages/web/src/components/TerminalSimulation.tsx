"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

// --- Step definitions ---

type Step =
  | { type: "input"; text: string }
  | { type: "step"; label: string; detail?: string; time?: string }
  | { type: "response"; text: string }
  | { type: "subagents"; agents: { name: string; status: string }[] }
  | { type: "codevator"; mode: string; status: "ready" | "playing" | "switched" | "paused" };

type RawStep = Step | { type: "delay"; ms: number };

const MODE_COLORS: Record<string, string> = {
  elevator: "#7dcea0",
  retro: "#c98fd0",
  ambient: "#82bdd4",
};

// --- Sequences (trimmed to fit ~310px content area) ---

const SEQUENCES: RawStep[][] = [
  // Loop 1: Setup codevator + first task
  [
    { type: "input", text: "set up codevator for this project" },
    { type: "delay", ms: 700 },
    { type: "step", label: "Write", detail: "hooks configured", time: "1s" },
    { type: "delay", ms: 400 },
    { type: "codevator", mode: "elevator", status: "ready" },
    { type: "delay", ms: 1500 },
    { type: "input", text: "add dark mode support" },
    { type: "delay", ms: 500 },
    { type: "codevator", mode: "elevator", status: "playing" },
    { type: "delay", ms: 600 },
    { type: "step", label: "Edit", detail: "src/theme.ts (+18 -4)", time: "3s" },
    { type: "delay", ms: 400 },
    { type: "step", label: "Run", detail: "npm test — 8 passed", time: "2s" },
    { type: "delay", ms: 600 },
    { type: "response", text: "Done. Dark mode added with system detection." },
    { type: "delay", ms: 300 },
    { type: "codevator", mode: "elevator", status: "paused" },
  ],

  // Loop 2: Mode switch mid-work
  [
    { type: "input", text: "refactor auth to use JWT" },
    { type: "delay", ms: 500 },
    { type: "codevator", mode: "elevator", status: "playing" },
    { type: "delay", ms: 600 },
    { type: "step", label: "Read", detail: "src/auth/session.ts", time: "2s" },
    { type: "delay", ms: 500 },
    { type: "step", label: "Read", detail: "src/utils/crypto.ts", time: "1s" },
    { type: "delay", ms: 600 },
    { type: "input", text: "switch to retro mode" },
    { type: "delay", ms: 400 },
    { type: "codevator", mode: "retro", status: "switched" },
    { type: "delay", ms: 600 },
    { type: "step", label: "Edit", detail: "src/auth/session.ts (+34 -18)", time: "3s" },
    { type: "delay", ms: 400 },
    { type: "step", label: "Run", detail: "npm test — 14 passed", time: "3s" },
    { type: "delay", ms: 600 },
    { type: "response", text: "Done. Migrated to JWT. All 14 tests passing." },
    { type: "delay", ms: 300 },
    { type: "codevator", mode: "retro", status: "paused" },
  ],

  // Loop 3: Ambient + subagents
  [
    { type: "input", text: "optimize the API response times" },
    { type: "delay", ms: 500 },
    { type: "codevator", mode: "ambient", status: "playing" },
    { type: "delay", ms: 600 },
    { type: "step", label: "Read", detail: "src/api/routes.ts", time: "2s" },
    { type: "delay", ms: 500 },
    { type: "step", label: "Edit", detail: "src/db/queries.ts (+15 -8)", time: "2s" },
    { type: "delay", ms: 400 },
    { type: "step", label: "Run", detail: "npm run bench — 2.1x faster", time: "3s" },
    { type: "delay", ms: 500 },
    { type: "subagents", agents: [
      { name: "Types", status: "Updated 3 interfaces" },
      { name: "Docs", status: "Updated API docs" },
    ]},
    { type: "delay", ms: 600 },
    { type: "response", text: "Done. API responses are 2.1x faster." },
    { type: "delay", ms: 300 },
    { type: "codevator", mode: "ambient", status: "paused" },
  ],
];

// Pre-compute timelines
function buildTimeline(sequence: RawStep[]) {
  const steps: Step[] = [];
  const revealTimes: number[] = [];
  let elapsed = 400;

  for (const item of sequence) {
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

const TIMELINES = SEQUENCES.map(buildTimeline);

const FILE_STATS = [
  { files: 2, added: 24, removed: 5 },
  { files: 3, added: 55, removed: 27 },
  { files: 2, added: 37, removed: 19 },
];

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

export function TerminalSimulation() {
  const [elapsed, setElapsed] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const [phase, setPhase] = useState<"playing" | "fading-out" | "fading-in">("fading-in");
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const seqIndex = loopKey % TIMELINES.length;
  const { steps: STEPS, revealTimes: REVEAL_TIMES } = TIMELINES[seqIndex];
  const fileStats = FILE_STATS[seqIndex];

  const startLoop = useCallback(() => {
    startRef.current = performance.now();
    setElapsed(0);
    setPhase("fading-in");
    fadeTimerRef.current = setTimeout(() => setPhase("playing"), 700);

    const timeline = TIMELINES[loopKey % TIMELINES.length];

    function tick() {
      const ms = performance.now() - startRef.current;
      setElapsed(ms);

      if (ms > timeline.totalDuration + 3500) {
        setPhase("fading-out");
        fadeTimerRef.current = setTimeout(() => {
          setLoopKey((k) => k + 1);
        }, 1000);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [loopKey]);

  useEffect(() => {
    startLoop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, [loopKey, startLoop]);

  // Count revealed items and scroll when new ones appear
  let revealedCount = 0;
  for (const t of REVEAL_TIMES) {
    if (elapsed >= t) revealedCount++;
  }

  const prevCountRef = useRef(0);
  useEffect(() => {
    if (revealedCount > prevCountRef.current) {
      prevCountRef.current = revealedCount;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
    }
  }, [revealedCount]);

  // Reset scroll on loop change
  useEffect(() => {
    prevCountRef.current = 0;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [loopKey]);

  // Derive codevator state from revealed steps
  let currentMode = "elevator";
  let currentStatus: "idle" | "ready" | "playing" | "switched" | "paused" = "idle";
  for (let i = 0; i < STEPS.length; i++) {
    if (elapsed >= REVEAL_TIMES[i] && STEPS[i].type === "codevator") {
      const cv = STEPS[i] as Extract<Step, { type: "codevator" }>;
      currentMode = cv.mode;
      currentStatus = cv.status;
    }
  }

  const isWorking = currentStatus === "playing" || currentStatus === "switched";
  const modeColor = MODE_COLORS[currentMode] || "#1a6b4a";

  const contentOpacity = phase === "fading-out" ? 0 : 1;
  const contentTransition = phase === "fading-out" ? "opacity 1s ease-in-out" : "opacity 0.7s ease-out";

  return (
    <div
      className="w-full max-w-2xl rounded-[10px] overflow-hidden select-none flex flex-col bg-[#0e0e0e]"
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
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] text-white/50">
          lumon-terminal
        </span>
      </div>

      {/* Scrollable content area with top fade */}
      <div className="relative flex-1 min-h-0" style={{ opacity: contentOpacity, transition: contentTransition }}>
        {/* Top fade gradient — softens scroll clipping */}
        <div
          className="absolute top-0 left-0 right-0 h-5 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #0e0e0e, transparent)" }}
        />

        <div
          ref={scrollRef}
          className="h-full font-mono text-[12px]"
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div className="px-4 pt-4 pb-2 space-y-2">
            {STEPS.map((step, i) => {
              const revealed = elapsed >= REVEAL_TIMES[i];

              switch (step.type) {
                case "input":
                  return (
                    <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                      <div className="border border-white/[0.08] px-3 py-1.5 text-white/90 rounded-sm">
                        {step.text}
                      </div>
                    </RevealItem>
                  );

                case "step":
                  return (
                    <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                      <div className="flex items-start gap-2">
                        <span className="text-olive-300 text-[8px] leading-[18px]">&#x25CF;</span>
                        <span className="text-white/70">{step.label}</span>
                        {step.detail && (
                          <span className="text-white/50">{step.detail}</span>
                        )}
                        {step.time && (
                          <span className="text-white/30 ml-auto shrink-0">{step.time}</span>
                        )}
                      </div>
                    </RevealItem>
                  );

                case "response":
                  return (
                    <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                      <div className="text-white/80 leading-[18px] py-0.5">{step.text}</div>
                    </RevealItem>
                  );

                case "subagents":
                  return (
                    <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                      <div className="space-y-1 pl-5">
                        {step.agents.map((agent, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-olive-300/70 text-[8px]">&#x25CF;</span>
                            <span className="text-white/70">{agent.name}</span>
                            <span className="text-white/50">· {agent.status}</span>
                          </div>
                        ))}
                      </div>
                    </RevealItem>
                  );

                case "codevator": {
                  const color = MODE_COLORS[step.mode] || "#1a6b4a";
                  let label = "";
                  let pulse = false;
                  switch (step.status) {
                    case "ready":
                      label = `${step.mode} mode · ready`;
                      break;
                    case "playing":
                      label = `${step.mode} mode · playing`;
                      pulse = true;
                      break;
                    case "switched":
                      label = `switched to ${step.mode}`;
                      pulse = true;
                      break;
                    case "paused":
                      label = `${step.mode} mode · paused`;
                      break;
                  }
                  return (
                    <RevealItem key={`${loopKey}-${i}`} revealed={revealed}>
                      <div className="flex items-center gap-1.5">
                        <span className={pulse ? "animate-pulse" : ""} style={{ color }}>&#x266B;</span>
                        <span style={{ color: step.status === "paused" ? "rgba(255,255,255,0.35)" : `${color}cc` }}>
                          {label}
                        </span>
                      </div>
                    </RevealItem>
                  );
                }

                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 px-4 pb-3 pt-2 space-y-1.5 border-t border-white/[0.04] font-mono">
        {/* Input prompt */}
        <div className="flex items-center gap-1.5">
          <span className="text-olive-300 text-[13px] font-bold">&#x276F;</span>
          <span className="text-white/35 text-[12px]">Ask, search, or run a command</span>
          <span className="w-[6px] h-[14px] bg-white/40 animate-pulse ml-0.5" />
        </div>

        {/* Status line */}
        <div className="flex items-center gap-0 text-[10px] leading-none">
          <span className="text-white/50">cli</span>
          <span className="text-white/20 mx-1.5">|</span>
          <span className="text-olive-300/80">Opus 4.6</span>
          <span className="text-white/20 mx-1.5">|</span>
          <span className="flex items-center gap-1">
            <span className="flex h-[6px] w-12 rounded-full overflow-hidden bg-white/[0.08]">
              <span
                className="h-full rounded-full bg-white/25 transition-[width] duration-[2s] ease-linear"
                style={{ width: isWorking ? "82%" : "69%" }}
              />
            </span>
            <span className="text-white/40">{isWorking ? "82%" : "69%"}</span>
          </span>
          <span className="text-white/20 mx-1.5">|</span>
          <span className="text-white/40">(</span>
          <span className="text-olive-300/70">main</span>
          <span className="text-white/25 mx-0.5">|</span>
          <span className="text-white/40">{fileStats.files} files</span>
          <span className="text-green-400/60 ml-1">+{fileStats.added}</span>
          <span className="text-red-400/60 ml-0.5">-{fileStats.removed}</span>
          <span className="text-white/40">)</span>
        </div>

        {/* Codevator status — reflects current mode dynamically */}
        <div className="flex items-center gap-1.5 text-[10px] transition-colors duration-500">
          {isWorking ? (
            <>
              <span className="animate-pulse" style={{ color: modeColor }}>&#x25C9;</span>
              <span style={{ color: `${modeColor}88` }}>{currentMode} mode · playing</span>
            </>
          ) : currentStatus === "paused" ? (
            <>
              <span style={{ color: `${modeColor}80` }}>&#x25C9;</span>
              <span className="text-white/35">{currentMode} mode · paused</span>
            </>
          ) : (
            <>
              <span className="text-white/30">&#x25C9;</span>
              <span className="text-white/35">elevator mode · volume 70%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
