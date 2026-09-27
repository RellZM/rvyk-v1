"use client";

import React, { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "plaintext" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-foreground/10 bg-[#0d1117] text-[#e6edf3] shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-foreground/10 bg-[#161b22] px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block"></span>
          </div>
          <span className="ml-2 font-mono uppercase tracking-wider text-foreground/50">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-all hover:bg-white/20 hover:text-foreground active:scale-95"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.04]">
                <td className="w-8 select-none pr-4 text-right text-xs text-white/30 align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre text-[#c9d1d9]">
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
