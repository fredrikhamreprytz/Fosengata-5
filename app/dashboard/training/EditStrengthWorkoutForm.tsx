"use client";

import { useState, useTransition } from "react";
import { updateStrengthWorkout } from "../actions";
import type { StrengthLabel, StrengthWorkout } from "@/lib/types";

interface ExerciseDraft {
  key: number;
  exercise_name: string;
  sets: string;
  reps: string;
  weight_kg: string;
  label: StrengthLabel;
}

let nextKey = 0;

function makeExercise(): ExerciseDraft {
  return {
    key: nextKey++,
    exercise_name: "",
    sets: "",
    reps: "",
    weight_kg: "",
    label: "ok",
  };
}

function fromExisting(ex: StrengthWorkout["strength_exercises"][number]): ExerciseDraft {
  return {
    key: nextKey++,
    exercise_name: ex.exercise_name,
    sets: String(ex.sets),
    reps: String(ex.reps),
    weight_kg: String(ex.weight_kg),
    label: ex.label,
  };
}

const LABEL_OPTIONS: { value: StrengthLabel; label: string }[] = [
  { value: "too_hard", label: "For tungt" },
  { value: "ok", label: "Ok" },
  { value: "increase", label: "Bør økes" },
];

function labelButtonClass(value: StrengthLabel, active: boolean): string {
  if (!active) return "border border-slate-200 text-slate-500 hover:border-slate-300 transition";
  if (value === "too_hard") return "border border-red-300 bg-red-50 text-red-700";
  if (value === "increase") return "border border-green-300 bg-green-50 text-green-700";
  return "border border-slate-300 bg-slate-100 text-slate-700";
}

function ExerciseRow({
  exercise,
  removable,
  onChange,
  onRemove,
}: {
  exercise: ExerciseDraft;
  removable: boolean;
  onChange: (patch: Partial<Omit<ExerciseDraft, "key">>) => void;
  onRemove: () => void;
}) {
  const inputClass =
    "border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="space-y-2">
      {/* Row 1: exercise name + remove */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={exercise.exercise_name}
          onChange={(e) => onChange({ exercise_name: e.target.value })}
          placeholder="Øvelse"
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={!removable}
          className={`text-lg leading-none transition ${
            removable ? "text-slate-400 hover:text-red-500" : "invisible"
          }`}
          aria-label="Fjern øvelse"
        >
          ×
        </button>
      </div>
      {/* Row 2a: sets + reps + kg */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={exercise.sets}
          onChange={(e) => onChange({ sets: e.target.value })}
          placeholder="0"
          min="1"
          className={`w-14 ${inputClass}`}
        />
        <span className="text-xs text-slate-400">sett</span>
        <input
          type="number"
          value={exercise.reps}
          onChange={(e) => onChange({ reps: e.target.value })}
          placeholder="0"
          min="1"
          className={`w-14 ${inputClass}`}
        />
        <span className="text-xs text-slate-400">reps</span>
        <input
          type="text"
          inputMode="decimal"
          value={exercise.weight_kg}
          onChange={(e) => onChange({ weight_kg: e.target.value })}
          placeholder="0"
          className={`w-14 ${inputClass}`}
        />
        <span className="text-xs text-slate-400">kg</span>
      </div>
      {/* Row 2b: label buttons */}
      <div className="flex gap-1">
        {LABEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ label: opt.value })}
            className={`px-2 py-1 text-xs rounded-md ${labelButtonClass(opt.value, exercise.label === opt.value)}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EditStrengthWorkoutForm({
  workout,
  onDone,
}: {
  workout: StrengthWorkout;
  onDone: () => void;
}) {
  const sorted = [...workout.strength_exercises].sort((a, b) => a.sort_order - b.sort_order);

  const [name, setName] = useState(workout.name);
  const [exercises, setExercises] = useState<ExerciseDraft[]>(sorted.map(fromExisting));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateExercise(key: number, patch: Partial<Omit<ExerciseDraft, "key">>) {
    setExercises((prev) =>
      prev.map((ex) => (ex.key === key ? { ...ex, ...patch } : ex))
    );
  }

  function removeExercise(key: number) {
    setExercises((prev) => prev.filter((ex) => ex.key !== key));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Navn på økt er påkrevd.");
      return;
    }

    for (const ex of exercises) {
      if (!ex.exercise_name.trim()) {
        setError("Øvelsenavn er påkrevd for alle øvelser.");
        return;
      }
      const sets = parseInt(ex.sets, 10);
      if (isNaN(sets) || sets <= 0) {
        setError("Antall sett må være et positivt tall.");
        return;
      }
      const reps = parseInt(ex.reps, 10);
      if (isNaN(reps) || reps <= 0) {
        setError("Antall reps må være et positivt tall.");
        return;
      }
      const weightStr = ex.weight_kg.trim();
      const weight = weightStr === "" ? 0 : parseFloat(weightStr.replace(",", "."));
      if (isNaN(weight) || weight < 0) {
        setError("Vekt kan ikke være negativ.");
        return;
      }
    }

    startTransition(async () => {
      const result = await updateStrengthWorkout(workout.id, {
        name: name.trim(),
        exercises: exercises.map((ex) => ({
          exercise_name: ex.exercise_name.trim(),
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
          weight_kg: ex.weight_kg.trim() === "" ? 0 : parseFloat(ex.weight_kg.replace(",", ".")),
          label: ex.label,
        })),
      });
      if (result.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Navn på økt"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="space-y-4 pl-3 border-l-2 border-emerald-100">
        {exercises.map((ex) => (
          <ExerciseRow
            key={ex.key}
            exercise={ex}
            removable={exercises.length > 1}
            onChange={(patch) => updateExercise(ex.key, patch)}
            onRemove={() => removeExercise(ex.key)}
          />
        ))}
        <button
          type="button"
          onClick={() => setExercises((prev) => [...prev, makeExercise()])}
          className="text-sm text-slate-500 hover:text-slate-700 transition underline"
        >
          Legg til øvelse
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4 items-center">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
        >
          {isPending ? "Lagrer..." : "Lagre endringer"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-slate-500 hover:text-slate-700 transition"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
