"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { noisePattern } from "@/lib/patterns";

function Accent({ color, children }: { color: string; children: ReactNode }) {
  return <span style={{ color }}>{children}</span>;
}

function StepCard({
  number,
  title,
  description,
  gradientFrom,
  gradientTo,
  lines,
  visible,
  cardDelay,
}: {
  number: number;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  lines: ReactNode[];
  visible: boolean;
  cardDelay: number;
}) {
  return (
    <div className="rounded-lg overflow-hidden bg-olive-950/[0.025] flex flex-col">
      {/* Text */}
      <div className="flex flex-col gap-4 p-6 sm:p-10 lg:p-6">
        <div className="w-10 h-10 rounded-full bg-olive-950 text-white flex items-center justify-center font-semibold shrink-0">
          {number}
        </div>
        <h3 className="font-display text-xl text-olive-950">{title}</h3>
        <p className="text-sm/7 text-olive-700">{description}</p>
      </div>

      {/* Terminal with wallpaper */}
      <div className="relative mt-auto">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` }}
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundPosition: "center", backgroundImage: noisePattern }}
        />
        <div className="relative z-10 px-4 pt-4">
          <div className="rounded-t-[10px] overflow-hidden bg-[#0e0e0e]" style={{ boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center h-7 px-2.5 bg-[#161616] border-b border-white/[0.06]">
              <div className="flex items-center gap-[6px]">
                <span className="w-[10px] h-[10px] rounded-full bg-white/[0.15]" />
                <span className="w-[10px] h-[10px] rounded-full bg-white/[0.15]" />
                <span className="w-[10px] h-[10px] rounded-full bg-white/[0.15]" />
              </div>
            </div>
            <div className="p-4 font-mono text-[12px] leading-[18px] space-y-1">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="transition-all duration-500 ease-out"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: visible ? `${cardDelay + i * 200}ms` : "0ms",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Floor3Install() {
  const blue = "#82bdd4";
  const purple = "#c98fd0";
  const brown = "#d49a6e";
  const [visible, setVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="get-started" className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10 scroll-mt-20">
      <div className="flex flex-col gap-10 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm/7 font-semibold text-olive-700">
            Get Started
          </p>
          <h2 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            Up and running before the doors close.
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          <StepCard
            number={1}
            title="Hook it up"
            description="One command sets up the hooks. Works with Claude Code, Codex, Gemini CLI, Copilot, Cursor, Windsurf, and OpenCode — no config files, no setup wizards."
            gradientFrom="#637c86"
            gradientTo="#778599"
            visible={visible}
            cardDelay={0}
            lines={[
              <p key="a"><span className="text-white/60">$</span> <span className="text-white/90">npx codevator</span></p>,
              <p key="b"><Accent color={blue}>┌</Accent> <span className="text-white/70 bg-cyan-600/30 px-1 rounded-sm">codevator</span></p>,
              <p key="c"><Accent color={blue}>◇</Accent> <span className="text-white/70">Hooks configured in ~/.claude/settings.json</span></p>,
              <p key="d"><Accent color={blue}>└</Accent> <span className="text-white/50">Installed! Default mode: elevator</span></p>,
            ]}
          />

          <StepCard
            number={2}
            title="Let it ride"
            description="Music plays while your agent works. Stops when it's done. You do nothing — that's the whole point."
            gradientFrom="#7b627d"
            gradientTo="#8f6976"
            visible={visible}
            cardDelay={300}
            lines={[
              <p key="a" className="text-white/50">&gt; claude-code</p>,
              <p key="b" className="flex items-center gap-1.5"><Accent color={purple}>&#x25CF;</Accent> <span className="text-white/70">Read</span> <span className="text-white/50">src/auth/session.ts</span></p>,
              <p key="c" className="flex items-center gap-1.5"><Accent color={purple}>&#x25CF;</Accent> <span className="text-white/70">Edit</span> <span className="text-white/50">middleware.ts (+21)</span></p>,
              <div key="d" className="flex items-center gap-1.5 mt-1"><Accent color={purple}>&#x25C9;</Accent> <span className="text-white/60">elevator · playing</span></div>,
            ]}
          />

          <StepCard
            number={3}
            title="Make it yours"
            description="Switch modes, pick a random sound from a category, adjust volume, or tell your agent directly. On macOS, the menubar app gives you visual controls."
            gradientFrom="#8d7359"
            gradientTo="#765959"
            visible={visible}
            cardDelay={600}
            lines={[
              <p key="a"><span className="text-white/60">$</span> <span className="text-white/90">npx codevator --random --category nature</span></p>,
              <p key="b"><Accent color={brown}>└</Accent> <span className="text-white/70">Mode set to: <Accent color={brown}>ocean</Accent></span></p>,
              <p key="c" className="mt-1"><span className="text-white/60">$</span> <span className="text-white/90">npx codevator volume 50</span></p>,
              <p key="d"><Accent color={brown}>◆</Accent> <span className="text-white/70">Volume set to 50% █████░░░░░</span></p>,
            ]}
          />
        </div>
      </div>
    </div>
  );
}
