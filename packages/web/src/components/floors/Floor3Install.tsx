import { CopyCommand } from "../CopyCommand";

export function Floor3Install() {
  return (
    <div className="w-full max-w-3xl mx-auto px-8 space-y-12">
      <div className="text-center">
        <p className="font-mono text-xs text-lumon-gray uppercase tracking-[0.3em] mb-4">
          Get Started
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-lumon-green">
          Three steps. That&apos;s it.
        </h2>
      </div>

      <div className="space-y-8">
        <div className="border border-lumon-green/15 rounded-lg p-8 bg-lumon-cream/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-lumon-green text-lumon-mint flex items-center justify-center font-mono font-bold shrink-0">
              1
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="font-serif text-xl text-lumon-dark">
                Install
              </h3>
              <p className="font-mono text-sm text-lumon-gray">
                One command sets up the hooks. Codevator integrates directly
                with Claude Code — no config files, no setup wizards.
              </p>
              <CopyCommand command="npx codevator setup" />
            </div>
          </div>
        </div>

        <div className="border border-lumon-green/15 rounded-lg p-8 bg-lumon-cream/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-lumon-green text-lumon-mint flex items-center justify-center font-mono font-bold shrink-0">
              2
            </div>
            <div className="space-y-3">
              <h3 className="font-serif text-xl text-lumon-dark">
                Code
              </h3>
              <p className="font-mono text-sm text-lumon-gray">
                Music starts automatically when your agent begins working.
                Stops when it&apos;s done. You don&apos;t need to do anything.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-lumon-green/15 rounded-lg p-8 bg-lumon-cream/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-lumon-green text-lumon-mint flex items-center justify-center font-mono font-bold shrink-0">
              3
            </div>
            <div className="space-y-3">
              <h3 className="font-serif text-xl text-lumon-dark">
                Customize
              </h3>
              <p className="font-mono text-sm text-lumon-gray">
                Switch modes, adjust volume, or tell your agent directly.
                It listens.
              </p>
              <div className="font-mono text-sm text-lumon-gray/70 space-y-1">
                <p>$ codevator mode retro</p>
                <p>$ codevator volume 50</p>
                <p>$ codevator off</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
