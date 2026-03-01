"use client";

import { useState, useEffect, useTransition } from "react";
import { GROCERY_CATEGORIES } from "@/lib/types";
import type { Grocery } from "@/lib/types";
import { deleteGrocery } from "./actions";
import ClearShoppingListButton from "./ClearShoppingListButton";

const LS_KEY = "shopping_list_ready";

export default function ShoppingList({ groceries }: { groceries: Grocery[] }) {
  const [isReady, setIsReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsReady(localStorage.getItem(LS_KEY) === "true");
  }, []);

  function toggleReady() {
    const next = !isReady;
    setIsReady(next);
    localStorage.setItem(LS_KEY, String(next));
  }

  function handleCheck(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(() => deleteGrocery(fd));
  }

  const grouped = GROCERY_CATEGORIES.map((cat) => ({
    ...cat,
    items: groceries.filter((g) => g.category === cat.value),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-700">Handleliste</h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isReady
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isReady ? "Klar" : "Utkast"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {groceries.length > 0 && <ClearShoppingListButton />}
          <button
            type="button"
            onClick={toggleReady}
            className="text-xs text-slate-500 hover:text-slate-700 transition"
          >
            {isReady ? "Sett til utkast" : "Sett til klar"}
          </button>
        </div>
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <p className="text-slate-400 text-sm">Ingen varer på handlelisten ennå.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((cat) => (
            <div key={cat.value}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                {cat.label}
              </h3>
              <ul className="divide-y divide-slate-100">
                {cat.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2">
                    {isReady ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isPending}
                          onChange={() => handleCheck(item.id)}
                          className="accent-green-600 w-4 h-4"
                        />
                        <span className="text-sm text-slate-800">
                          {item.name}
                          <span className="ml-2 text-slate-400">
                            {item.amount} {item.unit}
                          </span>
                        </span>
                      </label>
                    ) : (
                      <>
                        <span className="text-sm text-slate-800">
                          {item.name}
                          <span className="ml-2 text-slate-400">
                            {item.amount} {item.unit}
                          </span>
                        </span>
                        <form action={deleteGrocery}>
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:text-red-700 transition"
                          >
                            Slett
                          </button>
                        </form>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
