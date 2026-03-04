"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PackingItem, PackingMember } from "@/lib/types";
import { deletePackingItem, togglePackingCheck } from "../actions";

export default function PackingList({
  items,
  checks,
  members,
  currentUserId,
}: {
  items: PackingItem[];
  checks: { item_id: string; user_id: string }[];
  members: PackingMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [optimisticChecks, setOptimisticChecks] = useState<Set<string>>(
    () => new Set(checks.filter((c) => c.user_id === currentUserId).map((c) => c.item_id))
  );

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleToggle(itemId: string) {
    const isChecked = optimisticChecks.has(itemId);
    setOptimisticChecks((prev) => {
      const next = new Set(prev);
      isChecked ? next.delete(itemId) : next.add(itemId);
      return next;
    });
    await togglePackingCheck(itemId, isChecked);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="text-slate-400 text-sm">Ingen elementer på pakkelisten ennå.</p>
    );
  }

  const enrichedItems = items
    .map((item) => {
      const checkedUserIds = new Set(
        checks.filter((c) => c.item_id === item.id).map((c) => c.user_id)
      );
      if (optimisticChecks.has(item.id)) {
        checkedUserIds.add(currentUserId);
      } else {
        checkedUserIds.delete(currentUserId);
      }
      const currentUserChecked = checkedUserIds.has(currentUserId);
      const isComplete = item.is_personal
        ? currentUserChecked
        : members.every((m) => checkedUserIds.has(m.userId));
      return { item, checkedUserIds, currentUserChecked, isComplete };
    })
    .sort((a, b) => Number(a.isComplete) - Number(b.isComplete));

  return (
    <ul className="divide-y divide-slate-100">
      {enrichedItems.map(({ item, checkedUserIds, currentUserChecked, isComplete }) => (
          <li key={item.id} className="flex items-center gap-3 py-2">
            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
              <input
                type="checkbox"
                checked={currentUserChecked}
                onChange={() => handleToggle(item.id)}
                className="accent-emerald-600 w-4 h-4 shrink-0"
              />
              <span
                className={`text-sm truncate ${
                  isComplete ? "line-through text-slate-400" : "text-slate-800"
                }`}
              >
                {item.name}
              </span>
            </label>

            <div className="flex items-center gap-2 shrink-0">
              {item.is_personal ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  Kun deg
                </span>
              ) : (
                <div className="flex gap-1">
                  {members.map((member) => {
                    const checked = checkedUserIds.has(member.userId);
                    const initials = member.displayName.charAt(0).toUpperCase();
                    return (
                      <span
                        key={member.userId}
                        title={member.displayName}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          checked
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {initials}
                      </span>
                    );
                  })}
                </div>
              )}

              <form action={deletePackingItem}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-700 transition"
                >
                  Slett
                </button>
              </form>
            </div>
          </li>
      ))}
    </ul>
  );
}
