"use client";

import { useRouter } from "next/navigation";
import type { DashboardTab } from "@/lib/types";

const TABS: { value: DashboardTab; label: string; href: string }[] = [
  { value: "lists",    label: "Lister",      href: "/dashboard?tab=lists&subtab=shopping" },
  { value: "recipes",  label: "Oppskrifter", href: "/dashboard?tab=recipes" },
  { value: "training", label: "Trening",     href: "/dashboard?tab=training&subtab=running" },
];

export default function TabSwitcher({ activeTab }: { activeTab: DashboardTab }) {
  const router = useRouter();

  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => router.replace(tab.href)}
            className={`flex-1 px-2 py-2 text-xs sm:px-4 sm:text-sm font-medium rounded-lg transition ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
