import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  integer,
  numeric,
  text,
  timestamp,
  index,
  type AnyPgColumn 
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["farmer", "buyer"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "edited",
  "completed",
  "cancelled",
]);

// ─── Users & Auth ─────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farms = pgTable("farms", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  farmcode: varchar("farmcode", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  // Array of image URLs for the farm's about page
  imageUrls: text("image_urls").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // quantity is in terms of the primary unit
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("0"),
  // set after product_units rows are created
  primaryUnitId: uuid("primary_unit_id").references((): AnyPgColumn => productUnits.id),
    active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productUnits = pgTable("product_units", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  unit: varchar("unit", { length: 50 }).notNull(),
  // numeric columns are returned as strings from Neon — parse with parseFloat() where needed
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  // ratio relative to primary unit e.g. if primary is lbs, 1 pint = 0.75 lbs so ratio = 0.75
  // primary unit itself has ratio = 1
  ratio: numeric("ratio", { precision: 10, scale: 4 }).notNull().default("1"),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productUnitId: uuid("product_unit_id")
    .notNull()
    .references(() => productUnits.id),
  // quantity in the unit the buyer selected
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  // Snapshot values captured at order time — source of truth for invoices/pricing
  priceAtOrder: numeric("price_at_order", { precision: 10, scale: 2 }).notNull(),
  unitAtOrder: varchar("unit_at_order", { length: 50 }).notNull(),
  // ratio snapshot so inventory impact can always be calculated: quantity * ratioAtOrder = primary units consumed
  ratioAtOrder: numeric("ratio_at_order", { precision: 10, scale: 4 }).notNull(),
});

// ─── Supporting ───────────────────────────────────────────────────────────────

export const buyerProfiles = pgTable("buyer_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  firstname: varchar("firstname", { length: 100 }),
  lastname: varchar("lastname", { length: 100 }),
  organization: varchar("organization", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Join table between farms and buyers — stores farm-specific buyer data
export const farmBuyers = pgTable("farm_buyers", {
  id: uuid("id").defaultRandom().primaryKey(),
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id),
  // calculated from buyer's zip and farm location, cached here
  distanceFromFarm: numeric("distance_from_farm", { precision: 10, scale: 2 }),
  // farmer's private notes on this buyer
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farmNotes = pgTable("farm_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // query latest with ORDER BY created_at DESC LIMIT 1 for storefront display
});

// ─── Derived TypeScript types ─────────────────────────────────────────────────

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type UserRole = (typeof userRoleEnum.enumValues)[number];