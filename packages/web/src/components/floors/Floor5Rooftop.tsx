"use client";

import { useEffect, useRef, useState } from "react";
import { CopyCommand } from "../CopyCommand";

export function Floor5Rooftop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.src = "/codevator-character-crop.mp4";
          video.load();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Blurred placeholder */}
      <img
        src="/codevator-character-blur.jpeg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-125 origin-center translate-x-[3%] translate-y-[5%]"
      />

      {/* Scene layer: poster + cropped character video share the same transform */}
      <div className="relative scale-125 origin-center translate-x-[3%] translate-y-[5%]">
        <img
          src="/codevator-character-poster.jpeg"
          alt=""
          aria-hidden
          className="w-full block"
        />
        {/* Cropped video positioned exactly where the character is in the poster */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
          style={{
            left: `${(730 / 1904) * 100}%`,
            top: `${(550 / 1088) * 100}%`,
            width: `${(300 / 1904) * 100}%`,
            height: `${(350 / 1088) * 100}%`,
            mask: "radial-gradient(ellipse 70% 65% at center 55%, black 40%, transparent 100%)",
            WebkitMask: "radial-gradient(ellipse 70% 65% at center 55%, black 40%, transparent 100%)",
          }}
        />
      </div>

      {/* Gradient from site bg into video */}
      <div className="absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-olive-100 to-transparent pointer-events-none z-10" />

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center -translate-y-[10%]">
        <div className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm/7 font-semibold text-olive-700">
                Ready?
              </p>
              <h2 className="font-display text-5xl/12 sm:text-[5rem]/20 text-olive-950 tracking-tight text-balance">
                Exit the elevator.
              </h2>
              <p className="font-display text-2xl/8 text-olive-600 italic">
                Start building.
              </p>
            </div>

            <CopyCommand command="npm install -g codevator" />

            <div className="flex justify-center gap-8 text-sm/7 font-medium">
              <a
                href="https://github.com/educlopez/codevator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-olive-700 hover:text-olive-950 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/codevator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-olive-700 hover:text-olive-950 transition-colors"
              >
                npm
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
