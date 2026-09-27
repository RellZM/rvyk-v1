"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import PostContentRenderer from "@/components/writing/PostContentRenderer";
import { getCategoryBadgeStyle } from "@/components/writing/PostCard";

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const { data, error } = await getSupabaseClient()
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setPost(data as Post);
      } catch (err) {
        console.error("Error fetching post by slug:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 px-6">
        <div className="mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="h-4 w-28 rounded bg-foreground/10" />
          <div className="h-10 w-4/5 rounded bg-foreground/10" />
          <div className="h-5 w-2/3 rounded bg-foreground/10" />
          <div className="aspect-[16/9] w-full rounded-2xl bg-foreground/10" />
          <div className="space-y-3 pt-6">
            <div className="h-4 w-full rounded bg-foreground/10" />
            <div className="h-4 w-5/6 rounded bg-foreground/10" />
            <div className="h-4 w-4/6 rounded bg-foreground/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl">📄</div>
          <h1 className="text-2xl font-bold text-foreground">Post Not Found</h1>
          <p className="text-sm text-foreground/60">
            Artikel yang kamu cari tidak ditemukan atau belum dipublikasikan.
          </p>
          <div className="pt-2">
            <Link
              href="/writing"
              className="inline-flex rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
            >
              ← Kembali ke Writing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = (post.content || "").split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const formattedDate = new Date(post.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="min-h-screen bg-background text-foreground pb-24">
      {/* Top Header Bar */}
      <div className="border-b border-foreground/10 bg-background/50 sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <Link
            href="/writing"
            className="inline-flex items-center gap-2 text-xs font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            ← Back to Writing
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {copiedLink ? "✓ Copied!" : "🔗 Share"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-10 md:pt-14">
        {/* Article Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide ${getCategoryBadgeStyle(
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
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
          {post.title}
        </h1>

        {/* Short description / Lead */}
        <p className="mt-4 text-lg leading-relaxed text-foreground/70 border-l-2 border-foreground/20 pl-4 italic">
          {post.short_description}
        </p>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="my-8 overflow-hidden rounded-2xl aspect-[16/9] w-full bg-foreground/5 border border-foreground/10 shadow-sm">
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <hr className="my-8 border-foreground/10" />

        {/* Main Article Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <PostContentRenderer content={post.content} />
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-foreground">Suka dengan artikel ini?</h4>
            <p className="text-xs text-foreground/60 mt-0.5">
              Jelajahi catatan, tugas perkuliahan, dan riset keamanan siber lainnya.
            </p>
          </div>
          <Link
            href="/writing"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-transform active:scale-95"
          >
            Explore More Writing →
          </Link>
        </div>
      </div>
    </article>
  );
}
