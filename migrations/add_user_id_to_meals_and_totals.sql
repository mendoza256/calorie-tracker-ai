-- Migration: Add userId columns to Meal and DailyTotals tables
-- Run this migration to add user authentication support

-- Add userId column to Meal table
ALTER TABLE "Meal" 
ADD COLUMN IF NOT EXISTS "userId" VARCHAR(255);

-- Add userId column to DailyTotals table
ALTER TABLE "DailyTotals" 
ADD COLUMN IF NOT EXISTS "userId" VARCHAR(255);

-- Create indexes for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_meal_user_id ON "Meal"("userId");
CREATE INDEX IF NOT EXISTS idx_daily_totals_user_id ON "DailyTotals"("userId");

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_meal_user_date ON "Meal"("userId", date);
CREATE INDEX IF NOT EXISTS idx_daily_totals_user_date ON "DailyTotals"("userId", date);

-- Add unique constraint on (userId, date) for DailyTotals
-- First drop the existing unique constraint on date if it exists
ALTER TABLE "DailyTotals" DROP CONSTRAINT IF EXISTS "DailyTotals_date_key";
-- Then add the new composite unique constraint
ALTER TABLE "DailyTotals" ADD CONSTRAINT "DailyTotals_userId_date_key" UNIQUE ("userId", date);

-- Note: Existing rows will have NULL userId. You may want to:
-- 1. Delete existing data, OR
-- 2. Assign existing data to a default user, OR
-- 3. Make userId nullable for backward compatibility
-- For now, we'll make it nullable but in production you should make it NOT NULL after migration
