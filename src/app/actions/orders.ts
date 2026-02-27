"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getFarmByUserId } from "@/db/queries";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "farmer") return "Unauthorized";

  const farm = await getFarmByUserId(session.user.id);
  if (!farm) return "Farm not found";

  const [order] = await db
    .select({ farmId: orders.farmId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order || order.farmId !== farm.id) return "Order not found";

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/completed");
  revalidatePath("/dashboard/harvest");
  return null;
}
