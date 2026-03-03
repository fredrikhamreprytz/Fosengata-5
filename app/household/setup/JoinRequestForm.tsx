"use client";

import { useActionState } from "react";
import { requestJoinHousehold } from "../actions";

export default function JoinRequestForm() {
  const [state, formAction] = useActionState(requestJoinHousehold, { error: null, success: false });

  if (state.success) {
    return (
      <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 text-center">
        Forespørsel sendt! Eieren av husstanden vil se den i innstillingene.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <div className="flex gap-2">
        <input
          name="household_name"
          type="text"
          required
          placeholder="Husstandsnavn"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          Send
        </button>
      </div>
    </form>
  );
}
