"use client";

import { useState, useTransition } from "react";
import { clearShoppingList } from "./actions";

export default function ClearShoppingListButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    startTransition(async () => {
      await clearShoppingList();
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Er du sikker?</span>
        <button
          type="button"
          onClick={handleClear}
          disabled={isPending}
          className="text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
        >
          Ja
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-slate-400 hover:text-red-500 transition"
    >
      Tøm handleliste
    </button>
  );
}
