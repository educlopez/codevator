"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toggleMute, isMuted, isMobile, isAudioPlaying, setVolume, getVolume } from "@/lib/audio";

export function MuteButton() {
  const [muted, setMuted] = useState(() => isMuted() || isMobile());
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(getVolume());
  const [showSlider, setShowSlider] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    function onMode(e: Event) {
      const detail = (e as CustomEvent).detail;
      setPlaying(detail !== null);
    }
    window.addEventListener("codevator:mode", onMode);
    setPlaying(isAudioPlaying());
    setMuted(isMuted());
    setVol(getVolume());
    return () => window.removeEventListener("codevator:mode", onMode);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setShowSlider(false), 400);
  }, [cancelHide]);

  const handleVolumeFromY = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, ratio));
    setVolume(clamped);
    setVol(clamped);
    setMuted(clamped === 0);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleVolumeFromY(e.clientY);
  }, [handleVolumeFromY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    handleVolumeFromY(e.clientY);
  }, [handleVolumeFromY]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (!playing && !muted) return null;

  function handleClick() {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
    if (!nowMuted) {
      setVol(getVolume());
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center"
      onMouseEnter={() => { cancelHide(); setShowSlider(true); }}
      onMouseLeave={scheduleHide}
    >
      {/* Volume slider */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out mb-2 flex justify-center"
        style={{
          maxHeight: showSlider ? 120 : 0,
          opacity: showSlider ? 1 : 0,
        }}
      >
        <div className="bg-olive-950/80 border border-white/10 backdrop-blur-sm rounded-full px-[10px] py-3 flex flex-col items-center">
          <div
            ref={trackRef}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((muted ? 0 : vol) * 100)}
            tabIndex={0}
            className="relative w-[6px] h-[80px] bg-white/10 rounded-full cursor-pointer"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Filled portion */}
            <div
              className="absolute bottom-0 left-0 w-full rounded-full bg-olive-400/70 transition-[height] duration-75"
              style={{ height: `${(muted ? 0 : vol) * 100}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-olive-300 border-2 border-olive-950 shadow transition-[bottom] duration-75"
              style={{ bottom: `calc(${(muted ? 0 : vol) * 100}% - 7px)` }}
            />
          </div>
        </div>
      </div>

      {/* Mute button */}
      <button
        onClick={handleClick}
        className="w-10 h-10 rounded-full bg-olive-950/80 border border-white/10 flex items-center justify-center backdrop-blur-sm transition-all hover:border-olive-300/40 hover:bg-olive-950 cursor-pointer"
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
    </div>
  );
}
