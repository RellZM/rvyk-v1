"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Post } from "@/types/post";

export default function WritingClient({ posts }: { posts: Post[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="mt-8">
      {posts.map((p, i) => (
        <div
          key={p.id}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          className="border-b border-foreground/10 py-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Link href={`/writing/${p.slug}`}>
              <h2
                className={`text-xl font-bold transition-colors duration-150 ease-out sm:text-2xl hover:text-[#6A00FF] ${
                  hovered === i ? "text-foreground" : "text-foreground/70"
                }`}
              >
                {p.title}
              </h2>
            </Link>
            <span className="font-mono text-xs text-foreground/40">
              {new Date(p.created_at).toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
              })}{" "}
              {p.category ? `- ${p.category}` : ""}
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm text-foreground/60">{p.short_description}</p>

          <Link
            href={`/writing/${p.slug}`}
            className="mt-2 inline-block text-sm text-[#6A00FF] underline underline-offset-2 transition-opacity duration-150 ease-out hover:opacity-70"
          >
            Read article ↗
          </Link>

          {p.cover_image && (
            <div
              className="grid overflow-hidden transition-all duration-300 ease-out"
              style={{ gridTemplateRows: hovered === i ? "1fr" : "0fr" }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    className="h-40 w-auto shrink-0 rounded-lg object-cover ring-1 ring-foreground/10 sm:h-56"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

