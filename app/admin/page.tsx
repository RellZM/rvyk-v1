"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import { getCategoryBadgeStyle } from "@/components/writing/PostCard";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      setPosts((data as Post[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load content from Supabase";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert("Error deleting item: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      const { error } = await supabase
        .from("posts")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", post.id);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
      );
    } catch (err: unknown) {
      alert("Error updating status: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const postTarget = post.target || "writing";
    const matchesTarget =
      selectedTarget === "All" || postTarget.toLowerCase() === selectedTarget.toLowerCase();

    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.slug && post.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.role && post.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;

    return matchesTarget && matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground/50 mb-1">
            <Link href="/writing" className="hover:text-foreground transition-colors">
              ← Back to Writing
            </Link>
            <span>•</span>
            <span>Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manage Content
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Create, edit, publish, and delete your Writing articles & Work projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            title="Refresh list"
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            <span>↻</span>
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/new-post"
            className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 shadow-sm"
          >
            <span>🗎</span>
            <span>Create New Entry</span>
          </Link>
        </div>
      </div>

      {/* Target Tabs: All | Writing | Work */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2">
          {[
            { key: "All", label: "All Content", count: posts.length },
            {
              key: "writing",
              label: "Writing",
              count: posts.filter((p) => !p.target || p.target === "writing").length,
            },
            {
              key: "work",
              label: "Work Projects",
              count: posts.filter((p) => p.target === "work").length,
            },
          ].map((tab) => {
            const isActive = selectedTarget === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setSelectedTarget(tab.key);
                  setSelectedCategory("All");
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-foreground/10 bg-background text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span className="font-mono text-sm">{isActive ? "🗁" : "🗀"}</span>
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-background/20 text-background"
                      : "bg-foreground/10 text-foreground/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by title, role, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-foreground/10 bg-background px-3.5 py-2 text-xs text-foreground placeholder-foreground/40 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          <div className="font-semibold">Failed to fetch from Supabase</div>
          <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
          <p className="mt-2 text-xs text-foreground/70">
            Make sure you have created the <code>posts</code> table in your Supabase SQL Editor and that RLS policies are enabled.
          </p>
        </div>
      )}

      {/* Content Table / List */}
      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-background/50 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-foreground/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent mb-3" />
            <p className="text-sm">Loading items from Supabase...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="text-3xl mb-2 font-mono">🗀</div>
            <h3 className="text-base font-semibold text-foreground">No entries found</h3>
            <p className="mt-1 text-xs text-foreground/50 max-w-sm">
              {searchQuery || selectedTarget !== "All"
                ? "Try adjusting your search or target filter."
                : "You haven't created any entries yet. Click 'Create New Entry' to start!"}
            </p>
            {!searchQuery && selectedTarget === "All" && (
              <Link
                href="/admin/new-post"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
              >
                <span>🗎</span>
                <span>Create New Entry</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-foreground/10 bg-foreground/[0.02] text-xs uppercase tracking-wider text-foreground/60">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Title & Details</th>
                  <th className="px-4 py-3.5 font-semibold">Destination</th>
                  <th className="px-4 py-3.5 font-semibold">Category / Role</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {filteredPosts.map((post) => {
                  const isWork = post.target === "work";
                  return (
                    <tr
                      key={post.id}
                      className="transition-colors hover:bg-foreground/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground max-w-md line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-xs text-foreground/50 max-w-md line-clamp-1 mt-0.5">
                          {post.short_description}
                        </div>
                        <div className="text-[11px] font-mono text-foreground/30 mt-1">
                          {isWork
                            ? post.link_url || `Work item (${post.year || "2026"})`
                            : `/writing/${post.slug}`}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            isWork
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          }`}
                        >
                          {isWork ? "Work" : "Writing"}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            isWork
                              ? "border-foreground/10 bg-foreground/5 text-foreground/80 font-mono text-[11px]"
                              : getCategoryBadgeStyle(post.category)
                          }`}
                        >
                          {isWork ? post.role || post.category : post.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          title="Click to toggle Draft / Published"
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all hover:scale-105 ${
                            post.status === "published"
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              post.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span className="capitalize">{post.status}</span>
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs text-foreground/60">
                        {new Date(post.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === "published" && (
                            <Link
                              href={
                                isWork
                                  ? post.link_url || "/work"
                                  : `/writing/${post.slug}`
                              }
                              target={isWork && post.link_url ? "_blank" : undefined}
                              className="rounded px-2 py-1 text-foreground/60 hover:bg-foreground/5 hover:text-foreground font-medium"
                            >
                              View ↗
                            </Link>
                          )}
                          <Link
                            href={`/admin/edit/${post.id}`}
                            className="rounded px-2 py-1 text-blue-500 hover:bg-blue-500/10 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={deletingId === post.id}
                            className="rounded px-2 py-1 text-red-500 hover:bg-red-500/10 font-medium disabled:opacity-50"
                          >
                            {deletingId === post.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
