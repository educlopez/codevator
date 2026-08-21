"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ActivityBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      fetch("/api/activity-beacon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, title: document.title }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Never let the beacon affect rendering.
    }
  }, [pathname]);

  return null;
}
