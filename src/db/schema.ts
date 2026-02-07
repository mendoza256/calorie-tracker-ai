import { pgTable, index, check, text, doublePrecision, timestamp, varchar, uniqueIndex, unique, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const meal = pgTable("Meal", {
	id: text().primaryKey().notNull(),
	date: text().notNull(),
	description: text().notNull(),
	calories: doublePrecision().notNull(),
	protein: doublePrecision().notNull(),
	carbs: doublePrecision().notNull(),
	fats: doublePrecision().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	mealType: varchar({ length: 20 }).default('breakfast').notNull(),
	userId: varchar({ length: 255 }),
}, (table) => [
	index("Meal_date_idx").using("btree", table.date.asc().nullsLast().op("text_ops")),
	index("idx_meal_meal_type").using("btree", table.mealType.asc().nullsLast().op("text_ops")),
	index("idx_meal_user_date").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("text_ops")),
	index("idx_meal_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	check("check_meal_type", sql`("mealType")::text = ANY ((ARRAY['breakfast'::character varying, 'lunch'::character varying, 'dinner'::character varying, 'snack'::character varying])::text[])`),
]);

export const dailyTotals = pgTable("DailyTotals", {
	id: text().primaryKey().notNull(),
	date: text().notNull(),
	totalCalories: doublePrecision().default(0).notNull(),
	totalProtein: doublePrecision().default(0).notNull(),
	totalCarbs: doublePrecision().default(0).notNull(),
	totalFats: doublePrecision().default(0).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	userId: varchar({ length: 255 }),
}, (table) => [
	index("DailyTotals_date_idx").using("btree", table.date.asc().nullsLast().op("text_ops")),
	uniqueIndex("DailyTotals_date_key").using("btree", table.date.asc().nullsLast().op("text_ops")),
	index("idx_daily_totals_user_date").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("text_ops")),
	index("idx_daily_totals_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("DailyTotals_userId_date_key").on(table.date, table.userId),
]);

export const recipe = pgTable("Recipe", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	calories: numeric({ precision: 10, scale:  2 }).notNull(),
	protein: numeric({ precision: 10, scale:  2 }).notNull(),
	carbs: numeric({ precision: 10, scale:  2 }).notNull(),
	fats: numeric({ precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_recipe_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_recipe_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);
