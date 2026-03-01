"use client";

import { useState, useTransition } from "react";
import type { Recipe } from "@/lib/types";
import { GROCERY_CATEGORIES } from "@/lib/types";
import { deleteRecipe, addRecipeToShoppingList } from "./actions";
import EditRecipeForm from "./EditRecipeForm";

function RecipeCard({
  recipe,
  inventoryNames,
}: {
  recipe: Recipe;
  inventoryNames: Set<string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  function handleAddToShoppingList() {
    startTransition(async () => {
      const result = await addRecipeToShoppingList(
        sortedIngredients.map((ing) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        }))
      );
      if (!result.error) {
        setAddedMessage("Lagt til i handlelisten!");
        setTimeout(() => setAddedMessage(null), 3000);
      }
    });
  }

  const sortedIngredients = [...recipe.recipe_ingredients].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const sortedInstructions = [...recipe.recipe_instructions].sort(
    (a, b) => a.step_order - b.step_order
  );

  const groupedIngredients = GROCERY_CATEGORIES.map((cat) => ({
    ...cat,
    items: sortedIngredients.filter((ing) => ing.category === cat.value),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsEditing(false);
        }}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
      >
        <span className="text-sm font-medium text-slate-800">{recipe.name}</span>
        <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          {isEditing ? (
            <EditRecipeForm
              recipe={recipe}
              onDone={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-4">
              {/* Ingredients section */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowIngredients((prev) => !prev)}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 transition mb-2"
                >
                  Ingredienser
                  <span className="text-slate-300">{showIngredients ? "▲" : "▼"}</span>
                </button>
                {showIngredients && (
                  <div className="space-y-3">
                    {groupedIngredients.map((cat) => (
                      <div key={cat.value}>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                          {cat.label}
                        </h4>
                        <ul className="space-y-1">
                          {cat.items.map((ing) => {
                            const inInventory = inventoryNames.has(
                              ing.name.toLowerCase().trim()
                            );
                            return (
                              <li key={ing.id} className="text-sm text-slate-700">
                                {ing.name}{" "}
                                <span className="text-slate-400">
                                  {ing.amount} {ing.unit}
                                </span>
                                {inInventory && (
                                  <span className="ml-1 text-xs text-green-500">
                                    ✓ i beholdning
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions section */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowInstructions((prev) => !prev)}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 transition mb-2"
                >
                  Fremgangsmåte
                  <span className="text-slate-300">{showInstructions ? "▲" : "▼"}</span>
                </button>
                {showInstructions && (
                  <ol className="space-y-2 list-decimal list-inside">
                    {sortedInstructions.map((step) => (
                      <li key={step.id} className="text-sm text-slate-700">
                        {step.step_text}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-slate-500 hover:text-slate-700 transition"
                >
                  Rediger
                </button>
                <form action={deleteRecipe}>
                  <input type="hidden" name="id" value={recipe.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-500 hover:text-red-700 transition"
                  >
                    Slett oppskrift
                  </button>
                </form>
                <button
                  type="button"
                  onClick={handleAddToShoppingList}
                  disabled={isPending}
                  className="text-xs text-green-600 hover:text-green-800 transition disabled:opacity-50"
                >
                  {isPending ? "Legger til..." : "Legg til i handleliste"}
                </button>
              </div>
              {addedMessage && (
                <p className="text-xs text-green-600 mt-1">{addedMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RecipeList({
  recipes,
  inventoryNames,
}: {
  recipes: Recipe[];
  inventoryNames: Set<string>;
}) {
  if (recipes.length === 0) {
    return (
      <p className="text-slate-400 text-sm">Ingen oppskrifter lagt til ennå.</p>
    );
  }

  return (
    <div className="space-y-2">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} inventoryNames={inventoryNames} />
      ))}
    </div>
  );
}
