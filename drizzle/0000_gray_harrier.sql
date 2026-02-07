-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "Meal" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"description" text NOT NULL,
	"calories" double precision NOT NULL,
	"protein" double precision NOT NULL,
	"carbs" double precision NOT NULL,
	"fats" double precision NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"mealType" varchar(20) DEFAULT 'breakfast' NOT NULL,
	"userId" varchar(255),
	CONSTRAINT "check_meal_type" CHECK (("mealType")::text = ANY ((ARRAY['breakfast'::character varying, 'lunch'::character varying, 'dinner'::character varying, 'snack'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "DailyTotals" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"totalCalories" double precision DEFAULT 0 NOT NULL,
	"totalProtein" double precision DEFAULT 0 NOT NULL,
	"totalCarbs" double precision DEFAULT 0 NOT NULL,
	"totalFats" double precision DEFAULT 0 NOT NULL,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"userId" varchar(255),
	CONSTRAINT "DailyTotals_userId_date_key" UNIQUE("date","userId")
);
--> statement-breakpoint
CREATE TABLE "Recipe" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"calories" numeric(10, 2) NOT NULL,
	"protein" numeric(10, 2) NOT NULL,
	"carbs" numeric(10, 2) NOT NULL,
	"fats" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "Meal_date_idx" ON "Meal" USING btree ("date" text_ops);--> statement-breakpoint
CREATE INDEX "idx_meal_meal_type" ON "Meal" USING btree ("mealType" text_ops);--> statement-breakpoint
CREATE INDEX "idx_meal_user_date" ON "Meal" USING btree ("userId" text_ops,"date" text_ops);--> statement-breakpoint
CREATE INDEX "idx_meal_user_id" ON "Meal" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "DailyTotals_date_idx" ON "DailyTotals" USING btree ("date" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "DailyTotals_date_key" ON "DailyTotals" USING btree ("date" text_ops);--> statement-breakpoint
CREATE INDEX "idx_daily_totals_user_date" ON "DailyTotals" USING btree ("userId" text_ops,"date" text_ops);--> statement-breakpoint
CREATE INDEX "idx_daily_totals_user_id" ON "DailyTotals" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_recipe_name" ON "Recipe" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_recipe_user_id" ON "Recipe" USING btree ("userId" text_ops);
*/