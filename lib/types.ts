export type GroceryCategory =
  | "produce"
  | "dairy"
  | "meat-fish"
  | "bakery"
  | "pantry"
  | "sauces"
  | "beverages"
  | "snacks"
  | "household";

export const GROCERY_CATEGORIES: { value: GroceryCategory; label: string }[] =
  [
    { value: "produce", label: "Frukt og grønt" },
    { value: "dairy", label: "Meieri" },
    { value: "meat-fish", label: "Kjøtt og fisk" },
    { value: "bakery", label: "Bakevarer" },
    { value: "pantry", label: "Hermetikk og tørrvarer" },
    { value: "sauces", label: "Sauser og krydder" },
    { value: "beverages", label: "Drikke" },
    { value: "snacks", label: "Snacks og godterier" },
    { value: "household", label: "Renhold og hygiene" },
  ];

export type GroceryUnit = "stk" | "kg" | "g" | "l" | "ml" | "pak";

export const GROCERY_UNITS: { value: GroceryUnit; label: string }[] = [
  { value: "stk", label: "stykk" },
  { value: "kg", label: "kilogram" },
  { value: "g", label: "gram" },
  { value: "l", label: "liter" },
  { value: "ml", label: "milliliter" },
  { value: "pak", label: "pakke" },
];

export type RecipeUnit = GroceryUnit | "dl" | "ss" | "ts" | "kopp" | "klype";

export const RECIPE_UNITS: { value: RecipeUnit; label: string }[] = [
  ...GROCERY_UNITS,
  { value: "dl", label: "desiliter" },
  { value: "ss", label: "spiseskje" },
  { value: "ts", label: "teskje" },
  { value: "kopp", label: "kopp" },
  { value: "klype", label: "klype" },
];

export type ListType = "shopping" | "inventory";

export interface Grocery {
  id: string;
  name: string;
  category: GroceryCategory;
  amount: number;
  unit: GroceryUnit;
  list_type: ListType;
  created_at: string;
}

export type DashboardTab = "shopping" | "inventory" | "recipes";

export interface RecipeIngredientInput {
  name: string;
  amount: number;
  unit: RecipeUnit;
  category: GroceryCategory;
}

export interface RecipeIngredient extends RecipeIngredientInput {
  id: string;
  recipe_id: string;
  sort_order: number;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  step_text: string;
  step_order: number;
}

export interface Recipe {
  id: string;
  name: string;
  created_at: string;
  recipe_ingredients: RecipeIngredient[];
  recipe_instructions: RecipeInstruction[];
}
