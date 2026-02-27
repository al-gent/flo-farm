/**
 * Creates two test users (farmer + buyer) with known credentials.
 * Run via: npm run db:seed
 * (uses node --env-file=.env.local so DATABASE_URL is set before any module loads)
 */
import bcrypt from "bcryptjs";
import { db } from "../src/db";
import { users, farms, buyerProfiles } from "../src/db/schema";

const FARMER = { email: "farmer@test.com", password: "password123" };
const BUYER  = { email: "buyer@test.com",  password: "password123" };

async function main() {
  console.log("Seeding test users…");

  const farmerHash = await bcrypt.hash(FARMER.password, 10);
  const buyerHash  = await bcrypt.hash(BUYER.password,  10);

  const [farmer] = await db
    .insert(users)
    .values({ email: FARMER.email, password: farmerHash, role: "farmer" })
    .onConflictDoUpdate({ target: users.email, set: { password: farmerHash } })
    .returning();

  await db
    .insert(farms)
    .values({ userId: farmer.id, farmcode: "greenvalley", name: "Green Valley Farm", phone: "555-867-5309" })
    .onConflictDoUpdate({ target: farms.farmcode, set: { name: "Green Valley Farm" } });

  const [buyer] = await db
    .insert(users)
    .values({ email: BUYER.email, password: buyerHash, role: "buyer" })
    .onConflictDoUpdate({ target: users.email, set: { password: buyerHash } })
    .returning();

  await db
    .insert(buyerProfiles)
    .values({ userId: buyer.id, firstname: "Test", lastname: "Buyer", organization: "Westside Co-op" })
    .onConflictDoUpdate({ target: buyerProfiles.userId, set: { firstname: "Test" } });

  console.log("\nDone! Test credentials:");
  console.log(`  Farmer → ${FARMER.email} / ${FARMER.password}  → /dashboard`);
  console.log(`  Buyer  → ${BUYER.email}  / ${BUYER.password}  → /orders`);
}

main().catch((e) => { console.error(e); process.exit(1); });
