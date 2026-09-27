import React from "react";
import Link from "next/link";
import { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

export function getCategoryBadgeStyle(category: string) {
  switch (category) {
    case "Research cysec":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "Tugas":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "Hobi":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    default:
      return "bg-foreground/10 text-foreground/80 border-foreground/15";
  }
}

export default function PostCard({ post }: PostCardProps) {
  // Estimate reading time (~200 words per minute)
  const wordCount = (post.content || "").split(/\s+/).length + (post.short_description || "").split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const formattedDate = new Date(post.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.04] hover:shadow-xl hover:-translate-y-0.5">
      {post.cover_image && (
        <div className="mb-4 overflow-hidden rounded-xl aspect-[16/9] w-full bg-foreground/5 relative">
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-1">
        {/* Category & Meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${getCategoryBadgeStyle(
              post.category
            )}`}
          >
            {post.category}
          </span>
          <span className="text-xs text-foreground/40">•</span>
          <time dateTime={post.created_at} className="text-xs text-foreground/50">
            {formattedDate}
          </time>
          <span className="text-xs text-foreground/40">•</span>
          <span className="text-xs text-foreground/50">{readTimeMinutes} min read</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-blue-500">
          <Link href={`/writing/${post.slug}`}>
            <span className="absolute inset-0 z-10" />
            {post.title}
          </Link>
        </h2>

        {/* Short Description */}
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-foreground/60">
          {post.short_description}
        </p>
      </div>

      {/* Footer link arrow */}
      <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-4 text-xs font-medium text-foreground/60">
        <span className="group-hover:text-foreground transition-colors">Read article</span>
        <span className="transform transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground">
          →
        </span>
      </div>
    </article>
  );
}
