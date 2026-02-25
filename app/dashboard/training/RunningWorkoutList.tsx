"use client";

import { useState } from "react";
import type { RunningWorkout, RunningStep, RunningPhase } from "@/lib/types";
import { deleteRunningWorkout } from "../actions";
import EditRunningWorkoutForm from "./EditRunningWorkoutForm";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")} min` : `${s} sek`;
}

function formatPace(speedKmh: number): string {
  const totalSec = 3600 / speedKmh;
  const min = Math.floor(totalSec / 60);
  let sec = Math.round(totalSec % 60);
  if (sec === 60) return `${min + 1}:00 min/km`;
  return `${min}:${String(sec).padStart(2, "0")} min/km`;
}

function StepRow({ step }: { step: RunningStep }) {
  const parts: string[] = [];
  if (step.duration_seconds !== null) parts.push(formatDuration(step.duration_seconds));
  if (step.distance_km !== null) parts.push(`${step.distance_km} km`);
  if (step.speed_kmh !== null) {
    parts.push(`${step.speed_kmh} km/t`);
    parts.push(formatPace(Number(step.speed_kmh)));
  }
  if (step.incline_pct !== null) parts.push(`${step.incline_pct}% stigning`);

  return (
    <div
      className={`text-sm px-3 py-1.5 rounded-lg ${
        step.is_recovery
          ? "bg-blue-50 text-blue-700"
          : "bg-orange-50 text-orange-700"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wide opacity-60 mr-2">
        {step.is_recovery ? "Hvile" : "Aktiv"}
      </span>
      {parts.join(" · ")}
    </div>
  );
}

function PhaseSection({
  label,
  steps,
}: {
  label: string;
  steps: RunningStep[];
}) {
  if (steps.length === 0) return null;
  const sorted = [...steps].sort((a, b) => a.position - b.position);

  const totalSeconds = steps.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);
  const totalKm = steps.reduce((sum, s) => sum + (s.distance_km !== null ? Number(s.distance_km) : 0), 0);

  const summary: string[] = [];
  if (totalSeconds > 0) summary.push(formatDuration(totalSeconds));
  if (totalKm > 0) summary.push(`${totalKm % 1 === 0 ? totalKm : totalKm.toFixed(2)} km`);

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </span>
        {summary.length > 0 && (
          <span className="text-xs text-gray-400">{summary.join(" · ")}</span>
        )}
        <span className="text-gray-300 text-xs ml-auto">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="space-y-1">
          {sorted.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}

function RunningWorkoutCard({ workout }: { workout: RunningWorkout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const stepsByPhase = (phase: RunningPhase) =>
    workout.running_workout_steps.filter((s) => s.phase === phase);

  const totalSeconds = workout.running_workout_steps.reduce(
    (sum, s) => sum + (s.duration_seconds ?? 0),
    0
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
          {totalSeconds > 0 && <span className="mr-2">{formatDuration(totalSeconds)}</span>}
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {isEditing ? (
            <EditRunningWorkoutForm
              workout={workout}
              onDone={() => setIsEditing(false)}
            />
          ) : (
            <>
              <PhaseSection label="Oppvarming" steps={stepsByPhase("warmup")} />
              <PhaseSection label="Hovedøkt" steps={stepsByPhase("main")} />
              <PhaseSection label="Nedkjøling" steps={stepsByPhase("cooldown")} />

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition"
                >
                  Rediger
                </button>
                <form action={deleteRunningWorkout}>
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

export default function RunningWorkoutList({
  workouts,
}: {
  workouts: RunningWorkout[];
}) {
  if (workouts.length === 0) {
    return (
      <p className="text-gray-400 text-sm">Ingen løpeøkter lagt til ennå.</p>
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <RunningWorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
