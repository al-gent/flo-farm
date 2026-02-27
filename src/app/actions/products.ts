"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { products, productUnits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getFarmByUserId } from "@/db/queries";

type UnitInput = {
  unit: string;
  price: string;
  ratio: string;
  isPrimary: boolean;
};

export async function createProductAction(data: {
  name: string;
  description: string | null;
  quantity: string;
  units: UnitInput[];
}): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "farmer") return "Unauthorized";

  const farm = await getFarmByUserId(session.user.id);
  if (!farm) return "Farm not found";

  if (!data.units.length) return "At least one unit is required";

  try {
    const [product] = await db
      .insert(products)
      .values({
        farmId: farm.id,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
      })
      .returning();

    const unitRows = await db
      .insert(productUnits)
      .values(
        data.units.map((u) => ({
          productId: product.id,
          unit: u.unit,
          price: u.price,
          ratio: u.ratio,
        }))
      )
      .returning();

    const primaryIdx = data.units.findIndex((u) => u.isPrimary);
    const primaryUnit = unitRows[primaryIdx >= 0 ? primaryIdx : 0];
    await db
      .update(products)
      .set({ primaryUnitId: primaryUnit.id })
      .where(eq(products.id, product.id));

    revalidatePath("/dashboard/products");
    return null;
  } catch (e) {
    console.error("createProductAction:", e);
    return "Failed to create product. Please try again.";
  }
}

export async function deactivateProductAction(productId: string): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "farmer") return "Unauthorized";

  await db.update(products).set({ active: false }).where(eq(products.id, productId));
  revalidatePath("/dashboard/products");
  return null;
}

export async function reactivateProductAction(productId: string): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "farmer") return "Unauthorized";

  await db.update(products).set({ active: true }).where(eq(products.id, productId));
  revalidatePath("/dashboard/products");
  return null;
}
