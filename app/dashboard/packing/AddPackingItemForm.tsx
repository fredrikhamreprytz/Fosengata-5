"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addPackingItem } from "../actions";

export default function AddPackingItemForm({ listId }: { listId: string }) {
  const [state, formAction, isPending] = useActionState(addPackingItem, {
    error: null,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [isPersonal, setIsPersonal] = useState(false);

  useEffect(() => {
    if (!isPending && state.error === null) {
      formRef.current?.reset();
      setIsPersonal(false);
    }
  }, [isPending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          name="name"
          placeholder="Elementnavn"
          required
          className="flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input type="hidden" name="list_id" value={listId} />
        <input type="hidden" name="is_personal" value={String(isPersonal)} />
        <button
          type="button"
          onClick={() => setIsPersonal((v) => !v)}
          className={`shrink-0 px-3 py-2 text-sm rounded-lg border font-medium transition ${
            isPersonal
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-slate-400"
          }`}
        >
          Kun for meg
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Legger til..." : "Legg til"}
        </button>
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
