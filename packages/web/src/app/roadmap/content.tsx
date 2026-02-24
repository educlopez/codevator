"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Floor5Rooftop } from "@/components/floors/Floor5Rooftop";
import {
  fetchRoadmapItems,
  FALLBACK_ITEMS,
  groupByStatus,
  type RoadmapItem,
  type RoadmapGroup,
} from "@/lib/roadmap";

function SkeletonCard() {
  return (
    <div className="relative pl-10">
      {/* Dot */}
      <div className="absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-olive-400 bg-olive-100" />
      {/* Badge skeleton */}
      <div className="mb-3 h-5 w-20 animate-pulse rounded-full bg-olive-200" />
      {/* Title skeleton */}
      <div className="mb-2 h-6 w-48 animate-pulse rounded bg-olive-200" />
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-olive-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-olive-200" />
      </div>
    </div>
  );
}

function TimelineSection({ group }: { group: RoadmapGroup }) {
  return (
    <div>
      <h3 className="font-display text-lg text-olive-950 mb-8 mt-4">
        {group.status}
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-olive-300" />

        <div className="flex flex-col gap-12">
          {group.items.map((item) => (
            <div key={item.title} className="relative pl-10">
              {/* Dot */}
              <div className="absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-olive-400 bg-olive-100" />

              <span className="inline-block mb-3 rounded-full bg-olive-200 px-2.5 py-0.5 text-xs font-medium text-olive-700">
                {item.status}
              </span>

              <h2 className="font-display text-xl text-olive-950 mb-1">
                {item.title}
              </h2>
              <p className="text-sm/7 text-olive-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RoadmapContent() {
  const [items, setItems] = useState<RoadmapItem[] | null>(null);

  useEffect(() => {
    fetchRoadmapItems()
      .then(setItems)
      .catch(() => setItems(FALLBACK_ITEMS));
  }, []);

  const groups: RoadmapGroup[] | null = items ? groupByStatus(items) : null;

  return (
    <main>
      <Header alwaysVisible />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl px-6 py-20 sm:py-28">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 sm:mb-20">
          <p className="text-sm/7 font-semibold text-olive-700">Roadmap</p>
          <h1 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            What&apos;s next
          </h1>
          <p className="text-base/7 text-olive-600 max-w-lg">
            Ideas we&apos;re exploring based on community feedback. Nothing here
            is a promise — just directions we&apos;re thinking about.
          </p>
        </div>

        {/* Timeline */}
        {groups === null ? (
          /* Skeleton loading state */
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-olive-300" />
            <div className="flex flex-col gap-12">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : (
          /* Grouped sections */
          <div className="flex flex-col gap-14">
            {groups.map((group) => (
              <TimelineSection key={group.status} group={group} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 sm:mt-28 rounded-xl bg-olive-950/[0.03] p-8 sm:p-10 text-center">
          <p className="font-display text-xl text-olive-950 mb-2">
            Have an idea?
          </p>
          <p className="text-sm/7 text-olive-600 mb-6">
            We&apos;d love to hear what you want next.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/educlopez/codevator/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-olive-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-800 transition-colors"
            >
              Open an issue
            </a>
            <a
              href="https://x.com/educalvolpz"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-olive-950/15 px-5 py-2.5 text-sm font-medium text-olive-950 hover:bg-olive-950/5 transition-colors"
            >
              Tell us on X
            </a>
          </div>
        </div>
      </div>

      {/* Footer — same as home */}
      <Floor5Rooftop />
    </main>
  );
}
