import React from "react";
import Link from "next/link";

// Dummy data for experiences/works
const DUMMY_EXPERIENCES = [
  {
    id: 1,
    title: "Donasi Anak Yatim - UI/UX",
    year: "2025",
    role: "UI/UX Design",
  },
  {
    id: 2,
    title: "Schematics 2026",
    year: "2026",
    role: "Frontend Developer",
  },
  {
    id: 3,
    title: "Personal Portfolio",
    year: "2025",
    role: "Frontend Developer",
  },
];

export default function AdminExperiencesPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Experiences
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Manage your portfolio and work experiences.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add Experience
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-foreground/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 text-foreground/70">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Year</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10 bg-background/50">
            {DUMMY_EXPERIENCES.map((exp) => (
              <tr key={exp.id} className="transition-colors hover:bg-foreground/5">
                <td className="px-4 py-3 font-medium text-foreground">
                  {exp.title}
                </td>
                <td className="px-4 py-3 text-foreground/70">{exp.role}</td>
                <td className="px-4 py-3 text-foreground/70">{exp.year}</td>
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
  );
}
