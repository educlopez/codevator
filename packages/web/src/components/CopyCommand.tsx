"use client";

import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-3 bg-lumon-dark rounded-lg px-6 py-4 border border-lumon-green/20 hover:border-lumon-green/40 transition-colors w-full max-w-md"
    >
      <span className="font-mono text-lumon-mint text-sm flex-1 text-left">
        $ {command}
      </span>
      <span className="font-mono text-xs text-lumon-gray group-hover:text-lumon-mint transition-colors">
        {copied ? "copied!" : "copy"}
      </span>
    </button>
  );
}
