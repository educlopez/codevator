/**
 * Generate favicon and app icons for Codevator.
 *
 * Design: Circle with olive elevator-door gradient + white serif "C"
 *
 * Uses @napi-rs/canvas for rendering without a browser.
 * Run: npx -y @napi-rs/canvas node packages/web/scripts/generate-icons.mjs
 */

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = join(__dirname, "..");

// Try to register Instrument Serif if available locally
const fontPath = join(webDir, "scripts", "InstrumentSerif-Regular.ttf");
try {
  GlobalFonts.registerFromPath(fontPath, "Instrument Serif");
  console.log("Loaded Instrument Serif font");
} catch {
  console.log("Instrument Serif not found, using Georgia fallback");
}

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const r = size / 2;

  // Circle with elevator door gradient
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#6b7260");
  grad.addColorStop(0.5, "#565c4c");
  grad.addColorStop(1, "#4a5040");

  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle highlight reflection
  const hlGrad = ctx.createLinearGradient(size * 0.3, 0, size * 0.7, 0);
  hlGrad.addColorStop(0, "rgba(255,255,255,0)");
  hlGrad.addColorStop(0.5, "rgba(255,255,255,0.06)");
  hlGrad.addColorStop(1, "rgba(255,255,255,0)");

  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fillStyle = hlGrad;
  ctx.fill();

  // Inner subtle border
  ctx.beginPath();
  ctx.arc(r, r, r - (size > 64 ? 2 : 1), 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = size > 64 ? 2 : 1;
  ctx.stroke();

  // Letter C
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.round(size * 0.66);
  ctx.font = `400 ${fontSize}px "Instrument Serif", Georgia, "Times New Roman", serif`;
  ctx.fillText("C", r, r + size * 0.03);

  return canvas;
}

// Generate all sizes
const sizes = [
  { size: 512, path: "public/icon-512.png" },
  { size: 192, path: "public/icon-192.png" },
  { size: 180, path: "src/app/apple-icon.png" },
  { size: 32, path: "src/app/favicon-32.png" },
  { size: 16, path: "src/app/favicon-16.png" },
];

for (const { size, path } of sizes) {
  const canvas = drawIcon(size);
  const buf = canvas.toBuffer("image/png");
  const fullPath = join(webDir, path);
  writeFileSync(fullPath, buf);
  console.log(`Generated ${path} (${size}x${size}, ${buf.length} bytes)`);
}

console.log("\nDone! Now generate favicon.ico from the 16 and 32 px PNGs.");
