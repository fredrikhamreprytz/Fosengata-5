"use client";

import { useRouter } from "next/navigation";
import type { ListsSubTab } from "@/lib/types";

const TABS: { value: ListsSubTab; label: string }[] = [
  { value: "shopping",  label: "Handleliste" },
  { value: "inventory", label: "Beholdning" },
  { value: "packing",   label: "Pakkeliste" },
];

export default function ListsSubSwitcher({
  activeSubTab,
}: {
  activeSubTab: ListsSubTab;
}) {
  const router = useRouter();

  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === activeSubTab;
        return (
          <button
            key={tab.value}
            onClick={() =>
              router.replace(`/dashboard?tab=lists&subtab=${tab.value}`)
            }
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
