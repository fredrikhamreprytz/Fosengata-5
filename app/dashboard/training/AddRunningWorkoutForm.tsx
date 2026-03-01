"use client";

import { useState, useTransition } from "react";
import { addRunningWorkout } from "../actions";
import type { RunningPhase } from "@/lib/types";

interface StepDraft {
  key: number;
  phase: RunningPhase;
  is_recovery: boolean;
  duration_minutes: string;
  duration_seconds: string;
  distance_km: string;
  speed_kmh: string;
  pace_min: string;
  pace_sec: string;
  incline_pct: string;
}

let nextKey = 0;

function makeStep(phase: RunningPhase, is_recovery = false): StepDraft {
  return {
    key: nextKey++,
    phase,
    is_recovery,
    duration_minutes: "",
    duration_seconds: "",
    distance_km: "",
    speed_kmh: "",
    pace_min: "",
    pace_sec: "",
    incline_pct: "",
  };
}

function speedToPace(speedKmh: number): { min: number; sec: number } {
  const totalSec = 3600 / speedKmh;
  const min = Math.floor(totalSec / 60);
  let sec = Math.round(totalSec % 60);
  if (sec === 60) return { min: min + 1, sec: 0 };
  return { min, sec };
}

function paceToSpeed(paceMin: number, paceSec: number): number {
  const totalSec = paceMin * 60 + paceSec;
  if (totalSec <= 0) return 0;
  return 3600 / totalSec;
}

