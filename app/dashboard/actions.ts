"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GROCERY_CATEGORIES, GROCERY_UNITS } from "@/lib/types";
import type { GroceryCategory, GroceryUnit } from "@/lib/types";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function addGrocery(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = (formData.get("name") as string | null)?.trim();
  const category = formData.get("category") as string | null;
  const amountRaw = formData.get("amount") as string | null;
  const unit = formData.get("unit") as string | null;

  if (!name) return { error: "Varenavn er påkrevd." };

  const validCategories = GROCERY_CATEGORIES.map((c) => c.value);
  if (!category || !validCategories.includes(category as GroceryCategory)) {
    return { error: "Ugyldig kategori." };
  }

  const amount = parseFloat(amountRaw ?? "");
  if (isNaN(amount) || amount <= 0) {
    return { error: "Antall må være et positivt tall." };
  }

  const validUnits = GROCERY_UNITS.map((u) => u.value);
  if (!unit || !validUnits.includes(unit as GroceryUnit)) {
    return { error: "Ugyldig enhet." };
  }

  const { error } = await supabase.from("groceries").insert({
    name,
    category,
    amount,
    unit,
  });

  if (error) return { error: "Kunne ikke legge til vare. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteGrocery(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabase.from("groceries").delete().eq("id", id);
  revalidatePath("/dashboard");
}
