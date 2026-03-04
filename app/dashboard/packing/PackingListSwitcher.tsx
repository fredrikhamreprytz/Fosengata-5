"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PackingList } from "@/lib/types";
import { createPackingList } from "../actions";

export default function PackingListSwitcher({
  lists,
  activeListId,
}: {
  lists: PackingList[];
  activeListId: string | null;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createPackingList, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending && state.error === null && showForm) {
      formRef.current?.reset();
      setShowForm(false);
      startTransition(() => router.refresh());
    }
  }, [isPending, state.error, showForm, router]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-3">
      <div className="overflow-x-auto">
        <div className="flex gap-2 flex-nowrap min-w-0">
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() =>
                router.replace(`/dashboard?tab=lists&subtab=packing&list=${list.id}`)
              }
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                list.id === activeListId
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {list.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            + Ny liste
          </button>
        </div>
      </div>

      {showForm && (
        <form ref={formRef} action={formAction} className="flex gap-2 flex-wrap">
          <input
            type="text"
            name="name"
            placeholder="Navn på liste"
            required
            autoFocus
            className="flex-1 min-w-0 border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Oppretter..." : "Opprett"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="shrink-0 px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition font-medium"
          >
            Avbryt
          </button>
          {state.error && (
            <p className="w-full text-sm text-red-600">{state.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
