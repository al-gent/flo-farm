import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import {
  buyerProfiles,
  farmNotes,
  farms,
  orderItems,
  orders,
  products,
  users,
  type OrderStatus,
} from "./schema";

// ─── Farms ────────────────────────────────────────────────────────────────────

export async function getFarmByFarmcode(farmcode: string) {
  const [farm] = await db.select().from(farms).where(eq(farms.farmcode, farmcode)).limit(1);
  return farm ?? null;
}

export async function getFarmByUserId(userId: string) {
  const [farm] = await db.select().from(farms).where(eq(farms.userId, userId)).limit(1);
  return farm ?? null;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getActiveProductsWithUnits(farmId: string) {
  return db.query.products.findMany({
    where: and(eq(products.farmId, farmId), eq(products.active, true)),
    with: { units: true },
    orderBy: [asc(products.name)],
  });
}

export async function getAllProductsWithUnits(farmId: string) {
  return db.query.products.findMany({
    where: eq(products.farmId, farmId),
    with: { units: true },
    orderBy: [asc(products.name)],
  });
}

// ─── Farm notes ───────────────────────────────────────────────────────────────

export async function getLatestFarmNote(farmId: string) {
  const [note] = await db
    .select()
    .from(farmNotes)
    .where(eq(farmNotes.farmId, farmId))
    .orderBy(desc(farmNotes.createdAt))
    .limit(1);
  return note ?? null;
}

export async function getFarmNotes(farmId: string) {
  return db.select().from(farmNotes).where(eq(farmNotes.farmId, farmId)).orderBy(desc(farmNotes.createdAt));
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getPendingOrderCount(farmId: string) {
  const [result] = await db
    .select({ count: sql<string>`count(*)` })
    .from(orders)
    .where(and(eq(orders.farmId, farmId), inArray(orders.status, ["pending", "confirmed"])));
  return parseInt(result?.count ?? "0");
}

export async function getOrdersWithDetails(farmId: string, statuses: OrderStatus[]) {
  if (statuses.length === 0) return [];

  const orderRows = await db
    .select({
      id: orders.id,
      farmId: orders.farmId,
      buyerId: orders.buyerId,
      status: orders.status,
      notes: orders.notes,
      createdAt: orders.createdAt,
      buyerEmail: users.email,
      buyerFirstname: buyerProfiles.firstname,
      buyerLastname: buyerProfiles.lastname,
      buyerOrg: buyerProfiles.organization,
    })
    .from(orders)
    .innerJoin(users, eq(orders.buyerId, users.id))
    .leftJoin(buyerProfiles, eq(users.id, buyerProfiles.userId))
    .where(and(eq(orders.farmId, farmId), inArray(orders.status, statuses)))
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((r) => r.id);
  const itemRows = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitAtOrder: orderItems.unitAtOrder,
      priceAtOrder: orderItems.priceAtOrder,
      ratioAtOrder: orderItems.ratioAtOrder,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(inArray(orderItems.orderId, orderIds));

  return orderRows.map((row) => ({
    id: row.id,
    farmId: row.farmId,
    buyerId: row.buyerId,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt,
    buyerName:
      [row.buyerFirstname, row.buyerLastname].filter(Boolean).join(" ") || row.buyerEmail,
    buyerOrg: row.buyerOrg ?? "",
    items: itemRows
      .filter((item) => item.orderId === row.id)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unitAtOrder,
        priceAtOrder: item.priceAtOrder,
        ratioAtOrder: item.ratioAtOrder,
        total: (parseFloat(item.quantity) * parseFloat(item.priceAtOrder)).toFixed(2),
      })),
  }));
}

// ─── Buyers ───────────────────────────────────────────────────────────────────

export async function getBuyersForFarm(farmId: string) {
  const orderStats = await db
    .select({
      buyerId: orders.buyerId,
      orderCount: sql<string>`count(*)`,
      lastOrderAt: sql<Date>`max(${orders.createdAt})`,
    })
    .from(orders)
    .where(eq(orders.farmId, farmId))
    .groupBy(orders.buyerId);

  if (orderStats.length === 0) return [];

  const buyerIds = orderStats.map((o) => o.buyerId);
  const buyerData = await db
    .select({
      id: users.id,
      email: users.email,
      firstname: buyerProfiles.firstname,
      lastname: buyerProfiles.lastname,
      organization: buyerProfiles.organization,
    })
    .from(users)
    .leftJoin(buyerProfiles, eq(users.id, buyerProfiles.userId))
    .where(inArray(users.id, buyerIds));

  return buyerData.map((b) => {
    const stats = orderStats.find((o) => o.buyerId === b.id)!;
    return {
      id: b.id,
      name: [b.firstname, b.lastname].filter(Boolean).join(" ") || b.email,
      org: b.organization ?? "",
      email: b.email,
      orderCount: parseInt(stats.orderCount),
      lastOrderAt: stats.lastOrderAt,
    };
  });
}

// ─── Buyer order history ──────────────────────────────────────────────────────

export async function getBuyerOrders(userId: string) {
  const orderRows = await db
    .select({
      id: orders.id,
      farmId: orders.farmId,
      farmName: farms.name,
      farmcode: farms.farmcode,
      status: orders.status,
      notes: orders.notes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(farms, eq(orders.farmId, farms.id))
    .where(eq(orders.buyerId, userId))
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((r) => r.id);
  const itemRows = await db
    .select({
      orderId: orderItems.orderId,
      productName: products.name,
      quantity: orderItems.quantity,
      unitAtOrder: orderItems.unitAtOrder,
      priceAtOrder: orderItems.priceAtOrder,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(inArray(orderItems.orderId, orderIds));

  return orderRows.map((row) => {
    const items = itemRows.filter((i) => i.orderId === row.id);
    const orderTotal = items
      .reduce((sum, i) => sum + parseFloat(i.quantity) * parseFloat(i.priceAtOrder), 0)
      .toFixed(2);
    return {
      id: row.id,
      farmName: row.farmName,
      farmcode: row.farmcode,
      status: row.status,
      createdAt: row.createdAt,
      notes: row.notes,
      items: items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unit: i.unitAtOrder,
        priceAtOrder: i.priceAtOrder,
        total: (parseFloat(i.quantity) * parseFloat(i.priceAtOrder)).toFixed(2),
      })),
      orderTotal,
    };
  });
}
