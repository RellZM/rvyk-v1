"use client";

import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show the admin dashboard sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const navLinks = [
    {
      href: "/admin",
      label: "Content List",
      iconActive: "🗁",
      iconInactive: "🗀",
      exact: true,
    },
    {
      href: "/admin/new-post",
      label: "Create New",
      iconActive: "🗎",
      iconInactive: "🗎",
      exact: false,
    },
    {
      href: "/admin/categories",
      label: "Categories",
      iconActive: "⊞",
      iconInactive: "⊞",
      exact: false,
    },
    {
      href: "/admin/experiences",
      label: "Experiences",
      iconActive: "🗁",
      iconInactive: "🗀",
      exact: false,
    },
  ];

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full shrink-0 border-b border-foreground/10 bg-background/50 p-6 md:w-64 md:border-b-0 md:border-r overflow-y-auto">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">🗁</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Admin Panel
                </h2>
              </div>
              <p className="text-xs text-foreground/50 mt-1 font-mono">user: rvyk</p>
            </div>

            <nav className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                const icon = isActive ? link.iconActive : link.iconInactive;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-foreground text-background shadow-sm"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-base">{icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-foreground/10 sm:flex-row md:flex-col">
            <Link
              href="/writing"
              className="flex flex-1 items-center justify-center text-center rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm font-semibold text-foreground/90 transition-colors hover:bg-foreground/10 hover:text-foreground active:scale-98"
            >
              ← Back to Writing
            </Link>

            <button
              onClick={handleLogout}
              type="button"
              className="flex flex-1 items-center justify-center text-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/20 active:scale-98 md:w-full"
            >
              Logout (rvyk)
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
