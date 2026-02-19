import { TerminalSimulation } from "../TerminalSimulation";

export function Floor1Welcome() {
  return (
    <div className="w-full max-w-5xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-12">
      <div className="flex-1 space-y-6">
        <div className="font-mono text-xs text-lumon-gray uppercase tracking-[0.3em]">
          What is Codevator?
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-lumon-green leading-tight">
          Your coding agent
          <br />
          works in silence.
        </h2>
        <p className="font-serif text-xl text-lumon-green/70 leading-relaxed">
          Codevator plays ambient music while your AI coding agent thinks,
          writes, and refactors. Five sound modes — from lo-fi elevator
          to retro 8-bit — so the silence doesn&apos;t feel so long.
        </p>
        <div className="border-t border-lumon-green/20 pt-4">
          <p className="font-mono text-sm text-lumon-gray">
            Works with Claude Code. Hooks in automatically. Your outie just has to set it up.
          </p>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <TerminalSimulation />
      </div>
    </div>
  );
}
