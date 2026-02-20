import { CopyCommand } from "../CopyCommand";

export function Floor5Rooftop() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
      <div className="flex flex-col items-center gap-10 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
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

        <div className="pt-10 border-t border-olive-950/10 w-full text-center">
          <p className="font-display text-lg text-olive-600 italic">
            &ldquo;The music stops when the work is done.
            <br />
            The work is never done.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
