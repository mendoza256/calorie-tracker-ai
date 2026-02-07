-- Migration: Create Recipe table
-- Run this migration to add support for user recipes

CREATE TABLE IF NOT EXISTS "Recipe" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  calories DECIMAL(10, 2) NOT NULL,
  protein DECIMAL(10, 2) NOT NULL,
  carbs DECIMAL(10, 2) NOT NULL,
  fats DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_recipe_user_id ON "Recipe"("userId");

-- Create index for recipe name searches
CREATE INDEX IF NOT EXISTS idx_recipe_name ON "Recipe"(name);
