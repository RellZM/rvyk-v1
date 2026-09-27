"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import PolarBear from "@/components/PolarBear";

export default function WritingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPublishedPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .or("target.eq.writing,target.is.null")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setPosts(data as Post[]);
        }
      } catch (err) {
        console.error("Error fetching writing posts:", err);
      }
    }

    fetchPublishedPosts();
  }, []);

  // When there are no published posts yet, render Polar Bear immediately (zero delay/flash)
  if (posts.length === 0) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6">
        <h1 className="pointer-events-none select-none text-center text-[clamp(2.5rem,10vw,7rem)] font-extrabold uppercase tracking-tight text-foreground">
          Coming Soon
        </h1>
        <p className="pointer-events-none mt-3 select-none text-center text-sm text-foreground/60 sm:text-base">
          A few hobby projects are still brewing behind the scenes — check back soon.
        </p>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <PolarBear />
        </div>
      </section>
    );
  }

  // Work-like format when posts exist
  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          Writing
        </h1>

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
      </div>
    </section>
  );
}

