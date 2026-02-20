"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { unlockAudio, playMode, stopAudio } from "@/lib/audio";
import { CopyCommand } from "./CopyCommand";

/** Generate a brushed stainless steel texture on a canvas, return as data URL */
function generateMetalTexture(width = 400, height = 800): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#2a2a2e";
  ctx.fillRect(0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let y = 0; y < height; y++) {
    const rowBrightness = (Math.random() - 0.5) * 12;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const grain = (Math.random() - 0.5) * 8;
      const val = rowBrightness + grain;
      data[i] = Math.min(255, Math.max(0, data[i] + val));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + val));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + val + 1));
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "rgba(255,255,255,0.04)");
  grad.addColorStop(0.3, "rgba(255,255,255,0)");
  grad.addColorStop(0.7, "rgba(0,0,0,0.02)");
  grad.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.85);
}

function dispatchElevatorEvent(state: "opened" | "closed") {
  window.dispatchEvent(new CustomEvent("codevator:elevator", { detail: state }));
}

export function ElevatorDoors() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const closingRef = useRef(false);
  const scrolledAwayRef = useRef(false);
  const [metalTexture, setMetalTexture] = useState<string | null>(null);

  useEffect(() => {
    setMetalTexture(generateMetalTexture());
  }, []);

  useEffect(() => {
    if (opened) {
      document.body.style.overflow = "auto";
      dispatchElevatorEvent("opened");
    } else {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
      dispatchElevatorEvent("closed");
    }
  }, [opened]);

  const closeElevator = useCallback(() => {
    if (!opened || closingRef.current) return;
    closingRef.current = true;

    stopAudio();

    const tl = gsap.timeline({
      onComplete: () => {
        setOpened(false);
        closingRef.current = false;
        scrolledAwayRef.current = false;
      },
    });

    tl.to(interiorRef.current, { opacity: 0, y: 20, duration: 0.4, ease: "power2.in" }, 0);
    tl.to(leftDoorRef.current, { xPercent: 0, duration: 1.2, ease: "power2.inOut" }, 0.2);
    tl.to(rightDoorRef.current, { xPercent: 0, duration: 1.2, ease: "power2.inOut" }, 0.2);
    tl.to(frameRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.4);
    tl.to(indicatorRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.6);
    tl.set(overlayRef.current, { pointerEvents: "auto" }, 1.0);
    tl.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.0);
  }, [opened]);

  useEffect(() => {
    if (!opened) return;

    function handleScroll() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      if (rect.top < -300) {
        scrolledAwayRef.current = true;
      }

      if (scrolledAwayRef.current && rect.top > -100) {
        closeElevator();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [opened, closeElevator]);

  function handleCallElevator() {
    if (opened || closingRef.current) return;
    unlockAudio();
    playMode("elevator");

    const tl = gsap.timeline({
      onComplete: () => setOpened(true),
    });

    tl.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0);
    tl.set(overlayRef.current, { pointerEvents: "none" }, 0.4);
    tl.to(frameRef.current, { opacity: 0, duration: 0.6, ease: "power2.in" }, 0);
    tl.to(indicatorRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0);
    tl.to(leftDoorRef.current, { xPercent: -100, duration: 1.4, ease: "power2.inOut" }, 0.2);
    tl.to(rightDoorRef.current, { xPercent: 100, duration: 1.4, ease: "power2.inOut" }, 0.2);
    tl.to(interiorRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.8);
  }

  const doorStyle = metalTexture
    ? { backgroundImage: `url(${metalTexture})`, backgroundSize: "cover" }
    : { background: "#2a2a2e" };

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#111]">
      {/* Interior — revealed after doors open */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-olive-100">
        <div ref={interiorRef} className="flex flex-col items-center gap-6 opacity-0 translate-y-5 px-6">
          <h1 className="font-display text-5xl/12 sm:text-[5rem]/20 text-olive-950 tracking-tight text-balance text-center max-w-5xl">
            Elevator music for
            <br className="max-sm:hidden" />
            your coding agent.
          </h1>
          <p className="text-lg/8 text-olive-700 text-center text-pretty max-w-2xl">
            Background sounds that play while Claude Code works and stop when it needs your attention.
          </p>
          <div className="mt-2">
            <CopyCommand command="npm install -g codevator" />
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-olive-500 tracking-widest uppercase">
              Scroll to explore
            </p>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-olive-400 animate-bounce">
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Left door */}
      <div
        ref={leftDoorRef}
        className="absolute top-0 left-0 w-1/2 h-full z-10"
        style={doorStyle}
      >
        <div className="absolute inset-x-6 top-[8%] bottom-[52%] rounded-sm border border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_2px_rgba(0,0,0,0.2)]" />
        </div>
        <div className="absolute inset-x-6 top-[52%] bottom-[8%] rounded-sm border border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_2px_rgba(0,0,0,0.2)]" />
        </div>
        <div className="absolute top-0 bottom-0 right-[30%] w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-black/40" />
        <div className="absolute top-0 right-px w-px h-full bg-white/[0.06]" />
      </div>

      {/* Right door */}
      <div
        ref={rightDoorRef}
        className="absolute top-0 right-0 w-1/2 h-full z-10"
        style={doorStyle}
      >
        <div className="absolute inset-x-6 top-[8%] bottom-[52%] rounded-sm border border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_2px_rgba(0,0,0,0.2)]" />
        </div>
        <div className="absolute inset-x-6 top-[52%] bottom-[8%] rounded-sm border border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_2px_rgba(0,0,0,0.2)]" />
        </div>
        <div className="absolute top-0 bottom-0 left-[30%] w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
        <div className="absolute top-0 left-0 w-px h-full bg-black/40" />
        <div className="absolute top-0 left-px w-px h-full bg-white/[0.06]" />
      </div>

      {/* Door frame */}
      <div ref={frameRef} className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-5 bg-[#1a1a1c] shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#1a1a1c] shadow-[0_-2px_8px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-0 bottom-0 left-0 w-4 bg-[#1a1a1c] shadow-[2px_0_8px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-0 bottom-0 right-0 w-4 bg-[#1a1a1c] shadow-[-2px_0_8px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-5 left-4 right-4 h-px bg-white/[0.06]" />
        <div className="absolute top-5 bottom-3 left-4 w-px bg-white/[0.06]" />
        <div className="absolute top-5 bottom-3 right-4 w-px bg-white/[0.06]" />
      </div>

      {/* Floor indicator */}
      <div ref={indicatorRef} className="absolute top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-white/10" />
          <span className="font-mono text-[10px] text-white/20 tracking-[0.3em] uppercase">
            lobby
          </span>
          <div className="w-8 h-px bg-white/10" />
        </div>
      </div>

      {/* Call button overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center"
      >
        <button
          onClick={handleCallElevator}
          className="group relative w-20 h-20 rounded-full border-2 border-white/20 bg-[#222]/90 flex items-center justify-center transition-all hover:border-olive-300/60 hover:shadow-[0_0_30px_rgba(200,210,190,0.15)] cursor-pointer backdrop-blur-sm"
        >
          <span className="text-xs text-olive-300 tracking-[0.2em] uppercase group-hover:scale-110 transition-transform font-medium">
            Start
          </span>
        </button>
      </div>
    </div>
  );
}
