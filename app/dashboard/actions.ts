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

export async function clearShoppingList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("groceries").delete().eq("list_type", "shopping");
  revalidatePath("/dashboard");
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

function convertToGroceryUnit(amount: number, unit: RecipeUnit): { amount: number; unit: GroceryUnit } {
  switch (unit) {
    case "dl":    return { amount: amount * 100, unit: "ml" };
    case "ss":    return { amount: amount * 15,  unit: "ml" };
    case "ts":    return { amount: amount * 5,   unit: "ml" };
    case "kopp":  return { amount: amount * 240, unit: "ml" };
    case "klype": return { amount: amount,       unit: "stk" };
    default:      return { amount, unit: unit as GroceryUnit };
  }
}

export async function addRecipeToShoppingList(
  ingredients: RecipeIngredientInput[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const rows = ingredients.map((ing) => {
    const { amount, unit } = convertToGroceryUnit(ing.amount, ing.unit);
    return { name: ing.name, category: ing.category, amount, unit, list_type: "shopping" as ListType };
  });

  const { error } = await supabase.from("groceries").insert(rows);
  if (error) return { error: "Kunne ikke legge til ingredienser. Prøv igjen." };

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

interface RunningStepInput {
  phase: "warmup" | "main" | "cooldown";
  position: number;
  is_recovery: boolean;
  duration_seconds: number | null;
  distance_km: number | null;
  speed_kmh: number | null;
  incline_pct: number | null;
}

export async function addRunningWorkout(payload: {
  name: string;
  steps: RunningStepInput[];
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = payload.name.trim();
  if (!name) return { error: "Navn på økt er påkrevd." };
  if (payload.steps.length === 0) return { error: "Minst ett steg er påkrevd." };

  const { data: workout, error: workoutError } = await supabase
    .from("running_workouts")
    .insert({ name, user_id: user.id })
    .select("id")
    .single();

  if (workoutError || !workout) return { error: "Kunne ikke lagre økt. Prøv igjen." };

  const { error: stepsError } = await supabase.from("running_workout_steps").insert(
    payload.steps.map((s) => ({
      workout_id: workout.id,
      phase: s.phase,
      position: s.position,
      is_recovery: s.is_recovery,
      duration_seconds: s.duration_seconds,
      distance_km: s.distance_km,
      speed_kmh: s.speed_kmh,
      incline_pct: s.incline_pct,
    }))
  );

  if (stepsError) return { error: "Kunne ikke lagre steg. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateRunningWorkout(
  id: string,
  payload: { name: string; steps: RunningStepInput[] }
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = payload.name.trim();
  if (!name) return { error: "Navn på økt er påkrevd." };
  if (payload.steps.length === 0) return { error: "Minst ett steg er påkrevd." };

  const { error: nameError } = await supabase
    .from("running_workouts")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  if (nameError) return { error: "Kunne ikke oppdatere økt. Prøv igjen." };

  await supabase.from("running_workout_steps").delete().eq("workout_id", id);

  const { error: stepsError } = await supabase.from("running_workout_steps").insert(
    payload.steps.map((s) => ({
      workout_id: id,
      phase: s.phase,
      position: s.position,
      is_recovery: s.is_recovery,
      duration_seconds: s.duration_seconds,
      distance_km: s.distance_km,
      speed_kmh: s.speed_kmh,
      incline_pct: s.incline_pct,
    }))
  );

  if (stepsError) return { error: "Kunne ikke lagre steg. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteRunningWorkout(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabase.from("running_workouts").delete().eq("id", id);
  revalidatePath("/dashboard");
}

interface StrengthExerciseInput {
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  label: "too_hard" | "ok" | "increase";
}

export async function addStrengthWorkout(payload: {
  name: string;
  exercises: StrengthExerciseInput[];
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = payload.name.trim();
  if (!name) return { error: "Navn på økt er påkrevd." };
  if (payload.exercises.length === 0) return { error: "Minst én øvelse er påkrevd." };

  const { data: workout, error: workoutError } = await supabase
    .from("strength_workouts")
    .insert({ name, user_id: user.id })
    .select("id")
    .single();

  if (workoutError || !workout) return { error: "Kunne ikke lagre økt. Prøv igjen." };

  const { error: exercisesError } = await supabase.from("strength_exercises").insert(
    payload.exercises.map((ex, i) => ({
      workout_id: workout.id,
      exercise_name: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      weight_kg: ex.weight_kg,
      label: ex.label,
      sort_order: i,
    }))
  );

  if (exercisesError) return { error: "Kunne ikke lagre øvelser. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateStrengthWorkout(
  id: string,
  payload: { name: string; exercises: StrengthExerciseInput[] }
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const name = payload.name.trim();
  if (!name) return { error: "Navn på økt er påkrevd." };
  if (payload.exercises.length === 0) return { error: "Minst én øvelse er påkrevd." };

  const { error: nameError } = await supabase
    .from("strength_workouts")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  if (nameError) return { error: "Kunne ikke oppdatere økt. Prøv igjen." };

  await supabase.from("strength_exercises").delete().eq("workout_id", id);

  const { error: exercisesError } = await supabase.from("strength_exercises").insert(
    payload.exercises.map((ex, i) => ({
      workout_id: id,
      exercise_name: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      weight_kg: ex.weight_kg,
      label: ex.label,
      sort_order: i,
    }))
  );

  if (exercisesError) return { error: "Kunne ikke lagre øvelser. Prøv igjen." };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteStrengthWorkout(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabase.from("strength_workouts").delete().eq("id", id);
  revalidatePath("/dashboard");
}
