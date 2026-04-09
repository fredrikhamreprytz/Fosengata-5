"use client";

import { useActionState } from "react";
import { updateDisplayName } from "../actions";

export default function EditNameForm({ currentName }: { currentName: string }) {
  const [state, action, isPending] = useActionState(updateDisplayName, { error: null });

  return (
    <form action={action} className="mt-2 flex items-center gap-2">
      <input
        name="display_name"
        type="text"
        defaultValue={currentName}
        required
        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
      >
        Lagre
      </button>
      {state.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
    </form>
  );
}
