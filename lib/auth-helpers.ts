import { auth } from "./auth";
import { headers } from "next/headers";

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
