import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray, desc, asc } from "drizzle-orm";
import { meal, dailyTotals, recipe } from "../src/db/schema";
import { Meal, DailyTotals, Recipe } from "./types";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db =
  globalForDb.db ?? drizzle({ client: pool });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

// Helper function to convert timestamp string to Date
function toDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  return new Date(dateStr);
}

// Helper function to convert numeric to number
function toNumber(value: string | null | undefined): number {
  if (!value) return 0;
  return parseFloat(value);
}

// Simple ID generator (similar to cuid)
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${random}`;
}

// Meal functions
export async function getMealsByDate(
  date: string,
  userId: string
): Promise<Meal[]> {
  const results = await db
    .select()
    .from(meal)
    .where(and(eq(meal.date, date), eq(meal.userId, userId)))
    .orderBy(desc(meal.createdAt));

  return results.map((row) => ({
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    description: row.description,
    mealType: row.mealType as Meal["mealType"],
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    createdAt: toDate(row.createdAt),
  }));
}

export async function getMealById(
  id: string,
  userId: string
): Promise<Meal | null> {
  const results = await db
    .select()
    .from(meal)
    .where(and(eq(meal.id, id), eq(meal.userId, userId)))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    description: row.description,
    mealType: row.mealType as Meal["mealType"],
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    createdAt: toDate(row.createdAt),
  };
}

export async function createMeal(data: {
  userId: string;
  date: string;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}): Promise<Meal> {
  const id = generateId();
  const results = await db
    .insert(meal)
    .values({
      id,
      userId: data.userId,
      date: data.date,
      description: data.description,
      mealType: data.mealType,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
    })
    .returning();

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    description: row.description,
    mealType: row.mealType as Meal["mealType"],
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    createdAt: toDate(row.createdAt),
  };
}

export async function updateMeal(
  id: string,
  userId: string,
  updates: { mealType?: string }
): Promise<Meal> {
  const updateData: Partial<typeof meal.$inferInsert> = {};
  if (updates.mealType) {
    updateData.mealType = updates.mealType;
  }

  const results = await db
    .update(meal)
    .set(updateData)
    .where(and(eq(meal.id, id), eq(meal.userId, userId)))
    .returning();

  if (results.length === 0) {
    throw new Error("Meal not found");
  }

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    description: row.description,
    mealType: row.mealType as Meal["mealType"],
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    createdAt: toDate(row.createdAt),
  };
}

export async function deleteMeal(id: string, userId: string): Promise<void> {
  const result = await db
    .delete(meal)
    .where(and(eq(meal.id, id), eq(meal.userId, userId)))
    .returning();

  if (result.length === 0) {
    throw new Error("Meal not found");
  }
}

// DailyTotals functions
export async function getDailyTotalsByDate(
  date: string,
  userId: string
): Promise<DailyTotals | null> {
  const results = await db
    .select()
    .from(dailyTotals)
    .where(and(eq(dailyTotals.date, date), eq(dailyTotals.userId, userId)))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    totalCalories: row.totalCalories,
    totalProtein: row.totalProtein,
    totalCarbs: row.totalCarbs,
    totalFats: row.totalFats,
    updatedAt: toDate(row.updatedAt),
  };
}

export async function getDailyTotalsByDates(
  dates: string[],
  userId: string
): Promise<DailyTotals[]> {
  const results = await db
    .select()
    .from(dailyTotals)
    .where(
      and(
        inArray(dailyTotals.date, dates),
        eq(dailyTotals.userId, userId)
      )
    )
    .orderBy(desc(dailyTotals.date));

  return results.map((row) => ({
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    totalCalories: row.totalCalories,
    totalProtein: row.totalProtein,
    totalCarbs: row.totalCarbs,
    totalFats: row.totalFats,
    updatedAt: toDate(row.updatedAt),
  }));
}

export async function upsertDailyTotals(data: {
  userId: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}): Promise<DailyTotals> {
  const id = generateId();
  const results = await db
    .insert(dailyTotals)
    .values({
      id,
      userId: data.userId,
      date: data.date,
      totalCalories: data.totalCalories,
      totalProtein: data.totalProtein,
      totalCarbs: data.totalCarbs,
      totalFats: data.totalFats,
    })
    .onConflictDoUpdate({
      target: [dailyTotals.date, dailyTotals.userId],
      set: {
        totalCalories: data.totalCalories,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFats: data.totalFats,
      },
    })
    .returning();

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId || "",
    date: row.date,
    totalCalories: row.totalCalories,
    totalProtein: row.totalProtein,
    totalCarbs: row.totalCarbs,
    totalFats: row.totalFats,
    updatedAt: toDate(row.updatedAt),
  };
}

// Recipe functions
export async function getRecipesByUserId(userId: string): Promise<Recipe[]> {
  const results = await db
    .select()
    .from(recipe)
    .where(eq(recipe.userId, userId))
    .orderBy(asc(recipe.name));

  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    calories: toNumber(row.calories),
    protein: toNumber(row.protein),
    carbs: toNumber(row.carbs),
    fats: toNumber(row.fats),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }));
}

export async function getRecipeById(
  id: string,
  userId: string
): Promise<Recipe | null> {
  const results = await db
    .select()
    .from(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    calories: toNumber(row.calories),
    protein: toNumber(row.protein),
    carbs: toNumber(row.carbs),
    fats: toNumber(row.fats),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

export async function createRecipe(data: {
  userId: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}): Promise<Recipe> {
  const id = generateId();
  const results = await db
    .insert(recipe)
    .values({
      id,
      userId: data.userId,
      name: data.name,
      description: data.description,
      calories: data.calories.toString(),
      protein: data.protein.toString(),
      carbs: data.carbs.toString(),
      fats: data.fats.toString(),
    })
    .returning();

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    calories: toNumber(row.calories),
    protein: toNumber(row.protein),
    carbs: toNumber(row.carbs),
    fats: toNumber(row.fats),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

export async function updateRecipe(
  id: string,
  userId: string,
  updates: { name?: string }
): Promise<Recipe> {
  const updateData: Partial<typeof recipe.$inferInsert> = {};
  if (updates.name) {
    updateData.name = updates.name;
  }

  const results = await db
    .update(recipe)
    .set(updateData)
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .returning();

  if (results.length === 0) {
    throw new Error("Recipe not found");
  }

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    calories: toNumber(row.calories),
    protein: toNumber(row.protein),
    carbs: toNumber(row.carbs),
    fats: toNumber(row.fats),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

export async function deleteRecipe(id: string, userId: string): Promise<void> {
  const result = await db
    .delete(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .returning();

  if (result.length === 0) {
    throw new Error("Recipe not found");
  }
}
