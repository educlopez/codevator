"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { unlockAudio, playMode, stopAudio } from "@/lib/audio";
import { CopyCommand } from "./CopyCommand";
import { SoundVisualizer } from "./SoundVisualizer";

const noisePattern = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 100 100"><filter id="n"><feTurbulence type="turbulence" baseFrequency="1.4" numOctaves="1" seed="2" stitchTiles="stitch" result="n"/><feComponentTransfer result="g"><feFuncR type="linear" slope="4" intercept="1"/><feFuncG type="linear" slope="4" intercept="1"/><feFuncB type="linear" slope="4" intercept="1"/></feComponentTransfer><feColorMatrix type="saturate" values="0" in="g"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)}")`;

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

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-olive-950">
      {/* Interior — revealed after doors open */}
      <div className="absolute inset-0 overflow-hidden bg-olive-100">
        <section ref={interiorRef} className="opacity-0 translate-y-5 h-full flex flex-col justify-center">
          <div className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10 flex flex-col items-center gap-12">
            {/* Text content */}
            <div className="flex flex-col items-center gap-5">
              {/* Badge */}
              <a
                href="https://github.com/educlopez/codevator"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex max-w-full gap-x-3 overflow-hidden rounded-full bg-olive-950/5 px-3 py-0.5 text-sm/6 text-olive-950 hover:bg-olive-950/10 transition-colors sm:items-center"
              >
                <span className="truncate">Open-source CLI for Claude Code</span>
                <span className="h-3 w-px bg-olive-950/20 max-sm:hidden" />
                <span className="inline-flex shrink-0 items-center gap-1 font-semibold">
                  Star on GitHub
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="shrink-0">
                    <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
              <h1 className="font-display text-5xl/12 tracking-tight text-balance sm:text-[5rem]/20 text-olive-950 max-w-3xl text-center">
                Elevator music for your coding agent.
              </h1>
              <div className="text-lg/8 text-olive-700 flex max-w-2xl flex-col gap-4 text-center">
                <p>
                  Background sounds that play while Claude Code works and stop when it needs your attention — so the silence doesn&apos;t drive you to a &ldquo;that&apos;s what she said&rdquo; moment.
                </p>
              </div>
            </div>
            <CopyCommand command="npm install -g codevator" />

            {/* Sound visualizer */}
            <div className="w-full max-w-2xl mt-12">
              <SoundVisualizer />
            </div>
          </div>
        </section>
      </div>

      {/* Left door */}
      <div
        ref={leftDoorRef}
        className="absolute top-0 left-0 w-1/2 h-full z-10"
        style={{ background: "linear-gradient(to bottom, #6b7260, #565c4c, #4a5040)" }}
      >
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: noisePattern }} />
        {/* Metallic highlight reflection */}
        <div className="absolute inset-y-0 right-[20%] w-[30%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        {/* Single door panel */}
        <div className="absolute left-5 right-3 top-[4%] bottom-[4%] rounded-[2px] border border-white/[0.07] bg-white/[0.02]">
          <div className="absolute inset-0 rounded-[2px] shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(30,33,25,0.2)]" />
        </div>
        {/* Center seam — right edge of left door */}
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-olive-950/60 via-olive-950/80 to-olive-950/60" />
        <div className="absolute top-0 right-[2px] w-px h-full bg-white/[0.08]" />
      </div>

      {/* Right door */}
      <div
        ref={rightDoorRef}
        className="absolute top-0 right-0 w-1/2 h-full z-10"
        style={{ background: "linear-gradient(to bottom, #6b7260, #565c4c, #4a5040)" }}
      >
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: noisePattern }} />
        {/* Metallic highlight reflection */}
        <div className="absolute inset-y-0 left-[20%] w-[30%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        {/* Single door panel */}
        <div className="absolute left-3 right-5 top-[4%] bottom-[4%] rounded-[2px] border border-white/[0.07] bg-white/[0.02]">
          <div className="absolute inset-0 rounded-[2px] shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(30,33,25,0.2)]" />
        </div>
        {/* Center seam — left edge of right door */}
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-olive-950/60 via-olive-950/80 to-olive-950/60" />
        <div className="absolute top-0 left-[2px] w-px h-full bg-white/[0.08]" />
      </div>

      {/* Door frame */}
      <div ref={frameRef} className="absolute inset-0 z-20 pointer-events-none">
        {/* Top frame */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-olive-950 shadow-[0_3px_12px_rgba(20,22,16,0.7)]" />
        {/* Bottom frame */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-olive-950 shadow-[0_-2px_8px_rgba(20,22,16,0.5)]" />
        {/* Left frame */}
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-olive-950 shadow-[3px_0_12px_rgba(20,22,16,0.7)]" />
        {/* Right frame */}
        <div className="absolute top-0 bottom-0 right-0 w-6 bg-olive-950 shadow-[-3px_0_12px_rgba(20,22,16,0.7)]" />
        {/* Inner frame edge highlights */}
        <div className="absolute top-8 left-6 right-6 h-px bg-white/[0.08]" />
        <div className="absolute top-8 bottom-4 left-6 w-px bg-white/[0.08]" />
        <div className="absolute top-8 bottom-4 right-6 w-px bg-white/[0.08]" />
        <div className="absolute bottom-4 left-6 right-6 h-px bg-white/[0.05]" />
      </div>

      {/* Floor indicator — small display above doors */}
      <div ref={indicatorRef} className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center justify-center w-10 h-5 rounded-sm bg-olive-900/80 border border-white/[0.06] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
          {/* Up arrow triangle */}
          <svg width="10" height="8" viewBox="0 0 10 8" className="text-olive-400/70">
            <path d="M5 1L9 7H1L5 1Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Call button overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        <button
          onClick={handleCallElevator}
          className="group relative w-20 h-20 rounded-full border-2 border-olive-400/30 bg-olive-950/90 flex items-center justify-center transition-all hover:border-olive-300/60 hover:shadow-[0_0_30px_rgba(200,210,190,0.15)] cursor-pointer backdrop-blur-sm"
        >
          <span className="text-sm text-olive-300 tracking-[0.15em] uppercase group-hover:scale-110 transition-transform font-medium">
            Open
          </span>
        </button>

        {/* Post-it note — right */}
        <div className="absolute right-6 sm:right-16 top-[28%] rotate-2 w-56 sm:w-64 p-5 sm:p-6 bg-amber-100 shadow-[3px_4px_12px_rgba(0,0,0,0.35)] z-40">
          <p className="font-handwriting text-xl sm:text-2xl leading-relaxed text-amber-950/80">
            Welcome to Codevator.
            <br />
            <br />
            Please try to enjoy each floor equally.
          </p>
          <p className="font-handwriting text-base text-amber-800/50 mt-3 text-right">
            — Mgmt.
          </p>
        </div>

        {/* Post-it note — left */}
        <div className="absolute left-6 sm:left-16 top-[38%] -rotate-3 w-56 sm:w-64 p-5 sm:p-6 bg-yellow-50 shadow-[3px_4px_12px_rgba(0,0,0,0.35)] z-40">
          <p className="font-handwriting text-xl sm:text-2xl leading-relaxed text-amber-950/80">
            &ldquo;You miss 100% of the elevator music you don&rsquo;t play.&rdquo;
          </p>
          <p className="font-handwriting text-base text-amber-950/50 mt-2 text-right">
            — Wayne Gretzky
          </p>
          <p className="font-handwriting text-base text-amber-950/40 text-right">
            &nbsp;&nbsp;&nbsp;— Michael Scott
          </p>
        </div>
      </div>
    </div>
  );
}
