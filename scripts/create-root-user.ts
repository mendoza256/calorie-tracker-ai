#!/usr/bin/env tsx
/**
 * Script to create a root/admin user in Better Auth
 *
 * Usage:
 *   tsx scripts/create-root-user.ts <email> <password> <name>
 *
 * Example:
 *   tsx scripts/create-root-user.ts admin@example.com securepassword123 "Admin User"
 *
 * Or set environment variables:
 *   ROOT_USER_EMAIL=admin@example.com
 *   ROOT_USER_PASSWORD=securepassword123
 *   ROOT_USER_NAME="Admin User"
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load environment variables BEFORE importing auth
// Use absolute path to ensure we load from project root
const envPath = resolve(process.cwd(), ".env.local");

if (!existsSync(envPath)) {
  console.error(`❌ Error: .env.local file not found at ${envPath}`);
  console.error(`   Current working directory: ${process.cwd()}`);
  process.exit(1);
}

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading .env.local: ${result.error.message}`);
  process.exit(1);
}

// Debug: Check if DATABASE_URL is loaded (mask password for security)
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in .env.local");
  console.error(`   File loaded from: ${envPath}`);
  console.error(`   Current working directory: ${process.cwd()}`);
  console.error(`   Available env vars: ${Object.keys(process.env).filter(k => k.includes('DATABASE')).join(', ') || 'none'}`);
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@"); // Mask password
console.log(`📊 Database URL: ${maskedUrl}`);

// Import auth after environment variables are loaded
import { auth } from "../lib/auth";

async function createRootUser() {
  // Get credentials from command line args or environment variables
  const email = process.argv[2] || process.env.ROOT_USER_EMAIL;
  const password = process.argv[3] || process.env.ROOT_USER_PASSWORD;
  const name = process.argv[4] || process.env.ROOT_USER_NAME || "Root Admin";

  if (!email || !password) {
    console.error("❌ Error: Email and password are required");
    console.error("\nUsage:");
    console.error(
      "  tsx scripts/create-root-user.ts <email> <password> [name]"
    );
    console.error("\nOr set environment variables:");
    console.error("  ROOT_USER_EMAIL=admin@example.com");
    console.error("  ROOT_USER_PASSWORD=securepassword123");
    console.error('  ROOT_USER_NAME="Admin User"');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters long");
    process.exit(1);
  }

  try {
    console.log(`\n🔐 Creating root user...`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);

    // Create the user using Better Auth's server-side API
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if ("error" in result) {
      console.error(`\n❌ Error creating user: ${result.error}`);
      process.exit(1);
    }

    if ("user" in result) {
      const user = result?.user;
      console.log(`\n✅ Root user created successfully!`);
      console.log(`   User ID: ${user?.id}`);
      console.log(`   Email: ${user?.email}`);
      console.log(`   Name: ${user?.name || "N/A"}`);
      console.log(
        `\n📝 Note: This user has been created with standard permissions.`
      );
      console.log(`   If you need admin/root privileges, you may need to:`);
      console.log(`   1. Add a custom 'role' field to the user table`);
      console.log(
        `   2. Update your application logic to check for admin role`
      );
      console.log(`\n🔗 You can now log in at: http://localhost:3000/login`);
    } else {
      console.error("\n❌ Unexpected response format");
      console.error(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Failed to create root user:");
    if (error instanceof Error) {
      const errorMessage = error.message;
      console.error(`   ${errorMessage}`);
      
      // Check if it's a missing table error
      if (errorMessage.includes('relation "user" does not exist') || 
          errorMessage.includes('does not exist')) {
        console.error("\n💡 Better Auth database tables haven't been created yet.");
        console.error("   Run the migration command to create them:");
        console.error("   npm run auth:migrate");
        console.error("\n   Or manually:");
        console.error("   npx @better-auth/cli@latest migrate");
      }
      
      if (error.stack && !errorMessage.includes('relation "user" does not exist')) {
        console.error(`\nStack trace:\n${error.stack}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the script
createRootUser();
