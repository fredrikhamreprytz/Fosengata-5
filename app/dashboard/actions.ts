"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GROCERY_CATEGORIES, GROCERY_UNITS, RECIPE_UNITS } from "@/lib/types";
import type { GroceryCategory, GroceryUnit, ListType, RecipeIngredientInput, RecipeUnit } from "@/lib/types";

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
  const listTypeRaw = formData.get("list_type") as string | null;

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

  const validListTypes: ListType[] = ["shopping", "inventory"];
  const listType: ListType =
    listTypeRaw && validListTypes.includes(listTypeRaw as ListType)
      ? (listTypeRaw as ListType)
      : "shopping";

  const { error } = await supabase.from("groceries").insert({
    name,
    category,
    amount,
    unit,
    list_type: listType,
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

export async function addRecipe(payload: {
  name: string;
  ingredients: RecipeIngredientInput[];
  instructions: string[];
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = payload.name.trim();
  if (!name) return { error: "Oppskriftnavn er påkrevd." };
  if (payload.ingredients.length === 0) return { error: "Minst én ingrediens er påkrevd." };
  if (payload.instructions.length === 0) return { error: "Minst ett steg er påkrevd." };

  const validCategories = GROCERY_CATEGORIES.map((c) => c.value);
  const validRecipeUnits = RECIPE_UNITS.map((u) => u.value);

  for (const ing of payload.ingredients) {
    if (!ing.name.trim()) return { error: "Ingrediensnavn er påkrevd." };
    if (!validCategories.includes(ing.category as GroceryCategory)) return { error: "Ugyldig kategori." };
    if (!validRecipeUnits.includes(ing.unit as RecipeUnit)) return { error: "Ugyldig enhet." };
    if (isNaN(ing.amount) || ing.amount <= 0) return { error: "Antall må være et positivt tall." };
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({ name })
    .select("id")
    .single();

  if (recipeError || !recipe) return { error: "Kunne ikke lagre oppskriften. Prøv igjen." };

  const { error: ingError } = await supabase.from("recipe_ingredients").insert(
    payload.ingredients.map((ing, i) => ({
      recipe_id: recipe.id,
      name: ing.name.trim(),
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category,
      sort_order: i,
    }))
  );

  if (ingError) return { error: "Kunne ikke lagre ingredienser. Prøv igjen." };

  const { error: instrError } = await supabase.from("recipe_instructions").insert(
    payload.instructions.map((step, i) => ({
      recipe_id: recipe.id,
      step_text: step.trim(),
      step_order: i,
    }))
  );

  if (instrError) return { error: "Kunne ikke lagre fremgangsmåte. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateRecipe(
  id: string,
  payload: {
    name: string;
    ingredients: RecipeIngredientInput[];
    instructions: string[];
  }
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = payload.name.trim();
  if (!name) return { error: "Oppskriftnavn er påkrevd." };
  if (payload.ingredients.length === 0) return { error: "Minst én ingrediens er påkrevd." };
  if (payload.instructions.length === 0) return { error: "Minst ett steg er påkrevd." };

  const validCategories = GROCERY_CATEGORIES.map((c) => c.value);
  const validRecipeUnits = RECIPE_UNITS.map((u) => u.value);

  for (const ing of payload.ingredients) {
    if (!ing.name.trim()) return { error: "Ingrediensnavn er påkrevd." };
    if (!validCategories.includes(ing.category as GroceryCategory)) return { error: "Ugyldig kategori." };
    if (!validRecipeUnits.includes(ing.unit as RecipeUnit)) return { error: "Ugyldig enhet." };
    if (isNaN(ing.amount) || ing.amount <= 0) return { error: "Antall må være et positivt tall." };
  }

  const { error: nameError } = await supabase
    .from("recipes")
    .update({ name })
    .eq("id", id);

  if (nameError) return { error: "Kunne ikke oppdatere oppskriften. Prøv igjen." };

  await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
  await supabase.from("recipe_instructions").delete().eq("recipe_id", id);

  const { error: ingError } = await supabase.from("recipe_ingredients").insert(
    payload.ingredients.map((ing, i) => ({
      recipe_id: id,
      name: ing.name.trim(),
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category,
      sort_order: i,
    }))
  );

  if (ingError) return { error: "Kunne ikke lagre ingredienser. Prøv igjen." };

  const { error: instrError } = await supabase.from("recipe_instructions").insert(
    payload.instructions.map((step, i) => ({
      recipe_id: id,
      step_text: step.trim(),
      step_order: i,
    }))
  );

  if (instrError) return { error: "Kunne ikke lagre fremgangsmåte. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteRecipe(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabase.from("recipes").delete().eq("id", id);
  revalidatePath("/dashboard");
}
