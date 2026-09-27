"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Harap masukkan username dan password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Username atau password salah.");
        setLoading(false);
        return;
      }

      // Success, redirect to admin
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header Branding */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-5 text-xl font-mono shadow-inner tracking-wider select-none">
          (ㆆࡇㆆ&quot;)
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Access
        </h1>
        <p className="text-xs text-foreground/50">
          Masuk untuk mengelola artikel, riset, dan konten website
        </p>
      </div>

      {/* Login Card */}
      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-500">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-foreground/80"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="rvyk"
              className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-foreground/80"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-foreground/50 hover:text-foreground"
              >
                {showPassword ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-lg transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Memverifikasi...
                </>
              ) : (
                "Login ke Dashboard →"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/50 transition-colors hover:text-foreground"
        >
          ← Kembali ke Website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
