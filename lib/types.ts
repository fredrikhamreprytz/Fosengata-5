export type GroceryCategory =
  | "produce"
  | "dairy"
  | "meat-fish"
  | "bakery"
  | "pantry"
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
