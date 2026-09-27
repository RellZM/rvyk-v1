import React from "react";

// Dummy data for categories
const DUMMY_CATEGORIES = [
  { id: 1, name: "Engineering", slug: "engineering", count: 12 },
  { id: 2, name: "Design", slug: "design", count: 5 },
  { id: 3, name: "Personal", slug: "personal", count: 3 },
];

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Categories
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Manage categories for your blog posts.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Add Category Form */}
        <div className="md:col-span-1">
          <div className="rounded-md border border-foreground/10 bg-background/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Add New Category
            </h2>
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g., Tutorial"
                  className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium text-foreground">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  placeholder="e.g., tutorial"
                  className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground placeholder-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-md border border-foreground/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-foreground/5 text-foreground/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Posts</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10 bg-background/50">
                {DUMMY_CATEGORIES.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-foreground/5">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {category.count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sm font-medium text-blue-500 hover:underline">
                        Edit
                      </button>
                      <span className="mx-2 text-foreground/20">|</span>
                      <button className="text-sm font-medium text-red-500 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
