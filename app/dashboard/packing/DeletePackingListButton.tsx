"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePackingList } from "../actions";

export default function DeletePackingListButton({ listId }: { listId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", listId);
    startTransition(async () => {
      await deletePackingList(formData);
      setConfirming(false);
      router.replace("/dashboard?tab=lists&subtab=packing");
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">Er du sikker? Alle elementer slettes.</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
        >
          Ja
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
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
      className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 transition"
    >
      Slett liste
    </button>
  );
}
