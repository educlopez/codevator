"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ElevatorButton } from "../ElevatorButton";
import { AudioVisualizer } from "../AudioVisualizer";
import { playMode, stopAudio } from "@/lib/audio";

const BUILT_IN_MODE_IDS = ["elevator", "typewriter", "ambient", "retro", "minimal"];

interface SoundEntry {
  name: string;
  description: string;
  category: string;
  color: string;
}

interface ModeItem {
  id: string;
  label: ReactNode;
  description: string;
  color: string;
}

const MODE_ICONS: Record<string, ReactNode> = {
  elevator: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="8 9 6 12 8 15" />
      <polyline points="16 9 18 12 16 15" />
    </svg>
  ),
  typewriter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <rect x="2" y="14" width="20" height="6" rx="2" />
      <path d="M6 14V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8" />
      <line x1="6" y1="18" x2="6" y2="18" />
      <line x1="10" y1="18" x2="10" y2="18" />
      <line x1="14" y1="18" x2="14" y2="18" />
      <line x1="18" y1="18" x2="18" y2="18" />
    </svg>
  ),
  ambient: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  retro: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15v-4l3 2-3 2z" />
      <line x1="14" y1="9" x2="14" y2="15" />
      <line x1="17" y1="11" x2="17" y2="15" />
    </svg>
  ),
  minimal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
};

const FALLBACK_MODES: ModeItem[] = [
  { id: "elevator", label: MODE_ICONS.elevator, description: "Lo-fi warmth. The default. Like being on hold with the future.", color: "#1a6b4a" },
  { id: "typewriter", label: MODE_ICONS.typewriter, description: "Mechanical keystrokes over a warm pad. For the nostalgia of physical input.", color: "#8B7355" },
  { id: "ambient", label: MODE_ICONS.ambient, description: "Soft textures and gentle drones. The outside world, piped in.", color: "#4a7ab5" },
  { id: "retro", label: MODE_ICONS.retro, description: "Chiptune arpeggios. Reward your agent with the Music Dance Experience.", color: "#a855f7" },
  { id: "minimal", label: MODE_ICONS.minimal, description: "A deep hum. Almost nothing. For those who find silence too quiet.", color: "#999999" },
];

function toModeItem(sound: SoundEntry): ModeItem {
  return {
    id: sound.name,
    label: MODE_ICONS[sound.name] ?? <span className="text-xs font-semibold uppercase">{sound.name.slice(0, 4)}</span>,
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
        const builtIn = data.sounds.filter((s) => BUILT_IN_MODE_IDS.includes(s.name));
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
      if (modeId !== "spotify") stopAudio();
      setActiveMode(null);
    } else {
      stopAudio();
      setActiveMode(modeId);
      if (modeId !== "spotify") playMode(modeId);
    }
  }

  const active = modes.find((m) => m.id === activeMode);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
      <div className="flex flex-col items-center gap-10 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm/7 font-semibold text-olive-700">
            15 Sounds. 5 Built-in Modes.
          </p>
          <h2 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            Every floor sounds different.
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

        <Link
          href="/sounds"
          className="text-sm font-medium text-olive-600 hover:text-olive-900 transition-colors underline underline-offset-4 decoration-olive-300 hover:decoration-olive-500"
        >
          Explore the full sound gallery &rarr;
        </Link>

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

        {activeMode === "spotify" ? (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="#1DB954" className="size-6">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span className="text-sm font-medium text-olive-700">Requires the Spotify app</span>
            </div>
            <p className="text-xs text-olive-500 max-w-sm">
              This mode controls your Spotify volume instead of playing its own sounds. Have Spotify running with music playing — codevator fades it in when coding starts and out when done. macOS only.
            </p>
          </div>
        ) : (
          <AudioVisualizer
            active={activeMode !== null}
            color={active?.color ?? "#1a6b4a"}
          />
        )}
      </div>
    </div>
  );
}
