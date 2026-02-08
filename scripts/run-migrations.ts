#!/usr/bin/env tsx
/**
 * Script to run all database migrations
 * 
 * This script runs:
 * 1. Better Auth migrations
 * 2. Custom SQL migrations from the migrations/ directory
 * 
 * Usage:
 *   tsx scripts/run-migrations.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { Pool } from "pg";
import { readFileSync, readdirSync } from "fs";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Try .env as fallback
  dotenv.config({ path: resolve(process.cwd(), ".env") });
}

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set");
  process.exit(1);
}

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL!;
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
  console.log(`📊 Database URL: ${maskedUrl}\n`);

  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Step 1: Run Better Auth migrations
    console.log("🔐 Running Better Auth migrations...");
    try {
      execSync("npx @better-auth/cli@latest migrate", {
        stdio: "inherit",
        env: { ...process.env },
      });
      console.log("✅ Better Auth migrations completed\n");
    } catch (error) {
      console.error("❌ Better Auth migrations failed");
      throw error;
    }

    // Step 2: Run custom SQL migrations
    console.log("📝 Running custom SQL migrations...");
    const migrationsDir = resolve(process.cwd(), "migrations");
    
    if (!existsSync(migrationsDir)) {
      console.log("⚠️  No migrations directory found, skipping custom migrations");
      return;
    }

    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Run migrations in alphabetical order

    if (migrationFiles.length === 0) {
      console.log("⚠️  No SQL migration files found");
      return;
    }

    for (const file of migrationFiles) {
      const filePath = resolve(migrationsDir, file);
      const sql = readFileSync(filePath, "utf-8");
      
      console.log(`   Running ${file}...`);
      try {
        await pool.query(sql);
        console.log(`   ✅ ${file} completed`);
      } catch (error) {
        // Some migrations might fail if they've already been run (e.g., IF NOT EXISTS)
        // Check if it's a "already exists" type error
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();
          if (
            errorMsg.includes("already exists") ||
            errorMsg.includes("duplicate") ||
            errorMsg.includes("relation") && errorMsg.includes("does not exist") === false
          ) {
            console.log(`   ⚠️  ${file} - some objects may already exist (skipping)`);
            continue;
          }
        }
        throw error;
      }
    }

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error(`\nStack trace:\n${error.stack}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
