import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GROCERY_CATEGORIES } from "@/lib/types";
import type { Grocery, ListType } from "@/lib/types";
import { signOut, deleteGrocery } from "./actions";
import AddGroceryForm from "./AddGroceryForm";
import TabSwitcher from "./TabSwitcher";

const TAB_LABELS: Record<ListType, string> = {
  shopping: "Handleliste",
  inventory: "Beholdning",
};

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
  const activeTab: ListType =
    tab === "shopping" || tab === "inventory" ? tab : "shopping";

  const { data } = await supabase
    .from("groceries")
    .select("*")
    .eq("list_type", activeTab)
    .order("created_at", { ascending: false });

  const groceries: Grocery[] = data ?? [];

  const grouped = GROCERY_CATEGORIES.map((cat) => ({
    ...cat,
    items: groceries.filter((g) => g.category === cat.value),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Fosengata 5</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Logg ut
            </button>
          </form>
        </div>

        {/* Tab switcher */}
        <TabSwitcher activeTab={activeTab} />

        {/* Add grocery card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Legg til vare</h2>
          <AddGroceryForm listType={activeTab} />
        </div>

        {/* Grocery list card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">
            {TAB_LABELS[activeTab]}
          </h2>

          {grouped.length === 0 ? (
            <p className="text-gray-400 text-sm">
              {activeTab === "shopping"
                ? "Ingen varer på handlelisten ennå."
                : "Ingen varer i beholdningen ennå."}
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
        </div>
      </div>
    </main>
  );
}
