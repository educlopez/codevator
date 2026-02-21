"use client";

import { useEffect, useRef, useState } from "react";
import { getAnalyser, isAudioPlaying } from "@/lib/audio";

const BAR_COUNT = 40;
const USABLE_BINS = 20;

/** Deterministic pseudo-random idle heights/speeds per bar */
const idleBars = Array.from({ length: BAR_COUNT }, (_, i) => ({
  duration: 0.8 + (((i * 7 + 3) % 11) / 11) * 0.8,
  delay: (((i * 13 + 5) % BAR_COUNT) / BAR_COUNT) * 2,
  maxHeight: 25 + (((i * 17 + 2) % 19) / 19) * 70,
  scaleMin: 0.08 + (((i * 11 + 7) % 13) / 13) * 0.2,
}));

export function SoundVisualizer() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<number>(0);
  const smoothedRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const [live, setLive] = useState(false);

  useEffect(() => {
    let freqData: Uint8Array<ArrayBuffer> | null = null;
    const smoothed = smoothedRef.current;

    function tick() {
      const analyser = getAnalyser();
      const playing = isAudioPlaying();

      if (playing !== live) setLive(playing);

      if (analyser && playing) {
        if (!freqData) freqData = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        analyser.getByteFrequencyData(freqData);

        for (let i = 0; i < BAR_COUNT; i++) {
          // Map bars across usable low-frequency bins
          const binsPerBar = USABLE_BINS / BAR_COUNT;
          const startBin = Math.floor(i * binsPerBar);
          const endBin = Math.max(startBin + 1, Math.ceil((i + 1) * binsPerBar));
          let sum = 0;
          let count = 0;
          for (let b = startBin; b < endBin && b < freqData.length; b++) {
            sum += freqData[b];
            count++;
          }
          const target = count > 0 ? sum / count / 255 : 0;

          // Smooth: fast attack, slow decay
          const current = smoothed[i];
          if (target > current) {
            smoothed[i] += (target - current) * 0.35;
          } else {
            smoothed[i] += (target - current) * 0.08;
          }

          const norm = Math.max(smoothed[i], 0.04);
          const el = barsRef.current[i];
          if (el) {
            el.style.transform = `scaleY(${norm})`;
            el.style.opacity = `${0.3 + norm * 0.5}`;
          }
        }
      }

      animRef.current = requestAnimationFrame(tick);
    }

    tick();
    return () => cancelAnimationFrame(animRef.current);
  }, [live]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-end justify-center gap-[3px] h-28 w-full">
        {idleBars.map((bar, i) => (
          <div
            key={i}
            ref={(el) => { barsRef.current[i] = el; }}
            className={`flex-1 rounded-t-sm origin-bottom ${!live ? "animate-eq-idle" : ""}`}
            style={
              live
                ? { height: "100%", transform: "scaleY(0.04)", willChange: "transform", backgroundColor: "#1a6b4a" }
                : {
                    height: `${bar.maxHeight}%`,
                    backgroundColor: "#1a6b4a",
                    animationName: "equalizer",
                    animationDuration: `${bar.duration}s`,
                    animationDelay: `${bar.delay}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    "--eq-scale": `${bar.scaleMin}`,
                  } as React.CSSProperties
            }
          />
        ))}
      </div>
      <p className="text-xs text-olive-400 font-mono tracking-wider">
        ♫ Please enjoy each frequency equally
      </p>
    </div>
  );
}
