"use client";

import { useState, useTransition } from "react";
import { GROCERY_CATEGORIES, RECIPE_UNITS } from "@/lib/types";
import type { RecipeUnit, GroceryCategory } from "@/lib/types";
import { addRecipe } from "./actions";

interface IngredientDraft {
  key: number;
  name: string;
  amount: string;
  unit: RecipeUnit;
  category: GroceryCategory;
}

let nextKey = 0;

function makeIngredient(): IngredientDraft {
  return {
    key: nextKey++,
    name: "",
    amount: "",
    unit: "stk",
    category: "produce",
  };
}

export default function AddRecipeForm() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([makeIngredient()]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setIngredients([makeIngredient()]);
    setInstructions([""]);
    setError(null);
  }

  function updateIngredient(key: number, patch: Partial<Omit<IngredientDraft, "key">>) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.key === key ? { ...ing, ...patch } : ing))
    );
  }

  function removeIngredient(key: number) {
    setIngredients((prev) => prev.filter((ing) => ing.key !== key));
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeInstruction(index: number) {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const filteredInstructions = instructions.filter((s) => s.trim() !== "");

    startTransition(async () => {
      const result = await addRecipe({
        name,
        ingredients: ingredients.map((i) => ({
          name: i.name,
          amount: parseFloat(i.amount),
          unit: i.unit,
          category: i.category,
        })),
        instructions: filteredInstructions,
      });
      if (result.error) {
        setError(result.error);
      } else {
        resetForm();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recipe name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Navn på oppskrift"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {/* Ingredients */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-600">Ingredienser</h3>
        {ingredients.map((ing) => (
          <div key={ing.key} className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(ing.key, { name: e.target.value })}
                placeholder="Navn"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => removeIngredient(ing.key)}
                className="px-2 py-2 text-gray-400 hover:text-red-500 transition text-lg leading-none"
                aria-label="Fjern ingrediens"
              >
                ×
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={ing.amount}
                onChange={(e) => updateIngredient(ing.key, { amount: e.target.value })}
                placeholder="Antall"
                min="0"
                step="any"
                className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(ing.key, { unit: e.target.value as RecipeUnit })}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {RECIPE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <select
                value={ing.category}
                onChange={(e) => updateIngredient(ing.key, { category: e.target.value as GroceryCategory })}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {GROCERY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setIngredients((prev) => [...prev, makeIngredient()])}
          className="text-sm text-slate-500 hover:text-slate-700 transition underline"
        >
          Legg til ingrediens
        </button>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-600">Fremgangsmåte</h3>
        {instructions.map((step, index) => (
          <div key={index} className="flex gap-2 items-start">
            <span className="text-sm text-slate-500 mt-2 min-w-14">Steg {index + 1}:</span>
            <textarea
              value={step}
              onChange={(e) => updateInstruction(index, e.target.value)}
              placeholder={`Beskriv steg ${index + 1}`}
              rows={2}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className="px-2 py-2 text-gray-400 hover:text-red-500 transition text-lg leading-none mt-1"
              aria-label="Fjern steg"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setInstructions((prev) => [...prev, ""])}
          className="text-sm text-slate-500 hover:text-slate-700 transition underline"
        >
          Legg til steg
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
      >
        {isPending ? "Lagrer..." : "Lagre oppskrift"}
      </button>
    </form>
  );
}
