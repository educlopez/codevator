"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Floor5Rooftop } from "@/components/floors/Floor5Rooftop";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { playMode, playFile, stopAudio, unlockAudio } from "@/lib/audio";

interface SoundEntry {
  name: string;
  description: string;
  category: string;
  color: string;
  files?: number;
}

interface SoundManifest {
  version: number;
  baseUrl: string;
  sounds: SoundEntry[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-olive-600 hover:text-olive-950 hover:bg-olive-950/5 transition-colors"
      aria-label="Copy command"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function SoundCard({
  sound,
  isActive,
  activeTrack,
  onToggle,
  onPlayTrack,
}: {
  sound: SoundEntry;
  isActive: boolean;
  activeTrack: number | null;
  onToggle: () => void;
  onPlayTrack: (track: number) => void;
}) {
  const command = `npx codevator add ${sound.name}`;
  const trackCount = sound.files ?? 1;

  return (
    <div
      className="rounded-xl border border-olive-950/10 p-6 flex flex-col gap-4 transition-all duration-200"
      style={{
        borderColor: isActive ? sound.color : undefined,
        boxShadow: isActive ? `0 0 0 1px ${sound.color}` : undefined,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Play button */}
          <button
            onClick={() => {
              unlockAudio();
              onToggle();
            }}
            className="flex size-10 items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: isActive ? sound.color : `${sound.color}20`,
              color: isActive ? "white" : sound.color,
            }}
            aria-label={isActive ? `Stop ${sound.name}` : `Play ${sound.name}`}
          >
            {isActive ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 ml-0.5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div>
            <h3 className="font-display text-lg text-olive-950">{sound.name}</h3>
            <span className="text-xs text-olive-500">{sound.category}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm/7 text-olive-600">{sound.description}</p>

      {/* Track buttons */}
      {trackCount > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-olive-500 mr-1">Tracks</span>
          {Array.from({ length: trackCount }, (_, i) => {
            const track = i + 1;
            const isTrackActive = isActive && activeTrack === track;
            return (
              <button
                key={track}
                onClick={() => {
                  unlockAudio();
                  onPlayTrack(track);
                }}
                className="flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isTrackActive ? sound.color : `${sound.color}15`,
                  color: isTrackActive ? "white" : sound.color,
                }}
                aria-label={`Play ${sound.name} track ${track}`}
              >
                {track}
              </button>
            );
          })}
        </div>
      )}

      {/* Visualizer - only show when active */}
      {isActive && (
        <AudioVisualizer active={true} color={sound.color} />
      )}

      {/* Command */}
      <div className="flex items-center gap-2 rounded-lg bg-olive-950/[0.03] px-3 py-2">
        <code className="flex-1 text-xs font-mono text-olive-700 truncate">
          {command}
        </code>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

export function SoundsContent() {
  const [sounds, setSounds] = useState<SoundEntry[]>([]);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  useEffect(() => {
    fetch("/sounds.json")
      .then((res) => res.json())
      .then((data: SoundManifest) => setSounds(data.sounds))
      .catch(() => {});
  }, []);

  function handleToggle(name: string) {
    if (activeSound?.startsWith(name)) {
      stopAudio();
      setActiveSound(null);
    } else {
      setActiveSound(name);
      playMode(name);
    }
  }

  function handlePlayTrack(name: string, track: number) {
    const detail = track === 1 ? name : `${name}:${track}`;
    if (activeSound === detail) {
      stopAudio();
      setActiveSound(null);
      return;
    }
    const url = track === 1 ? `/sounds/${name}.mp3` : `/sounds/${name}-${track}.mp3`;
    setActiveSound(detail);
    playFile(url, detail);
  }

  // Sync with audio events from other components
  useEffect(() => {
    function handleModeChange(e: Event) {
      setActiveSound((e as CustomEvent).detail);
    }
    window.addEventListener("codevator:mode", handleModeChange);
    return () => window.removeEventListener("codevator:mode", handleModeChange);
  }, []);

  return (
    <main>
      <Header alwaysVisible />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Content */}
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:py-28">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 sm:mb-20">
          <p className="text-sm/7 font-semibold text-olive-700">Sounds</p>
          <h1 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            Browse all sounds
          </h1>
          <p className="text-base/7 text-olive-600 max-w-lg">
            Preview each sound and install it with a single command.
            Sounds play while your AI agent works and stop when it needs your attention.
          </p>
        </div>

        {/* Sound grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {sounds.map((sound) => {
            const isActive = activeSound !== null && activeSound.startsWith(sound.name) &&
              (activeSound === sound.name || activeSound[sound.name.length] === ":");
            const activeTrack = !isActive ? null
              : activeSound === sound.name ? 1
              : parseInt(activeSound.split(":")[1], 10);
            return (
              <SoundCard
                key={sound.name}
                sound={sound}
                isActive={isActive}
                activeTrack={activeTrack}
                onToggle={() => handleToggle(sound.name)}
                onPlayTrack={(track) => handlePlayTrack(sound.name, track)}
              />
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 sm:mt-28 rounded-xl bg-olive-950/[0.03] p-8 sm:p-10 text-center">
          <p className="font-display text-xl text-olive-950 mb-2">
            Get started
          </p>
          <p className="text-sm/7 text-olive-600 mb-6">
            Set up Codevator and your default sound in one command:
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-olive-950 px-5 py-3">
            <code className="text-sm font-mono text-white">npx codevator</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Floor5Rooftop />
    </main>
  );
}
