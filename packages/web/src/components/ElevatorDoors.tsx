"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { unlockAudio, playMode, stopAudio } from "@/lib/audio";

export function ElevatorDoors() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const closingRef = useRef(false);
  const scrolledAwayRef = useRef(false);

  // Lock scroll while doors are closed
  useEffect(() => {
    if (opened) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
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
    tl.set(overlayRef.current, { pointerEvents: "auto" }, 1.0);
    tl.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.0);
  }, [opened]);

  useEffect(() => {
    if (!opened) return;

    function handleScroll() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // First, detect that user scrolled away from hero
      if (rect.top < -300) {
        scrolledAwayRef.current = true;
      }

      // Only close if they scrolled away first, then came back
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
    tl.to(leftDoorRef.current, { xPercent: -100, duration: 1.4, ease: "power2.inOut" }, 0.2);
    tl.to(rightDoorRef.current, { xPercent: 100, duration: 1.4, ease: "power2.inOut" }, 0.2);
    tl.to(interiorRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.8);
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-lumon-dark">
      {/* Interior — revealed after doors open */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-lumon-bg">
        <div ref={interiorRef} className="text-center opacity-0 translate-y-5">
          <p className="font-mono text-xs text-lumon-gray tracking-[0.3em] uppercase mb-6">
            Codevator
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-lumon-green leading-tight">
            Elevator music for
            <br />
            your coding agent.
          </h1>
          <p className="font-mono text-sm text-lumon-gray mt-8 tracking-widest uppercase">
            Scroll to explore
          </p>
          <div className="mt-4 animate-bounce">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-auto text-lumon-gray/50">
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Left door */}
      <div
        ref={leftDoorRef}
        className="absolute top-0 left-0 w-1/2 h-full bg-lumon-dark z-10 border-r border-lumon-green/20"
      >
        <div className="h-full flex items-center justify-end pr-8">
          <div className="w-1 h-24 bg-lumon-green/20 rounded-full" />
        </div>
      </div>

      {/* Right door */}
      <div
        ref={rightDoorRef}
        className="absolute top-0 right-0 w-1/2 h-full bg-lumon-dark z-10 border-l border-lumon-green/20"
      >
        <div className="h-full flex items-center justify-start pl-8">
          <div className="w-1 h-24 bg-lumon-green/20 rounded-full" />
        </div>
      </div>

      {/* Door frame */}
      <div className="absolute inset-0 z-20 pointer-events-none border-[12px] border-lumon-dark/90" />

      {/* Call button overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center"
      >
        <button
          onClick={handleCallElevator}
          className="group relative w-20 h-20 rounded-full border-2 border-lumon-green/40 bg-lumon-dark/80 flex items-center justify-center transition-all hover:border-lumon-mint hover:shadow-[0_0_24px_rgba(200,230,212,0.3)] cursor-pointer"
        >
          <span className="font-mono text-xs text-lumon-mint tracking-[0.2em] uppercase group-hover:scale-110 transition-transform">
            Start
          </span>
        </button>
      </div>
    </div>
  );
}
