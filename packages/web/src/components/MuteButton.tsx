"use client";

import { useState, useEffect } from "react";
import { toggleMute, isMuted, isAudioPlaying } from "@/lib/audio";

export function MuteButton() {
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    function onMode(e: Event) {
      const detail = (e as CustomEvent).detail;
      setPlaying(detail !== null);
    }
    window.addEventListener("codevator:mode", onMode);
    setPlaying(isAudioPlaying());
    setMuted(isMuted());
    return () => window.removeEventListener("codevator:mode", onMode);
  }, []);

  if (!playing && !muted) return null;

  function handleClick() {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-olive-950/80 border border-white/10 flex items-center justify-center backdrop-blur-sm transition-all hover:border-olive-300/40 hover:bg-olive-950 cursor-pointer"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40">
          <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-olive-300/70">
          <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
