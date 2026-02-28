"use client";

import { useState } from "react";
import type { StrengthWorkout, StrengthExercise, StrengthLabel } from "@/lib/types";
import { deleteStrengthWorkout } from "../actions";
import EditStrengthWorkoutForm from "./EditStrengthWorkoutForm";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const LABEL_DISPLAY: Record<StrengthLabel, { label: string; className: string }> = {
  too_hard: { label: "For tungt", className: "bg-red-100 text-red-700" },
  ok: { label: "Ok", className: "bg-gray-100 text-gray-600" },
  increase: { label: "Bør økes", className: "bg-green-100 text-green-700" },
};

function ExerciseRow({ exercise }: { exercise: StrengthExercise }) {
  const display = LABEL_DISPLAY[exercise.label];
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-800">
        {exercise.exercise_name}
        <span className="ml-2 text-gray-400 text-xs">
          {exercise.sets} sett × {exercise.reps} reps × {exercise.weight_kg} kg
        </span>
      </span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${display.className}`}>
        {display.label}
      </span>
    </div>
  );
}

function StrengthWorkoutCard({ workout }: { workout: StrengthWorkout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const sorted = [...workout.strength_exercises].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsEditing(false);
        }}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <span className="text-sm font-medium text-gray-800">{workout.name}</span>
        <span className="text-gray-400 text-xs">
          <span className="mr-2">{formatDate(workout.created_at)}</span>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
          {isEditing ? (
            <EditStrengthWorkoutForm
              workout={workout}
              onDone={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {sorted.map((ex) => (
                  <ExerciseRow key={ex.id} exercise={ex} />
                ))}
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition"
                >
                  Rediger
                </button>
                <form action={deleteStrengthWorkout}>
                  <input type="hidden" name="id" value={workout.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-500 hover:text-red-700 transition"
                  >
                    Slett økt
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function StrengthWorkoutList({
  workouts,
}: {
  workouts: StrengthWorkout[];
}) {
  if (workouts.length === 0) {
    return (
      <p className="text-gray-400 text-sm">Ingen styrkeøkter lagt til ennå.</p>
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <StrengthWorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
