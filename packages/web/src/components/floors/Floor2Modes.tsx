"use client";

import { useState, useEffect } from "react";
import { ElevatorButton } from "../ElevatorButton";
import { AudioVisualizer } from "../AudioVisualizer";
import { playMode, stopAudio } from "@/lib/audio";

interface SoundEntry {
  name: string;
  description: string;
  category: string;
  color: string;
}

interface ModeItem {
  id: string;
  label: string;
  description: string;
  color: string;
}

const LABEL_MAP: Record<string, string> = {
  elevator: "Elvtr",
  typewriter: "Type",
  ambient: "Rain",
  retro: "8bit",
  minimal: "Min",
};

const FALLBACK_MODES: ModeItem[] = [
  { id: "elevator", label: "Elvtr", description: "Lo-fi warmth. The default. Like being on hold with the future.", color: "#1a6b4a" },
  { id: "typewriter", label: "Type", description: "Mechanical keystrokes over a warm pad. For the nostalgia of physical input.", color: "#8B7355" },
  { id: "ambient", label: "Rain", description: "Gentle rain and a low drone. The outside world, piped in.", color: "#4a7ab5" },
  { id: "retro", label: "8bit", description: "Chiptune arpeggios. Reward your agent with the Music Dance Experience.", color: "#a855f7" },
  { id: "minimal", label: "Min", description: "A deep hum. Almost nothing. For those who prefer quiet contemplation.", color: "#999999" },
];

function toModeItem(sound: SoundEntry): ModeItem {
  return {
    id: sound.name,
    label: LABEL_MAP[sound.name] ?? sound.name.slice(0, 4),
    description: sound.description,
    color: sound.color,
  };
}

export function Floor2Modes() {
  const [modes, setModes] = useState<ModeItem[]>(FALLBACK_MODES);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/sounds.json")
      .then((res) => res.json())
      .then((data: { sounds: SoundEntry[] }) => {
        const builtIn = data.sounds.filter((s) => s.category === "built-in");
        if (builtIn.length > 0) {
          setModes(builtIn.map(toModeItem));
        }
      })
      .catch(() => {});
  }, []);

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
      playMode(modeId);
    }
  }

  const active = modes.find((m) => m.id === activeMode);

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
          {modes.map((mode) => (
            <div key={mode.id} className="flex flex-col items-center gap-2">
              <ElevatorButton
                label={mode.label}
                active={activeMode === mode.id}
                onClick={() => handleModeClick(mode.id)}
                color={mode.color}
                ariaLabel={`Play ${mode.id} mode`}
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
