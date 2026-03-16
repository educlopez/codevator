"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";

/* ───────────────────────────────────────────
   3D Retro Macintosh — CSS-only, Tailwind
   Inspired by Severance / The Office
   ─────────────────────────────────────────── */

// --- Keyboard (full Mac Classic II layout) ---

type KbKey = { label: string; w?: number; h?: number; animate?: boolean };

const KB_ROWS: KbKey[][] = [
  // Row 0: Esc + number row + Backspace  (target ~430px with gaps)
  [
    { label: "esc", w: 27 },
    { label: "1", w: 26 }, { label: "2", w: 26 }, { label: "3", w: 26 },
    { label: "4", w: 26 }, { label: "5", w: 26 }, { label: "6", w: 26 },
    { label: "7", w: 26 }, { label: "8", w: 26 }, { label: "9", w: 26 },
    { label: "0", w: 26 }, { label: "-", w: 26 }, { label: "=", w: 26 },
    { label: "⌫", w: 39 },
  ],
  // Row 1: Tab + QWERTY + backslash
  [
    { label: "tab", w: 40 },
    { label: "Q", w: 26, animate: true }, { label: "W", w: 26, animate: true }, { label: "E", w: 26, animate: true },
    { label: "R", w: 26, animate: true }, { label: "T", w: 26, animate: true }, { label: "Y", w: 26, animate: true },
    { label: "U", w: 26, animate: true }, { label: "I", w: 26, animate: true }, { label: "O", w: 26, animate: true },
    { label: "P", w: 26, animate: true }, { label: "[", w: 26 }, { label: "]", w: 26 },
    { label: "\\", w: 26 },
  ],
  // Row 2: Caps + ASDF + Return
  [
    { label: "caps", w: 47 },
    { label: "A", w: 26, animate: true }, { label: "S", w: 26, animate: true }, { label: "D", w: 26, animate: true },
    { label: "F", w: 26, animate: true }, { label: "G", w: 26, animate: true }, { label: "H", w: 26, animate: true },
    { label: "J", w: 26, animate: true }, { label: "K", w: 26, animate: true }, { label: "L", w: 26, animate: true },
    { label: ";", w: 26 }, { label: "'", w: 26 },
    { label: "return", w: 51 },
  ],
  // Row 3: Shift + ZXCV + Shift
  [
    { label: "shift", w: 60 },
    { label: "Z", w: 26, animate: true }, { label: "X", w: 26, animate: true }, { label: "C", w: 26, animate: true },
    { label: "V", w: 26, animate: true }, { label: "B", w: 26, animate: true }, { label: "N", w: 26, animate: true },
    { label: "M", w: 26, animate: true }, { label: ",", w: 26 }, { label: ".", w: 26 },
    { label: "/", w: 26 },
    { label: "shift", w: 60 },
  ],
  // Row 4: Space bar row
  [
    { label: "ctrl", w: 36 },
    { label: "⌥", w: 36 },
    { label: "⌘", w: 36 },
    { label: "", w: 170 }, // space bar
    { label: "⌘", w: 36 },
    { label: "⌥", w: 36 },
    { label: "←", w: 26 },
    { label: "→", w: 26 },
  ],
];

const KEY_BG = "#ECE8DA";
const KEY_SHADOW = "0 3px 0 #C4C0B3, 0 4px 4px rgba(0,0,0,0.12)";

