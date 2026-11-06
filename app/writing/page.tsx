import React from "react";
import { getSupabaseClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import PolarBear from "@/components/PolarBear";
import WritingClient from "@/components/writing/WritingClient";

export const revalidate = 60;

async function getPublishedPosts(): Promise<Post[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("posts")
      .select("*")
      .eq("status", "published")
      .or("target.eq.writing,target.is.null")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as Post[];
    }
  } catch (err) {
    console.error("Error fetching writing posts on server:", err);
  }
  return [];
}

export default async function WritingPage() {
  const posts = await getPublishedPosts();

  // When there are no published posts yet, render Polar Bear immediately on server
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

  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-6 sm:py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          Writing
        </h1>
        <WritingClient posts={posts} />
      </div>
    </section>
  );
}
