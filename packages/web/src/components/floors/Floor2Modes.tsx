"use client";

import { useState, useEffect } from "react";
import { ElevatorButton } from "../ElevatorButton";
import { AudioVisualizer } from "../AudioVisualizer";
import { playMode, stopAudio } from "@/lib/audio";

const MODES = [
  {
    id: "elevator" as const,
    label: "Elvtr",
    description: "Lo-fi warmth. The default. Like being on hold with the future.",
    color: "#1a6b4a",
  },
  {
    id: "typewriter" as const,
    label: "Type",
    description: "Mechanical keystrokes over a warm pad. For the nostalgia of physical input.",
    color: "#8B7355",
  },
  {
    id: "ambient" as const,
    label: "Rain",
    description: "Gentle rain and a low drone. The outside world, piped in.",
    color: "#4a7ab5",
  },
  {
    id: "retro" as const,
    label: "8bit",
    description: "Chiptune arpeggios. Reward your agent with the Music Dance Experience.",
    color: "#a855f7",
  },
  {
    id: "minimal" as const,
    label: "Min",
    description: "A deep hum. Almost nothing. For those who prefer quiet contemplation.",
    color: "#999999",
  },
];

export function Floor2Modes() {
  const [activeMode, setActiveMode] = useState<string | null>(null);

  useEffect(() => {
    function handleModeChange(e: Event) {
      setActiveMode((e as CustomEvent).detail);
    }
    window.addEventListener("codevator:mode", handleModeChange);
    return () => window.removeEventListener("codevator:mode", handleModeChange);
  }, []);

  function handleModeClick(modeId: string) {
    if (activeMode === modeId) {
      stopAudio();
      setActiveMode(null);
    } else {
      setActiveMode(modeId);
      playMode(modeId as Parameters<typeof playMode>[0]);
    }
  }

  const active = MODES.find((m) => m.id === activeMode);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
      <div className="flex flex-col items-center gap-10 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm/7 font-semibold text-olive-700">
            5 Sound Modes
          </p>
          <h2 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            Try them. Pick a favorite.
          </h2>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {MODES.map((mode) => (
            <div key={mode.id} className="flex flex-col items-center gap-2">
              <ElevatorButton
                label={mode.label}
                active={activeMode === mode.id}
                onClick={() => handleModeClick(mode.id)}
                color={mode.color}
              />
              <span className="text-xs text-olive-500">
                {mode.id}
              </span>
            </div>
          ))}
        </div>

        <div className="h-16 flex items-center justify-center">
          {active ? (
            <p
              className="font-display text-lg italic transition-all duration-300"
              style={{ color: active.color }}
            >
              {active.description}
            </p>
          ) : (
            <p className="text-sm/7 text-olive-600">
              Please try to enjoy each mode equally.
            </p>
          )}
        </div>

        <AudioVisualizer
          active={activeMode !== null}
          color={active?.color ?? "#1a6b4a"}
        />
      </div>
    </div>
  );
}
