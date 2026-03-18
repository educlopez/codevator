"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TAB_PANELS, TAB_TOC, type TabKey } from "./content";

const TABS: { key: TabKey; label: string }[] = [
  { key: "setup", label: "Setup" },
  { key: "sounds", label: "Sounds" },
  { key: "reference", label: "Reference" },
];

function isValidTab(value: string | null): value is TabKey {
  return value === "setup" || value === "sounds" || value === "reference";
}

function DocsTabsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const activeTab: TabKey = isValidTab(rawTab) ? rawTab : "setup";
  const tocItems = TAB_TOC[activeTab];

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "setup") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(`/docs${query ? `?${query}` : ""}`, { scroll: false });
    },
    [searchParams, router],
  );

  return (
    <>
      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-olive-100/80 backdrop-blur-md border-b border-olive-950/10 mb-12 overflow-x-auto -mx-6 px-6 lg:-mx-10 lg:px-10 pt-4">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-olive-950 border-b-2 border-olive-950"
                  : "text-olive-500 hover:text-olive-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-16">
        {/* Table of contents — desktop sidebar */}
        <nav className="hidden lg:block w-48 shrink-0 sticky top-36 self-start pt-4">
          <ul className="flex flex-col gap-2.5">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-olive-500 hover:text-olive-950 transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* All tab panels — all in HTML for SEO, hidden/shown via CSS */}
        <div className="flex flex-col gap-16 min-w-0 w-full">
          {TAB_PANELS.map((panel) => (
            <div
              key={panel.key}
              className={activeTab === panel.key ? "" : "hidden"}
            >
              <div className="flex flex-col gap-16">
                {panel.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function DocsTabs() {
  return (
    <Suspense>
      <DocsTabsInner />
    </Suspense>
  );
}
