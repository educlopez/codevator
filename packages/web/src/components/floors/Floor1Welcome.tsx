import { TerminalSimulation } from "../TerminalSimulation";
import { noisePattern } from "@/lib/patterns";

export function Floor1Welcome() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-3xl bg-olive-200/60">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch" style={{ overflow: "visible" }}>
          {/* Text */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 p-10 lg:p-16 relative z-10">
            <div>
              <p className="text-sm font-semibold text-olive-950 mb-2">
                What is Codevator?
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-olive-700 leading-snug tracking-tight text-pretty">
                Ambient music while your agent codes — so the silence doesn&apos;t feel so long.
              </h2>
            </div>
            <a
              href="https://github.com/educlopez/codevator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-olive-950 hover:text-olive-700 transition-colors mt-auto"
            >
              Learn more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </div>

          {/* Terminal demo with wallpaper background */}
          <div className="w-full lg:w-1/2 relative overflow-visible">
            {/* Olive gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#9ca88f] to-[#596352] lg:rounded-l-3xl" />
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{ backgroundPosition: "center", backgroundImage: noisePattern }}
            />
            {/* Terminal */}
            <div className="relative z-10 p-6 lg:p-10 flex items-center h-full overflow-visible">
              <div className="lg:translate-x-12 w-full">
                <TerminalSimulation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
