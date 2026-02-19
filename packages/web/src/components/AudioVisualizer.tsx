"use client";

import { useEffect, useRef } from "react";
import { getAnalyser } from "@/lib/audio";

interface AudioVisualizerProps {
  active: boolean;
  color: string;
}

const BAR_COUNT = 40;
const GAP = 3;
const BAR_RADIUS = 3;
const MIN_HEIGHT = 4;

export function AudioVisualizer({ active, color }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const smoothedRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const prevColorRef = useRef(color);
  const colorTransitionRef = useRef(1);

  useEffect(() => {
    if (prevColorRef.current !== color) {
      colorTransitionRef.current = 0;
      prevColorRef.current = color;
    }
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const smoothed = smoothedRef.current;
    let freqData: Uint8Array<ArrayBuffer> | null = null;

    function draw() {
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      const analyser = getAnalyser();

      // Allocate buffer on first use
      if (analyser && !freqData) {
        freqData = new Uint8Array(analyser.frequencyBinCount);
      }

      // Get frequency data
      if (analyser && active && freqData) {
        analyser.getByteFrequencyData(freqData);
      }

      // Ease color transition
      if (colorTransitionRef.current < 1) {
        colorTransitionRef.current = Math.min(1, colorTransitionRef.current + 0.04);
      }

      const barTotalWidth = (W - GAP * (BAR_COUNT - 1)) / BAR_COUNT;
      const barWidth = Math.max(barTotalWidth, 2);
      const maxBarHeight = H * 0.85;

      for (let i = 0; i < BAR_COUNT; i++) {
        let targetNorm = 0;

        if (active && analyser && freqData) {
          // Focus on the frequency range with actual energy (~0-2kHz)
          // and spread it across all bars for a full-width visualization
          const USABLE_BINS = 16;
          const binsPerBar = USABLE_BINS / BAR_COUNT;
          const startBin = Math.floor(i * binsPerBar);
          const endBin = Math.max(startBin + 1, Math.ceil((i + 1) * binsPerBar));
          let sum = 0;
          let count = 0;
          for (let b = startBin; b < endBin && b < freqData.length; b++) {
            sum += freqData[b];
            count++;
          }
          targetNorm = count > 0 ? sum / count / 255 : 0;
        }

        // Smooth towards target (faster attack, slower decay)
        const current = smoothed[i];
        if (targetNorm > current) {
          smoothed[i] += (targetNorm - current) * 0.35;
        } else {
          smoothed[i] += (targetNorm - current) * 0.08;
        }

        const norm = active ? Math.max(smoothed[i], 0.04) : smoothed[i];
        const h = Math.max(norm * maxBarHeight, active ? MIN_HEIGHT : 0);

        const x = i * (barWidth + GAP);
        const y = (H - h) / 2;

        // Opacity based on bar intensity
        const alpha = active ? 0.3 + norm * 0.6 : norm * 0.5;
        ctx.fillStyle = hexToRgba(color, alpha);

        // Rounded rect bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, BAR_RADIUS);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-lg h-28"
      style={{ imageRendering: "auto" }}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
