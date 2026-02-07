export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  description: string;
  mealType: MealType;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  createdAt: Date;
}

export interface DailyTotals {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  description: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  createdAt: Date;
  updatedAt: Date;
}
