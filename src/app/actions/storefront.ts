"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { buyerProfiles, orderItems, orders, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type CartItemInput = {
  productId: string;
  unitId: string;
  unit: string;
  price: string;
  quantity: number;
  ratio: string;
};

type CheckoutInput = {
  name: string;
  email: string;
  organization: string;
  notes: string;
};

export async function submitOrderAction(
  farmId: string,
  cartItems: CartItemInput[],
  checkout: CheckoutInput
): Promise<{ error?: string }> {
  if (!cartItems.length) return { error: "Cart is empty" };

  const session = await auth();
  let buyerId: string;

  if (session?.user.role === "buyer") {
    buyerId = session.user.id;
  } else {
    const email = checkout.email.trim().toLowerCase();
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      buyerId = existing.id;
    } else {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      const [newUser] = await db
        .insert(users)
        .values({ email, password: randomPassword, role: "buyer" })
        .returning();
      const nameParts = checkout.name.trim().split(" ");
      await db.insert(buyerProfiles).values({
        userId: newUser.id,
        firstname: nameParts[0] || null,
        lastname: nameParts.slice(1).join(" ") || null,
        organization: checkout.organization || null,
      });
      buyerId = newUser.id;
    }
  }

  try {
    const [order] = await db
      .insert(orders)
      .values({ farmId, buyerId, notes: checkout.notes || null })
      .returning();

    await db.insert(orderItems).values(
      cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productUnitId: item.unitId,
        quantity: item.quantity.toString(),
        priceAtOrder: item.price,
        unitAtOrder: item.unit,
        ratioAtOrder: item.ratio,
      }))
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/harvest");
    return {};
  } catch (e) {
    console.error("submitOrderAction:", e);
    return { error: "Failed to submit order. Please try again." };
  }
}