function StepFields({
  step,
  onChange,
  onRemove,
  onDuplicate,
  label,
  removable,
}: {
  step: StepDraft;
  onChange: (patch: Partial<Omit<StepDraft, "key">>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  label: string;
  removable: boolean;
}) {
  const inputClass =
    "border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  function handleSpeedChange(value: string) {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      const { min, sec } = speedToPace(num);
      onChange({ speed_kmh: value, pace_min: String(min), pace_sec: String(sec).padStart(2, "0") });
    } else {
      onChange({ speed_kmh: value, pace_min: "", pace_sec: "" });
    }
  }

  function handlePaceChange(newMin: string, newSec: string) {
    const m = parseInt(newMin || "0", 10);
    const s = parseInt(newSec || "0", 10);
    if (!isNaN(m) && !isNaN(s) && (m > 0 || s > 0)) {
      const speed = paceToSpeed(m, s);
      onChange({ pace_min: newMin, pace_sec: newSec, speed_kmh: speed.toFixed(1) });
    } else {
      onChange({ pace_min: newMin, pace_sec: newSec, speed_kmh: "" });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium uppercase tracking-wide ${
            step.is_recovery ? "text-blue-500" : "text-orange-500"
          }`}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="text-xs text-slate-400 hover:text-slate-600 transition"
            aria-label="Dupliser steg"
          >
            Dupliser
          </button>
          {removable && (
            <button
              type="button"
              onClick={onRemove}
              className="text-slate-400 hover:text-red-500 transition text-lg leading-none"
              aria-label="Fjern steg"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Duration */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={step.duration_minutes}
            onChange={(e) => onChange({ duration_minutes: e.target.value })}
            placeholder="0"
            min="0"
            className={`w-14 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">min</span>
          <input
            type="number"
            value={step.duration_seconds}
            onChange={(e) => onChange({ duration_seconds: e.target.value })}
            placeholder="0"
            min="0"
            max="59"
            className={`w-14 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">sek</span>
        </div>
        {/* Distance */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={step.distance_km}
            onChange={(e) => onChange({ distance_km: e.target.value })}
            placeholder="0.0"
            min="0"
            step="0.01"
            className={`w-16 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">km</span>
        </div>
        {/* Speed km/h */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={step.speed_kmh}
            onChange={(e) => handleSpeedChange(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.1"
            className={`w-16 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">km/t</span>
        </div>
        {/* Pace min/km */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={step.pace_min}
            onChange={(e) => handlePaceChange(e.target.value, step.pace_sec)}
            placeholder="0"
            min="0"
            className={`w-12 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">:</span>
          <input
            type="number"
            value={step.pace_sec}
            onChange={(e) => handlePaceChange(step.pace_min, e.target.value)}
            placeholder="00"
            min="0"
            max="59"
            className={`w-12 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">min/km</span>
        </div>
        {/* Incline */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={step.incline_pct}
            onChange={(e) => onChange({ incline_pct: e.target.value })}
            placeholder="0"
            min="0"
            step="0.5"
            className={`w-14 ${inputClass}`}
          />
          <span className="text-xs text-slate-500">%</span>
        </div>
      </div>
    </div>
  );
}

function parseDuration(minutes: string, seconds: string): number | null {
  const m = parseInt(minutes || "0", 10);
  const s = parseInt(seconds || "0", 10);
  if (isNaN(m) && isNaN(s)) return null;
  const total = (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
  return total > 0 ? total : null;
}

function parseDecimal(val: string): number | null {
  if (!val.trim()) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export default function AddRunningWorkoutForm() {
  const [name, setName] = useState("");
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [warmupSteps, setWarmupSteps] = useState<StepDraft[]>([]);
  const [mainSteps, setMainSteps] = useState<StepDraft[]>([]);
  const [cooldownSteps, setCooldownSteps] = useState<StepDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateStep(
    setSteps: React.Dispatch<React.SetStateAction<StepDraft[]>>,
    key: number,
    patch: Partial<Omit<StepDraft, "key">>
  ) {
    setSteps((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...patch } : s))
    );
  }

  function removeStep(
    setSteps: React.Dispatch<React.SetStateAction<StepDraft[]>>,
    key: number
  ) {
    setSteps((prev) => prev.filter((s) => s.key !== key));
  }

  function duplicateStep(
    setSteps: React.Dispatch<React.SetStateAction<StepDraft[]>>,
    key: number
  ) {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], key: nextKey++ };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  }

  function duplicateInterval(key: number) {
    setMainSteps((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx === -1) return prev;
      const activeIdx = prev[idx].is_recovery ? idx - 1 : idx;
      const recoveryIdx = activeIdx + 1;
      if (activeIdx < 0 || recoveryIdx >= prev.length) return prev;
      const activeCopy = { ...prev[activeIdx], key: nextKey++ };
      const recoveryCopy = { ...prev[recoveryIdx], key: nextKey++ };
      return [
        ...prev.slice(0, recoveryIdx + 1),
        activeCopy,
        recoveryCopy,
        ...prev.slice(recoveryIdx + 1),
      ];
    });
  }

  function addInterval() {
    setMainSteps((prev) => [
      ...prev,
      makeStep("main", false),
      makeStep("main", true),
    ]);
  }

  function toggleWarmup() {
    setShowWarmup((prev) => {
      if (!prev) setWarmupSteps([makeStep("warmup")]);
      else setWarmupSteps([]);
      return !prev;
    });
  }

  function toggleCooldown() {
    setShowCooldown((prev) => {
      if (!prev) setCooldownSteps([makeStep("cooldown")]);
      else setCooldownSteps([]);
      return !prev;
    });
  }

  function resetForm() {
    setName("");
    setShowWarmup(false);
    setShowCooldown(false);
    setWarmupSteps([]);
    setMainSteps([]);
    setCooldownSteps([]);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Navn på økt er påkrevd.");
      return;
    }
    if (mainSteps.length === 0) {
      setError("Legg til minst ett intervall i hovedøkten.");
      return;
    }

    const allSteps = [...warmupSteps, ...mainSteps, ...cooldownSteps];

    const phasePositions: Record<RunningPhase, number> = {
      warmup: 0,
      main: 0,
      cooldown: 0,
    };

    const steps = allSteps.map((s) => ({
      phase: s.phase,
      position: phasePositions[s.phase]++,
      is_recovery: s.is_recovery,
      duration_seconds: parseDuration(s.duration_minutes, s.duration_seconds),
      distance_km: parseDecimal(s.distance_km),
      speed_kmh: parseDecimal(s.speed_kmh),
      incline_pct: parseDecimal(s.incline_pct),
    }));

    startTransition(async () => {
      const result = await addRunningWorkout({ name: name.trim(), steps });
      if (result.error) {
        setError(result.error);
      } else {
        resetForm();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workout name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Navn på økt"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {/* Warmup */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600">Oppvarming</h3>
          <button
            type="button"
            onClick={toggleWarmup}
            className="text-xs text-slate-500 hover:text-slate-700 transition underline"
          >
            {showWarmup ? "Fjern oppvarming" : "Legg til oppvarming"}
          </button>
        </div>
        {showWarmup && (
          <div className="space-y-3 pl-3 border-l-2 border-slate-100">
            {warmupSteps.map((step) => (
              <StepFields
                key={step.key}
                step={step}
                onChange={(patch) => updateStep(setWarmupSteps, step.key, patch)}
                onRemove={() => removeStep(setWarmupSteps, step.key)}
                onDuplicate={() => duplicateStep(setWarmupSteps, step.key)}
                label={`Steg ${warmupSteps.indexOf(step) + 1}`}
                removable={warmupSteps.length > 1}
              />
            ))}
            <button
              type="button"
              onClick={() => setWarmupSteps((prev) => [...prev, makeStep("warmup")])}
              className="text-xs text-slate-500 hover:text-slate-700 transition underline"
            >
              Legg til steg
            </button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-600">Hovedøkt</h3>
        {mainSteps.length > 0 && (
          <div className="space-y-3 pl-3 border-l-2 border-slate-100">
            {mainSteps.map((step) => (
              <StepFields
                key={step.key}
                step={step}
                onChange={(patch) => updateStep(setMainSteps, step.key, patch)}
                onRemove={() => removeStep(setMainSteps, step.key)}
                onDuplicate={() => duplicateInterval(step.key)}
                label={step.is_recovery ? "Hvile" : "Aktiv"}
                removable
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addInterval}
          className="text-sm text-slate-500 hover:text-slate-700 transition underline"
        >
          Legg til intervall
        </button>
      </div>

      {/* Cooldown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600">Nedkjøling</h3>
          <button
            type="button"
            onClick={toggleCooldown}
            className="text-xs text-slate-500 hover:text-slate-700 transition underline"
          >
            {showCooldown ? "Fjern nedkjøling" : "Legg til nedkjøling"}
          </button>
        </div>
        {showCooldown && (
          <div className="space-y-3 pl-3 border-l-2 border-slate-100">
            {cooldownSteps.map((step) => (
              <StepFields
                key={step.key}
                step={step}
                onChange={(patch) => updateStep(setCooldownSteps, step.key, patch)}
                onRemove={() => removeStep(setCooldownSteps, step.key)}
                onDuplicate={() => duplicateStep(setCooldownSteps, step.key)}
                label={`Steg ${cooldownSteps.indexOf(step) + 1}`}
                removable={cooldownSteps.length > 1}
              />
            ))}
            <button
              type="button"
              onClick={() => setCooldownSteps((prev) => [...prev, makeStep("cooldown")])}
              className="text-xs text-slate-500 hover:text-slate-700 transition underline"
            >
              Legg til steg
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
      >
        {isPending ? "Lagrer..." : "Lagre økt"}
      </button>
    </form>
  );
}
