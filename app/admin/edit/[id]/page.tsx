"use client";

import React, { useEffect, useState, use } from "react";
import { getSupabaseClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import PostForm from "@/components/admin/PostForm";
import Link from "next/link";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
      const { data, error } = await getSupabaseClient()
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (error) throw error;
        setPost(data as Post);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-foreground border-t-transparent mb-4" />
        <p className="text-sm text-foreground/60">Loading post data from Supabase...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500">Post Not Found</h2>
        <p className="text-sm text-foreground/70">{error || "Could not find the requested post."}</p>
        <Link
          href="/admin"
          className="inline-flex rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
        >
          ← Back to Admin
        </Link>
      </div>
    );
  }

  return <PostForm initialData={post} isEdit={true} />;
}
