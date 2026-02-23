"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "GitHub", href: "https://github.com/educlopez/codevator" },
  { label: "npm", href: "https://www.npmjs.com/package/codevator" },
  { label: "Follow me", href: "https://x.com/educalvolpz" },
];

export function Header() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onElevator(e: Event) {
      const detail = (e as CustomEvent).detail;
      setVisible(detail === "opened");
    }
    window.addEventListener("codevator:elevator", onElevator);
    return () => window.removeEventListener("codevator:elevator", onElevator);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <nav className="bg-olive-100/80 backdrop-blur-md border-b border-olive-950/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-10">
          {/* Logo — left */}
          <div className="flex-1">
            <a href="#" className="font-display text-2xl text-olive-950">
              Codevator.
            </a>
          </div>

          {/* Nav links — center */}
          <div className="flex items-center gap-8 max-lg:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm/7 font-medium text-olive-700 hover:text-olive-950 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Get started — right */}
          <div className="flex flex-1 items-center justify-end">
            <a
              href="#get-started"
              className="rounded-full bg-olive-950 px-4 py-2 text-sm font-medium text-white hover:bg-olive-800 transition-colors max-sm:hidden"
            >
              Get started
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="inline-flex rounded-full p-1.5 text-olive-950 hover:bg-olive-950/10 lg:hidden"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path
                    fillRule="evenodd"
                    d="M3.75 8.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75ZM3.75 15.75a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-olive-950/5 bg-olive-100 px-6 pb-6 pt-4">
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-olive-950"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#get-started"
                className="rounded-full bg-olive-950 px-4 py-2 text-sm font-medium text-white text-center hover:bg-olive-800 transition-colors sm:hidden"
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
