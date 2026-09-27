"use client";

import React from "react";
import Image from "next/image";
import CodeBlock from "./CodeBlock";

interface PostContentRendererProps {
  content: string;
}

export default function PostContentRenderer({ content }: PostContentRendererProps) {
  if (!content) return null;

  // Render inline text formatting (bold, italic, inline code, link)
  const renderInline = (text: string) => {
    // Split by elements while preserving delimiters
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, index) => {
      if (!part) return null;

      // Inline code `code`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={index}
            className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-sm font-medium text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold **bold**
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic *italic*
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return (
          <em key={index} className="italic text-foreground/90">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Link [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-500 underline decoration-blue-500/30 underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-500"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // Parse blocks from markdown/structured text
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for Code Block (```lang)
    if (line.trim().startsWith("```")) {
      const lang = line.trim().replace(/^```/, "").trim() || "plaintext";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push(
        <CodeBlock
          key={`code-${i}`}
          code={codeLines.join("\n")}
          language={lang}
        />
      );
      continue;
    }

    // Check for Markdown Image ![alt](url)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1] || "Post image";
      const src = imgMatch[2];
      blocks.push(
        <figure key={`img-${i}`} className="my-8 overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
          <div className="relative aspect-video w-full overflow-hidden bg-foreground/5">
            {/* Using standard img with next/image styles for external/dynamic Supabase URLs */}
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
          {alt && alt !== "Post image" && (
            <figcaption className="border-t border-foreground/10 px-4 py-2.5 text-center text-xs text-foreground/60">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // Check for Headings
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${i}`} className="mt-8 mb-3 text-xl font-bold tracking-tight text-foreground">
          {renderInline(line.replace(/^###\s+/, ""))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground border-b border-foreground/10 pb-2">
          {renderInline(line.replace(/^##\s+/, ""))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${i}`} className="mt-12 mb-6 text-3xl font-extrabold tracking-tight text-foreground">
          {renderInline(line.replace(/^#\s+/, ""))}
        </h1>
      );
      i++;
      continue;
    }

    // Check for Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^>\s*/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-6 border-l-4 border-foreground/30 bg-foreground/[0.03] px-5 py-3 italic text-foreground/80 rounded-r-lg"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className="leading-relaxed">
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Check for Unordered List (- or *)
    if (line.match(/^[-*]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        listItems.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 pl-6 list-disc marker:text-foreground/40 text-foreground/85">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Check for Ordered List (1. 2. etc)
    if (line.match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        listItems.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 pl-6 list-decimal marker:text-foreground/40 text-foreground/85">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !lines[i].startsWith("```") &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].match(/^\d+\.\s+/) &&
      !lines[i].match(/^!\[(.*?)\]\((.*?)\)$/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    blocks.push(
      <p key={`p-${i}`} className="my-4 leading-relaxed text-foreground/85">
        {renderInline(paraLines.join(" "))}
      </p>
    );
  }

  return <div className="space-y-2 leading-relaxed text-foreground">{blocks}</div>;
}
