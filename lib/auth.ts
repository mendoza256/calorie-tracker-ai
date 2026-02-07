import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
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
