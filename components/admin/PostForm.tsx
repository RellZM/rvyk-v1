"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostCategory, POST_CATEGORIES, Post } from "@/types/post";
import { supabase } from "@/utils/supabase/client";
import { uploadPostImage } from "@/utils/supabase/storage";
import PostContentRenderer from "@/components/writing/PostContentRenderer";
import { getCategoryBadgeStyle } from "@/components/writing/PostCard";

interface PostFormProps {
  initialData?: Post;
  isEdit?: boolean;
}

export default function PostForm({ initialData, isEdit = false }: PostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [target, setTarget] = useState<"writing" | "work">(
    initialData?.target || "writing"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData?.slug));
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || "");
  const [category, setCategory] = useState<PostCategory>(
    initialData?.category || "Research cysec"
  );
  const [year, setYear] = useState<string>(
    initialData?.year || new Date().getFullYear().toString()
  );
  const [role, setRole] = useState<string>(
    initialData?.role || "Frontend Developer"
  );
  const [linkUrl, setLinkUrl] = useState<string>(initialData?.link_url || "");
  const [linkLabel, setLinkLabel] = useState<string>(
    initialData?.link_label || "Visit live site"
  );
  const [coverImage, setCoverImage] = useState<string>(initialData?.cover_image || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.images || []
  );
  const [content, setContent] = useState<string>(
    initialData?.content ||
      "## Introduction\n\nWrite your introduction here...\n\n### Code Demonstration\n\n```typescript\n// Example code\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet('World'));\n```\n\n### Key Takeaways\n\n- Point 1\n- Point 2\n- Point 3\n"
  );
  const [status, setStatus] = useState<"published" | "draft">(
    initialData?.status || "published"
  );

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");

  // Auto-generate slug from title if not manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustomized) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  // Upload Cover Image handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setErrorMsg(null);
    const { url, error } = await uploadPostImage(file);
    setUploadingCover(false);

    if (error) {
      setErrorMsg(`Cover image upload failed: ${error}`);
      return;
    }

    if (url) {
      setCoverImage(url);
    }
  };

  // Upload Gallery Image for Work
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setErrorMsg(null);

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const { url } = await uploadPostImage(files[i]);
      if (url) newUrls.push(url);
    }

    setUploadingGallery(false);
    if (newUrls.length > 0) {
      setGalleryImages((prev) => [...prev, ...newUrls]);
    }
  };

  // Upload Inline Image handler (inserts markdown image tag at cursor position)
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInline(true);
    setErrorMsg(null);
    const { url, error } = await uploadPostImage(file);
    setUploadingInline(false);

    if (error) {
      setErrorMsg(`Inline image upload failed: ${error}`);
      return;
    }

    if (url) {
      const imageTag = `\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n\n`;
      insertTextAtCursor(imageTag);
    }

    if (inlineImageInputRef.current) {
      inlineImageInputRef.current.value = "";
    }
  };

  // Helper to insert snippet at cursor
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  const handleInsertCode = (lang: string = "bash") => {
    const snippet = `\n\`\`\`${lang}\n# Your ${lang} code here\n\`\`\`\n`;
    insertTextAtCursor(snippet);
  };

  const handleSubmit = async (targetStatus?: "published" | "draft") => {
    const finalStatus = targetStatus || status;
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter a title.");
      return;
    }
    if (target === "writing" && !slug.trim()) {
      setErrorMsg("Please provide a slug.");
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMsg("Please provide a short description.");
      return;
    }

    setSaving(true);
    try {
      const safeSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-") +
          "-" +
          Date.now();

      const finalCategory =
        target === "writing" ? category : role.trim() || "Project";

      const finalImages =
        galleryImages.length > 0
          ? galleryImages
          : coverImage
          ? [coverImage]
          : [];

      const payload = {
        target,
        title: title.trim(),
        slug: safeSlug,
        short_description: shortDescription.trim(),
        category: finalCategory,
        cover_image: coverImage || (finalImages.length > 0 ? finalImages[0] : null),
        content: content.trim() || shortDescription.trim(),
        status: finalStatus,
        year: year.trim(),
        role: role.trim(),
        link_url: linkUrl.trim() || null,
        link_label: linkLabel.trim() || null,
        images: finalImages,
        updated_at: new Date().toISOString(),
      };

      if (isEdit && initialData?.id) {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert([
          {
            ...payload,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save entry";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-foreground/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <span>{isEdit ? "Edit Content" : "Create New"}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? `Edit: ${initialData?.title}` : "Create New Content"}
          </h1>
        </div>

        {/* Tab switch for live preview (only for Writing) */}
        {target === "writing" && (
          <div className="flex items-center rounded-lg border border-foreground/10 bg-background/50 p-1">
            <button
              type="button"
              onClick={() => setPreviewTab("edit")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                previewTab === "edit"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("preview")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                previewTab === "preview"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Live Preview
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          <strong>Error: </strong> {errorMsg}
        </div>
      )}

      {/* Target Destination Selector: Writing vs Work */}
      <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 shadow-sm">
        <label className="text-sm font-semibold text-foreground block mb-2">
          Pilih Tempat Publikasi (Destination) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTarget("writing")}
            className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
              target === "writing"
                ? "border-foreground bg-foreground/[0.04] ring-1 ring-foreground/20 shadow-sm"
                : "border-foreground/10 bg-background/40 hover:bg-foreground/[0.02]"
            }`}
          >
            <span className="text-xl font-mono text-foreground/80">
              {target === "writing" ? "🗁" : "🗀"}
            </span>
            <div>
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                Writing
                {target === "writing" && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/60 mt-0.5">
                Artikel, catatan riset, writeup cybersec, atau tutorial dengan full Markdown.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTarget("work")}
            className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
              target === "work"
                ? "border-foreground bg-foreground/[0.04] ring-1 ring-foreground/20 shadow-sm"
                : "border-foreground/10 bg-background/40 hover:bg-foreground/[0.02]"
            }`}
          >
            <span className="text-xl font-mono text-foreground/80">
              {target === "work" ? "🗁" : "🗀"}
            </span>
            <div>
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                Work (Project Portfolio)
                {target === "work" && (
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/60 mt-0.5">
                Proyek showcase dengan tahun, role/posisi, link live demo, dan screenshot.
              </p>
            </div>
          </button>
        </div>
      </div>

      {previewTab === "preview" && target === "writing" ? (
        /* Live Preview Mode */
        <div className="rounded-2xl border border-foreground/10 bg-background/50 p-6 md:p-10 shadow-sm space-y-6">
          <div className="border-b border-foreground/10 pb-6">
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${getCategoryBadgeStyle(
                  category
                )}`}
              >
                {category}
              </span>
              <span className="text-xs text-foreground/50 font-mono">
                /writing/{slug || "preview-slug"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {title || "Untitled Post"}
            </h1>
            <p className="mt-3 text-lg text-foreground/70 leading-relaxed">
              {shortDescription || "No short description provided yet."}
            </p>
          </div>

          {coverImage && (
            <div className="overflow-hidden rounded-xl aspect-[21/9] w-full bg-foreground/5">
              <img
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="pt-4">
            <PostContentRenderer content={content} />
          </div>
        </div>
      ) : (
        /* Editor Mode */
        <div className="space-y-6">
          {/* Main Details Grid */}
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-foreground/10 bg-background/50 p-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {target === "writing" ? "Judul Artikel" : "Nama Proyek (Project Title)"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={
                  target === "writing"
                    ? "Contoh: Analisis Keamanan Web & CTF Writeup"
                    : "Contoh: Schematics 2026 / Antasena ITS"
                }
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-base font-medium text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
            </div>

            {/* Writing specific: Slug & Category */}
            {target === "writing" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-foreground/40 font-mono">
                      /writing/<strong>{slug || "slug-url"}</strong>
                    </span>
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugCustomized(true);
                    }}
                    placeholder="analisis-keamanan-web"
                    className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2 text-sm font-mono text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PostCategory)}
                    className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  >
                    {POST_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Work specific: Year, Role, Link */}
            {target === "work" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Year */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-medium text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Role / Posisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: Frontend Developer, UI/UX Design"
                    className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-medium text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  />
                </div>

                {/* Link Label & URL */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Link External (Opsional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={linkLabel}
                      onChange={(e) => setLinkLabel(e.target.value)}
                      placeholder="Label: Visit live site"
                      className="w-1/2 rounded-xl border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground placeholder-foreground/30 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="URL: https://..."
                      className="w-1/2 rounded-xl border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground placeholder-foreground/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status row */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Status Publikasi
              </label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === "published"}
                    onChange={() => setStatus("published")}
                    className="text-foreground focus:ring-0"
                  />
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-500">
                    🟢 Published (Tampil di {target === "writing" ? "Writing" : "Work"})
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    className="text-foreground focus:ring-0"
                  />
                  <span className="inline-flex items-center gap-1.5 font-medium text-amber-500">
                    🟡 Draft (Disembunyikan)
                  </span>
                </label>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {target === "writing" ? "Deskripsi Singkat Artikel" : "Deskripsi Proyek"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                placeholder={
                  target === "writing"
                    ? "Ringkasan singkat 1-2 kalimat untuk preview di halaman utama writing..."
                    : "Jelaskan tentang proyek ini, teknologi yang digunakan, atau peran Anda..."
                }
                className="w-full resize-y rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
            </div>

            {/* Cover / Project Images Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {target === "writing"
                  ? "Cover Image Artikel (Opsional)"
                  : "Foto / Screenshot Proyek (Gallery)"}
              </label>

              {target === "writing" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
                  >
                    {uploadingCover ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                        Uploading to Supabase...
                      </>
                    ) : (
                      <>+ Upload Cover Image</>
                    )}
                  </button>

                  <span className="text-xs text-foreground/40">atau masukkan URL langsung:</span>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground placeholder-foreground/30 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingGallery}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
                    >
                      {uploadingGallery ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                          Uploading Screenshots...
                        </>
                      ) : (
                        <>+ Upload Screenshots (Multiple)</>
                      )}
                    </button>
                    <span className="text-xs text-foreground/50">
                      Foto akan muncul di preview hover pada halaman Work.
                    </span>
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {galleryImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-lg border border-foreground/10 overflow-hidden group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="h-24 w-36 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setGalleryImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-90 transition-opacity hover:opacity-100"
                            title="Remove image"
                          >
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {target === "writing" && coverImage && (
                <div className="relative mt-2 inline-block rounded-lg border border-foreground/10 overflow-hidden group">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="h-28 w-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-90 transition-opacity hover:opacity-100"
                    title="Remove cover image"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Editor (Only for Writing) */}
          {target === "writing" && (
            <div className="rounded-2xl border border-foreground/10 bg-background/50 p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 pb-3">
                <label className="text-sm font-semibold text-foreground">
                  Konten Artikel (Markdown, Kode, & Gambar) <span className="text-red-500">*</span>
                </label>

                {/* Formatting Helper Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("## Subheading\n")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-semibold text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                    title="Add H2 Heading"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("### Section Title\n")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-semibold text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                    title="Add H3 Heading"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("**teks tebal**")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-bold text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                    title="Bold text"
                  >
                    B
                  </button>

                  <span className="text-foreground/20">|</span>

                  {/* Code Snippet Quick Buttons */}
                  <button
                    type="button"
                    onClick={() => handleInsertCode("bash")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-mono font-medium text-emerald-500 hover:bg-emerald-500/10"
                    title="Insert Bash/Terminal block"
                  >
                    + Bash
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertCode("typescript")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-mono font-medium text-blue-500 hover:bg-blue-500/10"
                    title="Insert TypeScript block"
                  >
                    + TS / JS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertCode("python")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-mono font-medium text-yellow-500 hover:bg-yellow-500/10"
                    title="Insert Python block"
                  >
                    + Python
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertCode("sql")}
                    className="rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-mono font-medium text-purple-500 hover:bg-purple-500/10"
                    title="Insert SQL block"
                  >
                    + SQL
                  </button>

                  <span className="text-foreground/20">|</span>

                  {/* Inline Image Upload to Supabase */}
                  <input
                    type="file"
                    ref={inlineImageInputRef}
                    accept="image/*"
                    onChange={handleInlineImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => inlineImageInputRef.current?.click()}
                    disabled={uploadingInline}
                    className="inline-flex items-center gap-1 rounded-lg border border-foreground/10 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
                    title="Upload image directly into content"
                  >
                    {uploadingInline ? "Uploading..." : "+ Upload Image"}
                  </button>
                </div>
              </div>

              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Tulis artikel di sini menggunakan Markdown, kode, atau upload gambar..."
                className="w-full resize-y rounded-xl border border-foreground/10 bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />

              <div className="flex items-center justify-between text-xs text-foreground/50">
                <div>
                  Dukungan format: Paragraf teks biasa, <code>```bahasa ... ```</code> untuk blok kode, <code>![keterangan](url)</code> untuk gambar.
                </div>
                <div>{content.length} karakter</div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-foreground/10 bg-background/50 p-6">
            <Link
              href="/admin"
              className="rounded-xl border border-foreground/10 bg-background px-5 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              ← Cancel
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="rounded-xl border border-foreground/15 bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-md transition-all hover:bg-foreground/90 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving to Supabase...
                  </>
                ) : isEdit ? (
                  `Update & Publish to ${target === "writing" ? "Writing" : "Work"}`
                ) : (
                  `Publish to ${target === "writing" ? "Writing" : "Work"} 🚀`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
