import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Load environment variables if not already loaded (for CLI scripts)
// Next.js automatically loads .env.local, but CLI tools don't
if (!process.env.DATABASE_URL && typeof window === "undefined") {
  try {
    const dotenv = require("dotenv");
    const { resolve } = require("path");
    const result = dotenv.config({ path: resolve(process.cwd(), ".env.local") });
    // If dotenv loaded successfully but DATABASE_URL still isn't set, it might be in .env
    if (!process.env.DATABASE_URL && !result.error) {
      dotenv.config({ path: resolve(process.cwd(), ".env") });
    }
  } catch {
    // dotenv might not be available, that's okay
  }
}

// Create a separate Pool instance for Better Auth
// Better Auth needs a pg Pool directly, not a Drizzle instance
// Parse DATABASE_URL to handle cases with or without password
const getAuthDbConfig = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not set. Make sure .env.local exists and contains DATABASE_URL"
    );
  }

  // If connection string includes password, use it directly
  if (dbUrl.includes("@") && dbUrl.split("@")[0].includes(":")) {
    return { connectionString: dbUrl };
  }

  // Otherwise, try to parse it manually for local auth (no password)
  try {
    const url = new URL(dbUrl.replace("postgresql://", "http://"));
    const username = url.username || process.env.USER || process.env.USERNAME;
    if (!username) {
      throw new Error(
        "Database username not found in DATABASE_URL and no system username available. " +
        "Please ensure DATABASE_URL includes a username (e.g., postgresql://username@host:port/database)"
      );
    }
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1).split("?")[0],
      user: username,
      // No password for local peer authentication
    };
  } catch (error) {
    // If it's our custom error, re-throw it
    if (error instanceof Error && error.message.includes("Database username")) {
      throw error;
    }
    // Fallback to connection string for other parsing errors
    return { connectionString: dbUrl };
  }
};

// Lazy initialization - only create pool when needed
let authDb: Pool | null = null;
const getAuthDb = () => {
  if (!authDb) {
    // Ensure DATABASE_URL is available before creating the pool
    // This check happens at pool creation time, not at module load time
    if (!process.env.DATABASE_URL && typeof window === "undefined") {
      // Try loading environment variables one more time if not already loaded
      try {
        const dotenv = require("dotenv");
        const { resolve } = require("path");
        dotenv.config({ path: resolve(process.cwd(), ".env.local") });
        if (!process.env.DATABASE_URL) {
          dotenv.config({ path: resolve(process.cwd(), ".env") });
        }
      } catch {
        // dotenv might not be available, that's okay
      }
    }
    authDb = new Pool(getAuthDbConfig());
  }
  return authDb;
};

// Ensure DATABASE_URL is available before initializing auth
// This prevents errors from being thrown during module import
// The environment loading code above should have loaded it, but we verify here
if (!process.env.DATABASE_URL && typeof window === "undefined") {
  // Final attempt to load environment variables
  try {
    const dotenv = require("dotenv");
    const { resolve } = require("path");
    dotenv.config({ path: resolve(process.cwd(), ".env.local") });
    if (!process.env.DATABASE_URL) {
      dotenv.config({ path: resolve(process.cwd(), ".env") });
    }
  } catch {
    // dotenv might not be available
  }
  
  // If still not set, throw a clear error
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Make sure .env.local exists and contains DATABASE_URL. " +
      "The environment variable loading code should have loaded it, but it wasn't found."
    );
  }
}

// Initialize auth instance
// The database connection is created lazily when getAuthDb() is first called
// In Next.js, .env.local is automatically loaded, so DATABASE_URL will be available
// For CLI scripts, the dotenv.config() at the top will load it
export const auth = betterAuth({
  database: getAuthDb(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000",
  basePath: "/api/auth",
});
