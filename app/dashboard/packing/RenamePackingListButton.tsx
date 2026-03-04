"use client";

import { useRef, useState, useTransition } from "react";
import { renamePackingList } from "../actions";

export default function RenamePackingListButton({
  listId,
  currentName,
}: {
  listId: string;
  currentName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await renamePackingList(formData);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input type="hidden" name="id" value={listId} />
        <input
          ref={inputRef}
          type="text"
          name="name"
          defaultValue={currentName}
          required
          autoFocus
          className="border border-slate-300 rounded-lg px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-40"
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-xs text-emerald-600 hover:text-emerald-700 transition disabled:opacity-50 font-medium"
        >
          Lagre
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Avbryt
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xs text-slate-400 hover:text-slate-600 transition"
    >
      Gi nytt navn
    </button>
  );
}
