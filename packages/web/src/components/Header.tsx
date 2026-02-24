"use client";

import { useState, useEffect } from "react";

const NAV_PAGES = [
  { label: "Docs", href: "/docs" },
  { label: "Sounds", href: "/sounds" },
  { label: "Roadmap", href: "/roadmap" },
];

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/educlopez/codevator",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
      </svg>
    ),
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/codevator",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M3 3h18v18H3V3Zm2.25 2.25v13.5h6.75v-11.25h4.5v11.25h2.25V5.25H5.25Z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/educalvolpz",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
  },
];

export function Header({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const [visible, setVisible] = useState(alwaysVisible);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (alwaysVisible) return;
    function onElevator(e: Event) {
      const detail = (e as CustomEvent).detail;
      setVisible(detail === "opened");
    }
    window.addEventListener("codevator:elevator", onElevator);
    return () => window.removeEventListener("codevator:elevator", onElevator);
  }, [alwaysVisible]);

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
            <a href="/" className="font-display text-2xl text-olive-950">
              Codevator.
            </a>
          </div>

          {/* Pages — center */}
          <div className="flex items-center gap-8 max-lg:hidden">
            {NAV_PAGES.map((page) => (
              <a
                key={page.label}
                href={page.href}
                className="text-sm/7 font-medium text-olive-700 hover:text-olive-950 transition-colors"
              >
                {page.label}
              </a>
            ))}
          </div>

          {/* Social icons + CTA — right */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <div className="flex items-center gap-1 max-lg:hidden">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full p-2 text-olive-500 hover:text-olive-950 hover:bg-olive-950/5 transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            <a
              href="#get-started"
              className="ml-3 rounded-full bg-olive-950 px-4 py-2 text-sm font-medium text-white hover:bg-olive-800 transition-colors max-sm:hidden"
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
              {NAV_PAGES.map((page) => (
                <a
                  key={page.label}
                  href={page.href}
                  className="text-lg font-medium text-olive-950"
                  onClick={() => setMenuOpen(false)}
                >
                  {page.label}
                </a>
              ))}

              <div className="flex items-center gap-3 pt-2 border-t border-olive-950/10">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full p-2 text-olive-500 hover:text-olive-950 hover:bg-olive-950/5 transition-colors"
                    aria-label={link.label}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>

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
