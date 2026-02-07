import { Pool } from "pg";
import { Meal, DailyTotals, Recipe } from "./types";

const globalForDb = globalThis as unknown as {
  db: Pool | undefined;
};

export const db =
  globalForDb.db ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

// Helper functions for database operations
export async function getMealsByDate(date: string): Promise<Meal[]> {
  const result = await db.query(
    'SELECT * FROM "Meal" WHERE date = $1 ORDER BY "createdAt" DESC',
    [date]
  );
  return result.rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));
}

export async function getMealById(id: string): Promise<Meal | null> {
  const result = await db.query('SELECT * FROM "Meal" WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt),
  };
}

// Simple ID generator (similar to cuid)
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${random}`;
}

export async function createMeal(data: {
  date: string;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}): Promise<Meal> {
  const id = generateId();
  const result = await db.query(
    `INSERT INTO "Meal" (id, date, description, "mealType", calories, protein, carbs, fats, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      id,
      data.date,
      data.description,
      data.mealType,
      data.calories,
      data.protein,
      data.carbs,
      data.fats,
    ]
  );
  const row = result.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt),
  };
}

export async function updateMeal(
  id: string,
  updates: { mealType?: string }
): Promise<Meal> {
  const result = await db.query(
    `UPDATE "Meal" 
     SET "mealType" = $1
     WHERE id = $2
     RETURNING *`,
    [updates.mealType, id]
  );
  if (result.rows.length === 0) {
    throw new Error("Meal not found");
  }
  const row = result.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt),
  };
}

export async function deleteMeal(id: string): Promise<void> {
  await db.query('DELETE FROM "Meal" WHERE id = $1', [id]);
}

export async function getDailyTotalsByDate(
  date: string
): Promise<DailyTotals | null> {
  const result = await db.query('SELECT * FROM "DailyTotals" WHERE date = $1', [
    date,
  ]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...row,
    updatedAt: new Date(row.updatedAt),
  };
}

export async function getDailyTotalsByDates(
  dates: string[]
): Promise<DailyTotals[]> {
  const result = await db.query(
    'SELECT * FROM "DailyTotals" WHERE date = ANY($1::text[]) ORDER BY date DESC',
    [dates]
  );
  return result.rows.map((row) => ({
    ...row,
    updatedAt: new Date(row.updatedAt),
  }));
}

export async function upsertDailyTotals(data: {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}): Promise<DailyTotals> {
  const id = generateId();
  const result = await db.query(
    `INSERT INTO "DailyTotals" (id, date, "totalCalories", "totalProtein", "totalCarbs", "totalFats", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (date) 
     DO UPDATE SET 
       "totalCalories" = $3,
       "totalProtein" = $4,
       "totalCarbs" = $5,
       "totalFats" = $6,
       "updatedAt" = NOW()
     RETURNING *`,
    [
      id,
      data.date,
      data.totalCalories,
      data.totalProtein,
      data.totalCarbs,
      data.totalFats,
    ]
  );
  const row = result.rows[0];
  return {
    ...row,
    updatedAt: new Date(row.updatedAt),
  };
}

// Recipe functions
export async function getRecipesByUserId(userId: string): Promise<Recipe[]> {
  const result = await db.query(
    'SELECT * FROM "Recipe" WHERE "userId" = $1 ORDER BY name ASC',
    [userId]
  );
  return result.rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

export async function getRecipeById(id: string, userId: string): Promise<Recipe | null> {
  const result = await db.query(
    'SELECT * FROM "Recipe" WHERE id = $1 AND "userId" = $2',
    [id, userId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
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
  const result = await db.query(
    `INSERT INTO "Recipe" (id, "userId", name, description, calories, protein, carbs, fats, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING *`,
    [
      id,
      data.userId,
      data.name,
      data.description,
      data.calories,
      data.protein,
      data.carbs,
      data.fats,
    ]
  );
  const row = result.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export async function updateRecipe(
  id: string,
  userId: string,
  updates: { name?: string }
): Promise<Recipe> {
  const result = await db.query(
    `UPDATE "Recipe" 
     SET name = $1, "updatedAt" = NOW()
     WHERE id = $2 AND "userId" = $3
     RETURNING *`,
    [updates.name, id, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Recipe not found");
  }
  const row = result.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export async function deleteRecipe(id: string, userId: string): Promise<void> {
  const result = await db.query(
    'DELETE FROM "Recipe" WHERE id = $1 AND "userId" = $2',
    [id, userId]
  );
  if (result.rowCount === 0) {
    throw new Error("Recipe not found");
  }
}
