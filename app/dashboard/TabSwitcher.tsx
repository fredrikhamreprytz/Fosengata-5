"use client";

import { useRouter } from "next/navigation";
import type { DashboardTab } from "@/lib/types";

const TABS: { value: DashboardTab; label: string }[] = [
  { value: "shopping", label: "Handleliste" },
  { value: "inventory", label: "Beholdning" },
  { value: "recipes", label: "Oppskrifter" },
];

export default function TabSwitcher({ activeTab }: { activeTab: DashboardTab }) {
  const router = useRouter();

  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => router.replace(`/dashboard?tab=${tab.value}`)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
              isActive
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
