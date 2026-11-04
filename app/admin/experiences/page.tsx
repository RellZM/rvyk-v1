"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";

// Fallback dummy experiences if database has no items yet
const DEFAULT_FALLBACK_EXPERIENCES: Partial<Post>[] = [
  {
    id: "default-1",
    title: "Donasi Anak Yatim - UI/UX",
    year: "2025",
    role: "UI/UX Design",
    status: "published",
    short_description: "Final project for Software Engineering course - donation app",
    created_at: new Date("2025-01-01").toISOString(),
  },
  {
    id: "default-2",
    title: "Schematics 2026",
    year: "2026",
    role: "Frontend Developer",
    status: "published",
    short_description: "Competition registration platform for Informatics Engineering annual event",
    created_at: new Date("2026-01-01").toISOString(),
  },
  {
    id: "default-3",
    title: "Personal Portfolio",
    year: "2025",
    role: "Frontend Developer",
    status: "published",
    short_description: "Portfolio website to showcase engineering and design works",
    created_at: new Date("2025-06-01").toISOString(),
  },
];

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await getSupabaseClient()
        .from("posts")
        .select("*")
        .eq("target", "work")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setExperiences(data as Post[]);
        setIsUsingFallback(false);
      } else {
        // Fallback to initial default projects if no experiences exist yet in db
        setExperiences(DEFAULT_FALLBACK_EXPERIENCES as Post[]);
        setIsUsingFallback(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load experiences from database";
      setErrorMsg(msg);
      setExperiences(DEFAULT_FALLBACK_EXPERIENCES as Post[]);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete experience "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      // If it's a real database entry (not mock fallback ID)
      if (!id.startsWith("default-")) {
        const { error } = await getSupabaseClient().from("posts").delete().eq("id", id);
        if (error) throw error;
      }

      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error while deleting";
      alert("Error deleting experience: " + msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (exp: Post) => {
    if (exp.id.startsWith("default-")) {
      setExperiences((prev) =>
        prev.map((e) =>
          e.id === exp.id
            ? { ...e, status: e.status === "published" ? "draft" : "published" }
            : e
        )
      );
      return;
    }

    const nextStatus = exp.status === "published" ? "draft" : "published";
    try {
      const { error } = await getSupabaseClient()
        .from("posts")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", exp.id);

      if (error) throw error;

      setExperiences((prev) =>
        prev.map((e) => (e.id === exp.id ? { ...e, status: nextStatus } : e))
      );
    } catch (err: unknown) {
      alert("Error updating status: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const filteredExperiences = experiences.filter((exp) => {
    const q = searchQuery.toLowerCase();
    return (
      exp.title?.toLowerCase().includes(q) ||
      exp.role?.toLowerCase().includes(q) ||
      exp.year?.toLowerCase().includes(q) ||
      exp.short_description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground/50 mb-1">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <span>Experiences</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Experiences / Works
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Manage, publish, and delete your portfolio items and work experiences.
          </p>
        </div>

        <Link
          href="/admin/new-post"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/90 active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          <span>Add Experience</span>
        </Link>
      </div>

      {/* Info notice if showing fallback items */}
      {isUsingFallback && !loading && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-400">
          <strong>Notice:</strong> Currently displaying local fallback works because no custom work items were found in Supabase. You can delete or add new experiences anytime.
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search experiences by title, role, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-foreground/10 bg-background/50 px-3.5 py-2 text-sm text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30 font-mono"
          />
        </div>
        <div className="text-xs text-foreground/50 font-mono">
          Total: {filteredExperiences.length} items
        </div>
      </div>

      {/* Experiences Table */}
      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-background/40">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-foreground/50">
            Loading experiences...
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl mb-2 font-mono">🗀</span>
            <p className="text-sm font-medium text-foreground">No experiences found</p>
            <p className="text-xs text-foreground/50 mt-1">
              {searchQuery ? "Try matching a different search term." : "Click Add Experience to create your first work."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-foreground/5 text-foreground/70 font-mono text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">Title & Description</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10 bg-background/50">
                {filteredExperiences.map((exp) => {
                  const isMock = exp.id.startsWith("default-");
                  const isDeleting = deletingId === exp.id;

                  return (
                    <tr
                      key={exp.id}
                      className="transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground max-w-md line-clamp-1">
                          {exp.title}
                        </div>
                        {exp.short_description && (
                          <div className="text-xs text-foreground/50 max-w-md line-clamp-1 mt-0.5">
                            {exp.short_description}
                          </div>
                        )}
                        {exp.link_url && (
                          <div className="text-[11px] font-mono text-foreground/30 mt-1 line-clamp-1">
                            {exp.link_url}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-foreground/80">
                        {exp.role || "Developer"}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-foreground/70">
                        {exp.year || "2026"}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(exp)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all hover:scale-105 ${
                            exp.status === "published"
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              exp.status === "published"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="capitalize">{exp.status || "published"}</span>
                        </button>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-2">
                          {exp.link_url ? (
                            <a
                              href={exp.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded px-2 py-1 text-foreground/60 hover:bg-foreground/5 hover:text-foreground font-medium"
                            >
                              View ↗
                            </a>
                          ) : (
                            <Link
                              href="/work"
                              className="rounded px-2 py-1 text-foreground/60 hover:bg-foreground/5 hover:text-foreground font-medium"
                            >
                              View
                            </Link>
                          )}

                          {!isMock && (
                            <Link
                              href={`/admin/edit/${exp.id}`}
                              className="rounded px-2 py-1 text-blue-500 hover:bg-blue-500/10 font-medium"
                            >
                              Edit
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id, exp.title)}
                            disabled={isDeleting}
                            className="rounded px-2 py-1 text-red-500 hover:bg-red-500/10 font-medium disabled:opacity-50 transition-colors"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
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
