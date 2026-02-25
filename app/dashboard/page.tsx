import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GROCERY_CATEGORIES } from "@/lib/types";
import type { Grocery, ListType, DashboardTab, Recipe, RunningWorkout } from "@/lib/types";
import { deleteGrocery } from "./actions";
import AddGroceryForm from "./AddGroceryForm";
import AddRecipeForm from "./AddRecipeForm";
import Header from "./Header";
import RecipeList from "./RecipeList";
import ShoppingList from "./ShoppingList";
import TabSwitcher from "./TabSwitcher";
import AddRunningWorkoutForm from "./training/AddRunningWorkoutForm";
import RunningWorkoutList from "./training/RunningWorkoutList";

function isGroceryTab(t: DashboardTab): t is ListType {
  return t === "shopping" || t === "inventory";
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { tab } = await searchParams;
  const activeTab: DashboardTab =
    tab === "shopping" || tab === "inventory" || tab === "recipes" || tab === "training"
      ? tab
      : "shopping";

  let groceries: Grocery[] = [];
  let recipes: Recipe[] = [];
  let runningWorkouts: RunningWorkout[] = [];
  let inventoryNames = new Set<string>();

  if (isGroceryTab(activeTab)) {
    const { data } = await supabase
      .from("groceries")
      .select("*")
      .eq("list_type", activeTab)
      .order("created_at", { ascending: false });
    groceries = data ?? [];
  } else if (activeTab === "recipes") {
    const [recipesResult, inventoryResult] = await Promise.all([
      supabase
        .from("recipes")
        .select("*, recipe_ingredients(*), recipe_instructions(*)")
        .order("created_at", { ascending: false }),
      supabase.from("groceries").select("name").eq("list_type", "inventory"),
    ]);
    recipes = recipesResult.data ?? [];
    inventoryNames = new Set(
      (inventoryResult.data ?? []).map((g: { name: string }) =>
        g.name.toLowerCase().trim()
      )
    );
  } else if (activeTab === "training") {
    const { data } = await supabase
      .from("running_workouts")
      .select("*, running_workout_steps(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    runningWorkouts = data ?? [];
  }

  const grouped = GROCERY_CATEGORIES.map((cat) => ({
    ...cat,
    items: groceries.filter((g) => g.category === cat.value),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Header />

        {/* Tab switcher */}
        <TabSwitcher activeTab={activeTab} />

        {isGroceryTab(activeTab) ? (
          <>
            {/* Add grocery card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Legg til vare</h2>
              <AddGroceryForm listType={activeTab} />
            </div>

            {/* Grocery list card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              {activeTab === "shopping" ? (
                <ShoppingList groceries={groceries} />
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-700">Beholdning</h2>
                  {grouped.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      Ingen varer i beholdningen ennå.
                    </p>
                  ) : (
                    grouped.map((cat) => (
                      <div key={cat.value}>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                          {cat.label}
                        </h3>
                        <ul className="divide-y divide-gray-100">
                          {cat.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between py-2"
                            >
                              <span className="text-sm text-gray-800">
                                {item.name}
                                <span className="ml-2 text-gray-400">
                                  {item.amount} {item.unit}
                                </span>
                              </span>
                              <form action={deleteGrocery}>
                                <input type="hidden" name="id" value={item.id} />
                                <button
                                  type="submit"
                                  className="text-xs text-red-500 hover:text-red-700 transition"
                                >
                                  Slett
                                </button>
                              </form>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </>
        ) : activeTab === "recipes" ? (
          <>
            {/* Add recipe card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Legg til oppskrift</h2>
              <AddRecipeForm />
            </div>

            {/* Recipe list card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Oppskrifter</h2>
              <RecipeList recipes={recipes} inventoryNames={inventoryNames} />
            </div>
          </>
        ) : (
          <>
            {/* Add running workout card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Legg til løpeøkt</h2>
              <AddRunningWorkoutForm />
            </div>

            {/* Running workout list card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Løpeøkter</h2>
              <RunningWorkoutList workouts={runningWorkouts} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
