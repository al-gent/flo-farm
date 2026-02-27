"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { buyerProfiles, farms, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password. Please try again.";
    }
    throw error; // re-throw NEXT_REDIRECT
  }
  return null;
}

export async function signupAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const role = formData.get("role") as "farmer" | "buyer";
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;

  // Pre-check for duplicate email
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return "An account with this email already exists.";

  if (role === "farmer") {
    const farmcode = (formData.get("farmcode") as string).trim().toLowerCase();
    const [existingFarm] = await db.select({ id: farms.id }).from(farms).where(eq(farms.farmcode, farmcode)).limit(1);
    if (existingFarm) return "That farm URL is already taken. Please choose another.";
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, password: hash, role }).returning();

    if (role === "farmer") {
      await db.insert(farms).values({
        userId: user.id,
        farmcode: (formData.get("farmcode") as string).trim().toLowerCase(),
        name: (formData.get("farmName") as string).trim(),
        phone: (formData.get("phone") as string) || null,
      });
    } else {
      await db.insert(buyerProfiles).values({
        userId: user.id,
        firstname: (formData.get("firstname") as string) || null,
        lastname: (formData.get("lastname") as string) || null,
        organization: (formData.get("organization") as string) || null,
        phone: (formData.get("phone") as string) || null,
      });
    }
  } catch (e) {
    console.error("signupAction error:", e);
    return "Something went wrong. Please try again.";
  }

  // signIn throws NEXT_REDIRECT on success
  await signIn("credentials", { email, password, redirectTo: "/" });
  return null;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
