"use client";

import { useRouter } from "next/navigation";
import type { TrainingSubTab } from "@/lib/types";

const TABS: { value: TrainingSubTab; label: string }[] = [
  { value: "running", label: "Løping" },
  { value: "strength", label: "Styrke" },
];

export default function TrainingSubSwitcher({
  activeSubTab,
}: {
  activeSubTab: TrainingSubTab;
}) {
  const router = useRouter();

  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === activeSubTab;
        return (
          <button
            key={tab.value}
            onClick={() =>
              router.replace(`/dashboard?tab=training&subtab=${tab.value}`)
            }
            className={`flex-1 px-2 py-2 text-xs sm:px-4 sm:text-sm font-medium rounded-lg transition ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
