"use client";

import { useActionState } from "react";
import { inviteMember } from "../actions";

export default function InviteForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useActionState(inviteMember, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="household_id" value={householdId} />

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="e-postadresse"
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          Inviter
        </button>
      </div>
    </form>
  );
}
