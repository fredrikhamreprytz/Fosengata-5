"use client";

import { useActionState, useEffect, useRef } from "react";
import { addGrocery } from "./actions";
import { GROCERY_CATEGORIES, GROCERY_UNITS } from "@/lib/types";

export default function AddGroceryForm() {
  const [state, formAction, isPending] = useActionState(addGrocery, {
    error: null,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isPending && state.error === null) {
      formRef.current?.reset();
    }
  }, [isPending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Varenavn"
          required
          className="border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        <select
          name="category"
          required
          defaultValue=""
          className="border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="" disabled>
            Kategori
          </option>
          {GROCERY_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="amount"
          placeholder="Antall"
          min="0.01"
          step="any"
          required
          className="border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        <select
          name="unit"
          required
          defaultValue=""
          className="border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="" disabled>
            Enhet
          </option>
          {GROCERY_UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Legger til..." : "Legg til"}
      </button>
    </form>
  );
}
