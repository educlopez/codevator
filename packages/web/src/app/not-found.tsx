import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-olive-100 px-6 text-center">
      <p className="font-mono text-sm text-olive-400 tracking-widest uppercase">
        Floor not found
      </p>
      <h1 className="font-display text-6xl/tight sm:text-8xl/tight text-olive-950 mt-4 tracking-tight">
        404
      </h1>
      <p className="text-lg text-olive-600 mt-4 max-w-md">
        This floor doesn&apos;t exist. The elevator only goes so high.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-olive-950 px-6 py-2.5 text-sm font-medium text-olive-100 hover:bg-olive-800 transition-colors"
      >
        Back to lobby
      </Link>
    </div>
  );
}
