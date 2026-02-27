import { relations } from "drizzle-orm";
import {
  users,
  farms,
  products,
  productUnits,
  orders,
  orderItems,
  buyerProfiles,
  farmNotes,
  farmBuyers,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  farm: one(farms, { fields: [users.id], references: [farms.userId] }),
  buyerProfile: one(buyerProfiles, { fields: [users.id], references: [buyerProfiles.userId] }),
  ordersAsBuyer: many(orders),
  farmBuyers: many(farmBuyers),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  user: one(users, { fields: [farms.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
  notes: many(farmNotes),
  farmBuyers: many(farmBuyers),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  farm: one(farms, { fields: [products.farmId], references: [farms.id] }),
  // Named relation disambiguates from the primaryUnit relation (both point to productUnits)
  units: many(productUnits, { relationName: "productUnits" }),
  primaryUnit: one(productUnits, {
    fields: [products.primaryUnitId],
    references: [productUnits.id],
    relationName: "primaryUnit",
  }),
  orderItems: many(orderItems),
}));

export const productUnitsRelations = relations(productUnits, ({ one }) => ({
  product: one(products, {
    fields: [productUnits.productId],
    references: [products.id],
    relationName: "productUnits",
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  farm: one(farms, { fields: [orders.farmId], references: [farms.id] }),
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  productUnit: one(productUnits, {
    fields: [orderItems.productUnitId],
    references: [productUnits.id],
  }),
}));

export const buyerProfilesRelations = relations(buyerProfiles, ({ one }) => ({
  user: one(users, { fields: [buyerProfiles.userId], references: [users.id] }),
}));

export const farmNotesRelations = relations(farmNotes, ({ one }) => ({
  farm: one(farms, { fields: [farmNotes.farmId], references: [farms.id] }),
}));

export const farmBuyersRelations = relations(farmBuyers, ({ one }) => ({
  farm: one(farms, { fields: [farmBuyers.farmId], references: [farms.id] }),
  buyer: one(users, { fields: [farmBuyers.buyerId], references: [users.id] }),
}));