function Keyboard() {
  return (
    <div
      className="absolute"
      style={{
        width: "440px",
        height: "130px",
        top: "442px",
        left: "-40px",
        transformStyle: "preserve-3d",
        transformOrigin: "top center",
        transform: "translateZ(100px) rotateX(66deg)",
      }}
    >
      {/* Keyboard top surface */}
      <div
        className="absolute inset-0 rounded-[4px]"
        style={{
          background: "linear-gradient(135deg, #E8E4D6 0%, #DDD9CB 100%)",
          boxShadow:
            "inset 1px 1px 2px rgba(255,255,255,0.5), inset -3px -3px 10px rgba(0,0,0,0.08)",
          transform: "translateZ(8px)",
        }}
      >
        {/* Keys grid */}
        <div className="flex flex-col items-center gap-[3px] px-1 py-1.5">
          {KB_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-[3px]">
              {row.map((key, ki) => {
                const w = key.w ?? 24;
                const isSpace = key.label === "" && w > 100;
                const isModifier = ["esc", "tab", "caps", "shift", "return", "ctrl", "⌥", "⌘"].includes(key.label);
                const delay = key.animate ? ((ri * 10 + ki * 7 + 3) % 17) * 0.3 : 0;
                const duration = key.animate ? 1.2 + ((ri * 3 + ki * 5) % 7) * 0.15 : 0;
                return (
                  <div
                    key={`${ri}-${ki}`}
                    className={`flex items-center justify-center rounded-[3px] font-mono text-stone-500/70 ${key.animate ? "motion-safe:animate-[typeKey_var(--dur)_ease-in-out_var(--delay)_infinite]" : ""}`}
                    style={
                      {
                        width: `${w}px`,
                        height: isSpace ? "22px" : "20px",
                        fontSize: isModifier ? "5.5px" : "6.5px",
                        background: isSpace
                          ? "linear-gradient(180deg, #ECE8DA 0%, #E4E0D2 100%)"
                          : KEY_BG,
                        boxShadow: KEY_SHADOW,
                        letterSpacing: isModifier ? "0.3px" : undefined,
                        ...(key.animate
                          ? {
                              "--delay": `${delay}s`,
                              "--dur": `${duration}s`,
                              animationDelay: `${delay}s`,
                              animationDuration: `${duration}s`,
                            }
                          : {}),
                      } as React.CSSProperties
                    }
                  >
                    {key.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Keyboard inner edge groove */}
        <div
          className="absolute inset-[2px] rounded-[3px] pointer-events-none"
          style={{
            boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 2px rgba(255,255,255,0.3)",
          }}
        />
      </div>

      {/* Keyboard front edge */}
      <div
        className="absolute left-0 w-full"
        style={{
          height: "16px",
          bottom: "0",
          background: "linear-gradient(180deg, #cdc9bb 0%, #b5b1a3 100%)",
          transformOrigin: "bottom center",
          transform: "translateZ(8px) rotateX(90deg)",
          borderRadius: "0 0 3px 3px",
        }}
      />
      {/* Keyboard back edge */}
      <div
        className="absolute left-0 w-full"
        style={{
          height: "16px",
          top: "0",
          background: "linear-gradient(180deg, #e5e1d4 0%, #c9c5b8 100%)",
          transformOrigin: "top center",
          transform: "translateZ(8px) rotateX(-90deg)",
          borderRadius: "3px 3px 0 0",
        }}
      />
      {/* Keyboard left edge */}
      <div
        className="absolute top-0"
        style={{
          width: "16px",
          height: "100%",
          left: "0",
          background: "linear-gradient(180deg, #d1cdbf 0%, #b7b3a6 100%)",
          transformOrigin: "left center",
          transform: "translateZ(8px) rotateY(90deg)",
        }}
      />
      {/* Keyboard right edge */}
      <div
        className="absolute top-0"
        style={{
          width: "16px",
          height: "100%",
          right: "0",
          background: "linear-gradient(180deg, #d1cdbf 0%, #b7b3a6 100%)",
          transformOrigin: "right center",
          transform: "translateZ(8px) rotateY(-90deg)",
        }}
      />

      {/* Coiled cable coming from back-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "60px",
          height: "8px",
          top: "-6px",
          left: "30px",
          background: "linear-gradient(90deg, #B0ADA0, #9E9B8E 40%, #B0ADA0)",
          borderRadius: "4px",
          transform: "translateZ(4px)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.15)",
        }}
      />

      {/* Keyboard shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "90%",
          height: "60%",
          bottom: "-10px",
          left: "5%",
          transformOrigin: "top center",
          transform: "rotateX(-156deg) translateZ(10px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}

// --- Stickers (colorful, prominent) ---

function StickerBall() {
  return (
    <div
      className="absolute z-10"
      style={{
        width: "40px",
        height: "40px",
        background: "#C05621",
        borderRadius: "50%",
        bottom: "90px",
        right: "20px",
        transform: "translateZ(101px) rotate(-10deg)",
        boxShadow: "1px 1px 3px rgba(0,0,0,0.25)",
        backgroundImage:
          "radial-gradient(circle at 12px 12px, rgba(255,255,255,0.25) 3px, transparent 4px), linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.15) 45%, transparent 45%)",
      }}
    />
  );
}

function StickerStar() {
  return (
    <div
      className="absolute z-10 flex items-center justify-center"
      style={{
        width: "45px",
        height: "45px",
        background: "#fff",
        borderRadius: "8px",
        bottom: "100px",
        left: "25px",
        transform: "translateZ(102px) rotate(15deg)",
        boxShadow: "1px 1px 3px rgba(0,0,0,0.25)",
      }}
    >
      <span className="text-blue-700 text-2xl">&#9733;</span>
    </div>
  );
}

function StickerText() {
  return (
    <div
      className="absolute z-10 flex items-center justify-center text-center font-mono font-bold"
      style={{
        width: "68px",
        height: "32px",
        background: "#8B0000",
        color: "#F0E68C",
        fontSize: "6.5px",
        letterSpacing: "0.5px",
        lineHeight: "1.3",
        bottom: "68px",
        right: "30px",
        transform: "translateZ(101px) rotate(-2deg)",
        boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      DEPT OF
      <br />
      AMBIENT MUSIC
    </div>
  );
}

function StickerPostIt() {
  return (
    <div
      className="absolute z-10 font-handwriting"
      style={{
        width: "80px",
        padding: "6px 8px",
        background: "#FFF9C4",
        fontSize: "8px",
        lineHeight: "1.3",
        color: "rgba(120, 80, 20, 0.7)",
        bottom: "30px",
        right: "100px",
        transform: "translateZ(101px) rotate(3deg)",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      Please enjoy each sound equally
      <div className="text-right mt-1 opacity-60" style={{ fontSize: "7px" }}>
        — Mgmt.
      </div>
    </div>
  );
}


// --- Compact CRT Terminal (fits 260x200 screen) ---

type CrtStep =
  | { type: "input"; text: string }
  | { type: "line"; text: string; color?: string }
  | { type: "codevator"; mode: string; label: string };

type RawCrtStep = CrtStep | { type: "delay"; ms: number };

const MODE_COLORS: Record<string, string> = {
  elevator: "#7dcea0",
  retro: "#c98fd0",
  ambient: "#82bdd4",
};

const CRT_SEQUENCES: RawCrtStep[][] = [
  [
    { type: "input", text: "> npx codevator" },
    { type: "delay", ms: 800 },
    { type: "line", text: "  hooks configured" },
    { type: "delay", ms: 500 },
    { type: "codevator", mode: "elevator", label: "elevator mode · ready" },
    { type: "delay", ms: 1200 },
    { type: "input", text: "> add dark mode support" },
    { type: "delay", ms: 600 },
    { type: "codevator", mode: "elevator", label: "elevator · playing" },
    { type: "delay", ms: 700 },
    { type: "line", text: "  Edit src/theme.ts (+18 -4)" },
    { type: "delay", ms: 500 },
    { type: "line", text: "  Run  tests — 8 passed" },
    { type: "delay", ms: 600 },
    { type: "line", text: "  Done. Dark mode added." },
    { type: "delay", ms: 400 },
    { type: "codevator", mode: "elevator", label: "elevator · paused" },
  ],
  [
    { type: "input", text: "> refactor auth to JWT" },
    { type: "delay", ms: 600 },
    { type: "codevator", mode: "retro", label: "retro · playing" },
    { type: "delay", ms: 700 },
    { type: "line", text: "  Read src/auth/session.ts" },
    { type: "delay", ms: 500 },
    { type: "line", text: "  Edit session.ts (+34 -18)" },
    { type: "delay", ms: 500 },
    { type: "line", text: "  Run  tests — 14 passed" },
    { type: "delay", ms: 600 },
    { type: "line", text: "  Done. Migrated to JWT." },
    { type: "delay", ms: 400 },
    { type: "codevator", mode: "retro", label: "retro · paused" },
  ],
  [
    { type: "input", text: "> optimize API responses" },
    { type: "delay", ms: 600 },
    { type: "codevator", mode: "ambient", label: "ambient · playing" },
    { type: "delay", ms: 700 },
    { type: "line", text: "  Read src/api/routes.ts" },
    { type: "delay", ms: 500 },
    { type: "line", text: "  Edit queries.ts (+15 -8)" },
    { type: "delay", ms: 500 },
    { type: "line", text: "  Bench — 2.1x faster" },
    { type: "delay", ms: 600 },
    { type: "line", text: "  Done. API 2.1x faster." },
    { type: "delay", ms: 400 },
    { type: "codevator", mode: "ambient", label: "ambient · paused" },
  ],
];

function buildCrtTimeline(sequence: RawCrtStep[]) {
  const steps: CrtStep[] = [];
  const times: number[] = [];
  let elapsed = 400;
  for (const item of sequence) {
    if (item.type === "delay") {
      elapsed += item.ms;
    } else {
      steps.push(item);
      times.push(elapsed);
      elapsed += 100;
    }
  }
  return { steps, times, total: elapsed };
}

const CRT_TIMELINES = CRT_SEQUENCES.map(buildCrtTimeline);

function CrtReveal({ children, revealed }: { children: ReactNode; revealed: boolean }) {
  return (
    <div style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.3s ease-out" }}>
      {children}
    </div>
  );
}

function CrtTerminal() {
  const [elapsed, setElapsed] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const [phase, setPhase] = useState<"playing" | "fading-out" | "fading-in">("fading-in");
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const fadeRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevCount = useRef(0);

  const idx = loopKey % CRT_TIMELINES.length;
  const { steps, times, total } = CRT_TIMELINES[idx];

  const startLoop = useCallback(() => {
    startRef.current = performance.now();
    setElapsed(0);
    setPhase("fading-in");
    fadeRef.current = setTimeout(() => setPhase("playing"), 500);

    const tl = CRT_TIMELINES[loopKey % CRT_TIMELINES.length];
    function tick() {
      const ms = performance.now() - startRef.current;
      setElapsed(ms);
      if (ms > tl.total + 3000) {
        setPhase("fading-out");
        fadeRef.current = setTimeout(() => setLoopKey((k) => k + 1), 800);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [loopKey]);

  useEffect(() => {
    startLoop();
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(fadeRef.current); };
  }, [loopKey, startLoop]);

  let revealed = 0;
  for (const t of times) { if (elapsed >= t) revealed++; }

  useEffect(() => {
    if (revealed > prevCount.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
    prevCount.current = revealed;
  }, [revealed]);

  useEffect(() => { prevCount.current = 0; if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [loopKey]);

  const opacity = phase === "fading-out" ? 0 : 1;

  return (
    <div
      className="w-full h-full flex flex-col font-mono text-[10px] leading-[14px] text-white/80"
      style={{ opacity, transition: phase === "fading-out" ? "opacity 0.8s" : "opacity 0.5s" }}
    >
      {/* Title bar */}
      <div className="flex items-center h-4 px-2 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-[3px]">
          <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
          <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
          <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
        </div>
        <span className="mx-auto text-[8px] text-white/40">your-agent</span>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-hidden px-2 pt-1.5 pb-1" style={{ scrollbarWidth: "none" }}>
        {steps.map((step, i) => {
          const show = elapsed >= times[i];
          switch (step.type) {
            case "input":
              return (
                <CrtReveal key={`${loopKey}-${i}`} revealed={show}>
                  <div className="text-white/90 mt-1">{step.text}</div>
                </CrtReveal>
              );
            case "line":
              return (
                <CrtReveal key={`${loopKey}-${i}`} revealed={show}>
                  <div className="text-white/55">{step.text}</div>
                </CrtReveal>
              );
            case "codevator": {
              const color = MODE_COLORS[step.mode] || "#7dcea0";
              const playing = step.label.includes("playing");
              return (
                <CrtReveal key={`${loopKey}-${i}`} revealed={show}>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={playing ? "animate-pulse" : ""} style={{ color, fontSize: "10px" }}>&#x266B;</span>
                    <span style={{ color: step.label.includes("paused") ? "rgba(255,255,255,0.3)" : `${color}cc` }}>
                      {step.label}
                    </span>
                  </div>
                </CrtReveal>
              );
            }
            default:
              return null;
          }
        })}
      </div>

      {/* Bottom prompt */}
      <div className="shrink-0 px-2 pb-1 flex items-center gap-1">
        <span className="text-[#7dcea0] text-[10px] font-bold">&#x276F;</span>
        <span className="w-[4px] h-[10px] bg-white/40 animate-pulse" />
      </div>
    </div>
  );
}

// --- CRT Screen ---

function Screen() {
  return (
    <div
      className="relative mx-auto overflow-hidden crt-glow"
      style={{
        width: "260px",
        height: "200px",
        background: "#222529",
        borderRadius: "40% 40% 40% 40% / 8% 8% 8% 8%",
        boxShadow: "inset 0 0 20px rgba(0,0,0,1)",
      }}
    >
      {/* Terminal content */}
      <div className="absolute inset-[10px] overflow-hidden" style={{ borderRadius: "12px" }}>
        <CrtTerminal />
      </div>

      {/* Scan lines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))",
          backgroundSize: "100% 2px, 3px 100%",
          borderRadius: "inherit",
        }}
      />

      {/* Scan sweep */}
      <div
        className="absolute inset-x-0 h-8 z-10 pointer-events-none opacity-[0.03] bg-gradient-to-b from-transparent via-white to-transparent motion-safe:animate-[scanline_6s_linear_infinite]"
      />

      {/* Screen glare */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.03) 100%)",
          borderRadius: "inherit",
        }}
      />

      {/* CRT vignette */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
          borderRadius: "inherit",
        }}
      />
    </div>
  );
}

// --- Right-side stickers (wrapper matches right face transform) ---

function RightFaceStickers() {
  return (
    <div
      className="absolute"
      style={{
        width: "200px",
        height: "440px",
        top: 0,
        left: 0,
        transformStyle: "preserve-3d",
        transform: "rotateY(90deg) translateZ(261px)",
        pointerEvents: "none",
      }}
    >
      {/* Orange post-it — Severance ref */}
      <div
        className="absolute z-10 font-handwriting"
        style={{
          width: "90px",
          padding: "8px 10px",
          background: "#FFE0B2",
          fontSize: "8px",
          lineHeight: "1.35",
          color: "rgba(100, 60, 10, 0.75)",
          top: "60px",
          left: "50px",
          transform: "rotate(-4deg)",
          boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        Your outie enjoys the music selection.
        <div className="text-right mt-1 opacity-50" style={{ fontSize: "7px" }}>
          — O&amp;D
        </div>
      </div>

      {/* Green wellness sticker */}
      <div
        className="absolute z-10 flex items-center justify-center text-center font-mono font-bold"
        style={{
          width: "72px",
          height: "28px",
          background: "#2E7D32",
          color: "#C8E6C9",
          fontSize: "6px",
          letterSpacing: "0.8px",
          lineHeight: "1.3",
          top: "190px",
          left: "20px",
          transform: "rotate(2deg)",
          boxShadow: "1px 1px 3px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "3px",
        }}
      >
        WELLNESS
        <br />
        SESSION
      </div>

      {/* Heart sticker */}
      <div
        className="absolute z-10"
        style={{
          width: "32px",
          height: "32px",
          top: "250px",
          left: "110px",
          transform: "rotate(12deg)",
        }}
      >
        <svg viewBox="0 0 32 32" width="32" height="32">
          <path
            d="M16 28s-11-7.2-11-15c0-4.4 3.6-8 8-8 2.8 0 5.2 1.4 6.6 3.6L16 12l-3.6-3.4C13.8 6.4 16.2 5 19 5c4.4 0 8 3.6 8 8 0 7.8-11 15-11 15z"
            fill="#E91E63"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Blue post-it — Michael Scott nod */}
      <div
        className="absolute z-10 font-handwriting"
        style={{
          width: "70px",
          padding: "6px 7px",
          background: "#E1F5FE",
          fontSize: "7.5px",
          lineHeight: "1.3",
          color: "rgba(30, 60, 90, 0.7)",
          top: "320px",
          left: "60px",
          transform: "rotate(5deg)",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        music = focus
        <div className="text-right opacity-50" style={{ fontSize: "6.5px" }}>
          — D. Scott
        </div>
      </div>
    </div>
  );
}

// --- Vent Grill (right side face — dot pattern like original Mac) ---

function VentGrill() {
  return (
    <div
      className="absolute"
      style={{
        width: "200px",
        height: "440px",
        top: 0,
        left: 0,
        transform: "rotateY(90deg) translateZ(261px)",
        pointerEvents: "none",
      }}
    >
      {/* Vent dot grid — bottom-right area of side face */}
      <div
        className="absolute"
        style={{
          bottom: "40px",
          right: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(8, 4px)",
          gridTemplateRows: "repeat(12, 4px)",
          gap: "3px",
        }}
      >
        {Array.from({ length: 96 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.12)",
              boxShadow: "inset 0.5px 0.5px 1px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// --- Main Component ---

export default function RetroComputer() {
  return (
    <div
      className="relative flex items-center justify-center h-[280px] sm:h-[400px] lg:h-[500px]"
      style={{
        perspective: "2000px",
        width: "100%",
      }}
    >
      <div
        className="group relative"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s ease-out",
        }}
      >
        {/* Scene — rotated, with hover interaction */}
        <div
          className="relative group-hover:[transform:rotateY(-5deg)_rotateX(2deg)] transition-transform duration-500 ease-out scale-[0.5] sm:scale-[0.7] lg:scale-100"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateY(-15deg) rotateX(5deg)",
          }}
        >
          {/* Computer unit */}
          <div
            className="relative"
            style={{
              width: "360px",
              height: "440px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* === FRONT FACE === */}
            <div
              className="absolute flex flex-col items-center"
              style={{
                width: "360px",
                height: "440px",
                transform: "translateZ(100px)",
                background: "linear-gradient(135deg, #F0EDE0 0%, #E0DCCF 100%)",
                boxShadow:
                  "inset 2px 2px 5px rgba(255,255,255,0.8), inset -5px -5px 15px rgba(0,0,0,0.1)",
                paddingTop: "35px",
              }}
            >
              {/* Screen inset / bezel */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: "290px",
                  height: "230px",
                  background: "#D1CEC7",
                  borderRadius: "14px",
                  boxShadow:
                    "inset 3px 3px 10px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <Screen />
              </div>

              {/* Chin divider seam */}
              <div
                className="absolute left-[20px] right-[20px]"
                style={{
                  top: "285px",
                  height: "2px",
                  background: "linear-gradient(to right, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.5)",
                }}
              />

              {/* Chin area — branding + floppy */}
              <div className="absolute bottom-0 left-0 right-0" style={{ top: "287px" }}>
                {/* Floppy drive slot */}
                <div
                  className="mx-auto"
                  style={{
                    width: "160px",
                    height: "10px",
                    marginTop: "24px",
                    background: "linear-gradient(180deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)",
                    borderRadius: "2px",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                />

                {/* Apple logo + Codevator branding */}
                <div className="flex items-center gap-2 absolute" style={{ bottom: "28px", left: "30px" }}>
                  {/* Rainbow Apple logo */}
                  <div
                    style={{
                      width: "16px",
                      height: "20px",
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background:
                        "linear-gradient(180deg, #63B548 0%, #63B548 16.6%, #F6C829 16.6%, #F6C829 33.3%, #E57D25 33.3%, #E57D25 50%, #D83335 50%, #D83335 66.6%, #9C4595 66.6%, #9C4595 83.3%, #468CCF 83.3%, #468CCF 100%)",
                      boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.15)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-5px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "2px",
                        height: "6px",
                        background: "#5a3e28",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: "13px",
                      fontWeight: 300,
                      letterSpacing: "0.5px",
                      color: "#8a8579",
                    }}
                  >
                    Codevator
                  </span>
                </div>
              </div>
            </div>

            {/* === BACK FACE === */}
            <div
              className="absolute"
              style={{
                width: "360px",
                height: "440px",
                transform: "translateZ(-100px) rotateY(180deg)",
                background: "#C4C0B3",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            />

            {/* === LEFT FACE === */}
            <div
              className="absolute"
              style={{
                width: "200px",
                height: "440px",
                transform: "rotateY(-90deg) translateZ(100px)",
                background: "#E0DCCF",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "inset 10px 0 20px rgba(0,0,0,0.05)",
              }}
            />

            {/* === RIGHT FACE === */}
            <div
              className="absolute"
              style={{
                width: "200px",
                height: "440px",
                transform: "rotateY(90deg) translateZ(260px)",
                background: "#C4C0B3",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "inset 10px 0 20px rgba(0,0,0,0.1)",
              }}
            />

            {/* === TOP FACE === */}
            <div
              className="absolute"
              style={{
                width: "360px",
                height: "200px",
                transform: "rotateX(90deg) translateZ(100px)",
                background: "linear-gradient(180deg, #F5F2E6 0%, #EBE8DB 100%)",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "inset 0 0 20px rgba(255,255,255,0.3)",
              }}
            />

            {/* === BOTTOM FACE === */}
            <div
              className="absolute"
              style={{
                width: "360px",
                height: "200px",
                transform: "rotateX(-90deg) translateZ(340px)",
                background: "#A09C8F",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 50px 80px rgba(0,0,0,0.3)",
              }}
            />

            {/* === FRONT BOTTOM LIP / FOOT === */}
            <div
              className="absolute"
              style={{
                width: "360px",
                height: "16px",
                bottom: "-1px",
                left: "0",
                transform: "translateZ(104px)",
                background: "linear-gradient(180deg, #E0DCCF 0%, #D4D0C3 100%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
                borderRadius: "0 0 3px 3px",
              }}
            />

            {/* === DECORATIVE ELEMENTS (on front face) === */}
            <StickerBall />
            <StickerStar />
            <StickerText />
            <StickerPostIt />

            {/* === DECORATIVE ELEMENTS (on right face) === */}
            <RightFaceStickers />
            <VentGrill />

            {/* === KEYBOARD ASSEMBLY === */}
            <Keyboard />
          </div>
        </div>
      </div>
    </div>
  );
}
