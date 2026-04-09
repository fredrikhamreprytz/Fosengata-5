import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GROCERY_CATEGORIES } from "@/lib/types";
import type {
  Grocery,
  DashboardTab,
  ListsSubTab,
  ListType,
  PackingItem,
  PackingList,
  PackingMember,
  Recipe,
  RunningWorkout,
  StrengthWorkout,
  TrainingSubTab,
} from "@/lib/types";
import { getUserHouseholdId } from "@/lib/household";
import { deleteGrocery } from "./actions";
import AddGroceryForm from "./AddGroceryForm";
import AddRecipeForm from "./AddRecipeForm";
import Header from "./Header";
import ListsSubSwitcher from "./ListsSubSwitcher";
import RecipeList from "./RecipeList";
import ShoppingList from "./ShoppingList";
import TabSwitcher from "./TabSwitcher";
import AddRunningWorkoutForm from "./training/AddRunningWorkoutForm";
import RunningWorkoutList from "./training/RunningWorkoutList";
import TrainingSubSwitcher from "./training/TrainingSubSwitcher";
import AddStrengthWorkoutForm from "./training/AddStrengthWorkoutForm";
import StrengthWorkoutList from "./training/StrengthWorkoutList";
import AddPackingItemForm from "./packing/AddPackingItemForm";
import PackingListItems from "./packing/PackingList";
import PackingListSwitcher from "./packing/PackingListSwitcher";
import UncheckAllButton from "./packing/UncheckAllButton";
import DeletePackingListButton from "./packing/DeletePackingListButton";
import RenamePackingListButton from "./packing/RenamePackingListButton";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; subtab?: string; list?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const householdId = await getUserHouseholdId();
  if (!householdId) redirect("/household/setup");

  const [householdData, profileData] = await Promise.all([
    supabase.from("households").select("name").eq("id", householdId).single(),
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
  ]);
  const householdName = householdData.data?.name ?? "";
  const userName = profileData.data?.display_name ?? user.email ?? "";

  const { tab, subtab, list: listParam } = await searchParams;

  const activeTab: DashboardTab =
    tab === "lists" || tab === "recipes" || tab === "training" ? tab : "lists";

  const listsSubTab: ListsSubTab =
    activeTab === "lists"
      ? subtab === "inventory"
        ? "inventory"
        : subtab === "packing"
        ? "packing"
        : "shopping"
      : "shopping";

  const trainingSubTab: TrainingSubTab = subtab === "strength" ? "strength" : "running";

  let groceries: Grocery[] = [];
  let recipes: Recipe[] = [];
  let runningWorkouts: RunningWorkout[] = [];
  let strengthWorkouts: StrengthWorkout[] = [];
  let inventoryNames = new Set<string>();
  let packingLists: PackingList[] = [];
  let activePackingList: PackingList | null = null;
  let packingItems: PackingItem[] = [];
  let packingChecks: { item_id: string; user_id: string }[] = [];
  let packingMembers: PackingMember[] = [];

  if (activeTab === "lists") {
    if (listsSubTab === "shopping" || listsSubTab === "inventory") {
      const listType: ListType = listsSubTab;
      const { data } = await supabase
        .from("groceries")
        .select("*")
        .eq("household_id", householdId)
        .eq("list_type", listType)
        .order("created_at", { ascending: false });
      groceries = data ?? [];
    } else {
      const { data: listsData } = await supabase
        .from("packing_lists")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true });
      packingLists = listsData ?? [];

      activePackingList =
        packingLists.find((l) => l.id === listParam) ?? packingLists[0] ?? null;

      if (activePackingList) {
        const [itemsResult, membersResult] = await Promise.all([
          supabase
            .from("packing_items")
            .select("*")
            .eq("list_id", activePackingList.id)
            .eq("household_id", householdId)
            .or(`is_personal.eq.false,and(is_personal.eq.true,created_by.eq.${user.id})`)
            .order("created_at", { ascending: false }),
          supabase
            .from("household_members")
            .select("user_id")
            .eq("household_id", householdId),
        ]);
        packingItems = itemsResult.data ?? [];
        const memberUserIds = (membersResult.data ?? []).map((m: { user_id: string }) => m.user_id);

        const itemIds = packingItems.map((i) => i.id);
        const [checksResult, profilesResult] = await Promise.all([
          itemIds.length > 0
            ? supabase.from("packing_checks").select("item_id, user_id").in("item_id", itemIds)
            : Promise.resolve({ data: [] as { item_id: string; user_id: string }[] }),
          memberUserIds.length > 0
            ? supabase.from("profiles").select("id, display_name").in("id", memberUserIds)
            : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
        ]);
        packingChecks = (checksResult.data as { item_id: string; user_id: string }[] | null) ?? [];
        packingMembers = ((profilesResult.data as { id: string; display_name: string }[] | null) ?? []).map((p) => ({
          userId: p.id,
          displayName: p.display_name,
        }));
      }
    }
  } else if (activeTab === "recipes") {
    const [recipesResult, inventoryResult] = await Promise.all([
      supabase
        .from("recipes")
        .select("*, recipe_ingredients(*), recipe_instructions(*)")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false }),
      supabase
        .from("groceries")
        .select("name")
        .eq("household_id", householdId)
        .eq("list_type", "inventory"),
    ]);
    recipes = recipesResult.data ?? [];
    inventoryNames = new Set(
      (inventoryResult.data ?? []).map((g: { name: string }) =>
        g.name.toLowerCase().trim()
      )
    );
  } else if (activeTab === "training") {
    if (trainingSubTab === "running") {
      const { data } = await supabase
        .from("running_workouts")
        .select("*, running_workout_steps(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      runningWorkouts = data ?? [];
    } else {
      const { data } = await supabase
        .from("strength_workouts")
        .select("*, strength_exercises(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      strengthWorkouts = data ?? [];
    }
  }

  const grouped = GROCERY_CATEGORIES.map((cat) => ({
    ...cat,
    items: groceries.filter((g) => g.category === cat.value),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Header householdName={householdName} userName={userName} />

        {/* Tab switcher */}
        <TabSwitcher activeTab={activeTab} />

        {activeTab === "lists" ? (
          <>
            {/* Lists sub-tab switcher */}
            <ListsSubSwitcher activeSubTab={listsSubTab} />

            {listsSubTab === "shopping" ? (
              <>
                {/* Add grocery card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Legg til vare</h2>
                  <AddGroceryForm listType="shopping" />
                </div>

                {/* Shopping list card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-6">
                  <ShoppingList groceries={groceries} />
                </div>
              </>
            ) : listsSubTab === "inventory" ? (
              <>
                {/* Add grocery card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Legg til vare</h2>
                  <AddGroceryForm listType="inventory" />
                </div>

                {/* Inventory list card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Beholdning</h2>
                  {grouped.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      Ingen varer i beholdningen ennå.
                    </p>
                  ) : (
                    grouped.map((cat) => (
                      <div key={cat.value}>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                          {cat.label}
                        </h3>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                          {cat.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between py-2"
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-100">
                                {item.name}
                                <span className="ml-2 text-slate-400 dark:text-slate-500">
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
                </div>
              </>
            ) : (
              <>
                {/* Packing list switcher */}
                <PackingListSwitcher
                  lists={packingLists}
                  activeListId={activePackingList?.id ?? null}
                />

                {activePackingList ? (
                  <>
                    {/* Add packing item card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Legg til element</h2>
                      <AddPackingItemForm listId={activePackingList.id} />
                    </div>

                    {/* Packing list card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{activePackingList.name}</h2>
                        <div className="flex items-center gap-3">
                          <RenamePackingListButton listId={activePackingList.id} currentName={activePackingList.name} />
                          <UncheckAllButton listId={activePackingList.id} />
                          <DeletePackingListButton listId={activePackingList.id} />
                        </div>
                      </div>
                      <PackingListItems
                        items={packingItems}
                        checks={packingChecks}
                        members={packingMembers}
                        currentUserId={user.id}
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
                    <p className="text-slate-400 dark:text-slate-500 text-sm">Opprett en pakkeliste for å komme i gang.</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : activeTab === "recipes" ? (
          <>
            {/* Add recipe card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Legg til oppskrift</h2>
              <AddRecipeForm />
            </div>

            {/* Recipe list card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Oppskrifter</h2>
              <RecipeList recipes={recipes} inventoryNames={inventoryNames} />
            </div>
          </>
        ) : (
          <>
            {/* Training sub-tab switcher */}
            <TrainingSubSwitcher activeSubTab={trainingSubTab} />

            {trainingSubTab === "running" ? (
              <>
                {/* Add running workout card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Legg til løpeøkt</h2>
                  <AddRunningWorkoutForm />
                </div>

                {/* Running workout list card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Løpeøkter</h2>
                  <RunningWorkoutList workouts={runningWorkouts} />
                </div>
              </>
            ) : (
              <>
                {/* Add strength workout card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Legg til styrkeøkt</h2>
                  <AddStrengthWorkoutForm />
                </div>

                {/* Strength workout list card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Styrkeøkter</h2>
                  <StrengthWorkoutList workouts={strengthWorkouts} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
