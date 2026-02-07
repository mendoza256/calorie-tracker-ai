-- Migration: Add mealType column to Meal table
-- Run this migration to add support for meal types (breakfast, lunch, dinner, snack)

ALTER TABLE "Meal" 
ADD COLUMN IF NOT EXISTS "mealType" VARCHAR(20) NOT NULL DEFAULT 'breakfast';

-- Add constraint to ensure only valid meal types are allowed
ALTER TABLE "Meal" 
ADD CONSTRAINT check_meal_type 
CHECK ("mealType" IN ('breakfast', 'lunch', 'dinner', 'snack'));

-- Create an index for faster queries by meal type
CREATE INDEX IF NOT EXISTS idx_meal_meal_type ON "Meal"("mealType");
