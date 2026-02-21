import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-olive-950 px-6 overflow-hidden">
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 100 100"><filter id="n"><feTurbulence type="turbulence" baseFrequency="1.4" numOctaves="1" seed="2" stitchTiles="stitch" result="n"/><feComponentTransfer result="g"><feFuncR type="linear" slope="4" intercept="1"/><feFuncG type="linear" slope="4" intercept="1"/><feFuncB type="linear" slope="4" intercept="1"/></feComponentTransfer><feColorMatrix type="saturate" values="0" in="g"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
          )}")`,
        }}
      />

      {/* Thin horizontal corridor lines */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-olive-700/20" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-olive-700/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Floor indicator panel */}
        <div className="flex items-center justify-center w-28 h-16 rounded-sm bg-olive-900 border border-olive-600/40 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]">
          <span className="font-mono text-3xl text-olive-100 tracking-wider tabular-nums">
            404
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-olive-600/40 my-0" />

        {/* Corporate memo card */}
        <div className="border border-olive-600/30 bg-olive-900/60 backdrop-blur-sm px-8 py-8 sm:px-12 sm:py-10">
          {/* Memo header */}
          <p className="font-mono text-[10px] text-olive-200 tracking-[0.3em] uppercase">
            Interoffice Memo
          </p>
          <div className="w-8 h-px bg-olive-500/50 mx-auto mt-3 mb-6" />

          {/* Department stamp */}
          <p className="font-mono text-xs text-olive-300 tracking-widest uppercase mb-4">
            Dept. of Elevator Operations
          </p>

          <h1 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
            This floor does not exist.
          </h1>

          <p className="text-sm/6 text-olive-200 mt-4 max-w-sm mx-auto">
            The floor you have requested is not part of the approved building
            directory. Please do not attempt to access unauthorized floors.
          </p>

          <p className="font-display italic text-sm text-olive-300 mt-6">
            Your compliance is appreciated.
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-olive-600/30 mt-6 mb-6" />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-olive-400/40 px-6 py-2.5 text-sm font-medium text-olive-100 hover:bg-olive-800/60 hover:border-olive-300/50 transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Return to lobby
          </Link>
        </div>

        {/* Small footnote */}
        <p className="font-mono text-[9px] text-olive-400 tracking-widest uppercase mt-8">
          Codevator Building Services
        </p>
      </div>
    </div>
  );
}
