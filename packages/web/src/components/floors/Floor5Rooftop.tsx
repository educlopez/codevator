import { CopyCommand } from "../CopyCommand";

export function Floor5Rooftop() {
  return (
    <div className="w-full max-w-3xl mx-auto px-8 text-center space-y-10">
      <div>
        <p className="font-mono text-xs text-lumon-gray uppercase tracking-[0.3em] mb-4">
          Ready?
        </p>
        <h2 className="font-serif text-5xl md:text-6xl text-lumon-green leading-tight">
          Exit the elevator.
        </h2>
        <p className="font-serif text-3xl text-lumon-green/60 mt-2">
          Start building.
        </p>
      </div>

      <div className="flex justify-center">
        <CopyCommand command="npm install -g codevator" />
      </div>

      <div className="flex justify-center gap-8 font-mono text-sm">
        <a
          href="https://github.com/educlopez/codevator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lumon-gray hover:text-lumon-green transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://www.npmjs.com/package/codevator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lumon-gray hover:text-lumon-green transition-colors"
        >
          npm
        </a>
      </div>

      <div className="pt-12 border-t border-lumon-green/10">
        <p className="font-serif text-lg text-lumon-gray italic">
          &ldquo;The music stops when the work is done.
          <br />
          The work is never done.&rdquo;
        </p>
      </div>
    </div>
  );
}
