"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 rounded-md px-2 py-1 text-xs font-medium text-olive-400 hover:text-olive-700 hover:bg-olive-950/5 transition-colors"
      aria-label="Copy command"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
