// ---------------------------------------------------------------------------
// Mock data — mirrors the Drizzle schema shapes exactly.
// Numeric fields that come back as strings from Neon are strings here too.
// Replace with real DB queries in the next pass.
// ---------------------------------------------------------------------------

export const MOCK_FARM = {
  id: "farm-1",
  userId: "u1",
  farmcode: "greenvalley",
  name: "Green Valley Farm",
  phone: "555-867-5309",
  email: "adam@greenvalleyfarm.com",
  bio: "Family-run farm growing organic vegetables in Springfield since 1985.",
  location: "Springfield, IL",
  logoUrl: null as string | null,
  imageUrls: [] as string[],
  createdAt: new Date("2024-01-01"),
};

export const MOCK_FARM_NOTE = {
  id: "fn1",
  farmId: "farm-1",
  note: "Back in action with surplus celeriac and purple carrots! All produce is certified organic. Orders due by Friday noon for Saturday pickup.",
  createdAt: new Date("2024-03-15"),
};

export type MockProductUnit = {
  id: string;
  productId: string;
  unit: string;
  price: string; // numeric as string
  ratio: string; // numeric as string
};

export type MockProduct = {
  id: string;
  farmId: string;
  name: string;
  description: string | null;
  quantity: string; // numeric as string (in primary unit)
  primaryUnitId: string | null;
  active: boolean;
  createdAt: Date;
  units: MockProductUnit[];
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "p1",
    farmId: "farm-1",
    name: "Celeriac, without tops",
    description: "Earthy and nutty root vegetable, great roasted or in soups.",
    quantity: "145.00",
    primaryUnitId: "pu1",
    active: true,
    createdAt: new Date("2024-03-01"),
    units: [
      { id: "pu1", productId: "p1", unit: "lbs", price: "2.00", ratio: "1.0000" },
    ],
  },
  {
    id: "p2",
    farmId: "farm-1",
    name: "Onion, Red Cipollini",
    description: "Small, sweet flat onions. Great pickled or roasted whole.",
    quantity: "50.00",
    primaryUnitId: "pu3",
    active: true,
    createdAt: new Date("2024-03-01"),
    units: [
      { id: "pu3", productId: "p2", unit: "lbs", price: "3.50", ratio: "1.0000" },
      { id: "pu4", productId: "p2", unit: "5 lb bag", price: "16.00", ratio: "5.0000" },
    ],
  },
  {
    id: "p3",
    farmId: "farm-1",
    name: "Onion, Red Storage",
    description: "Classic red storage onions. Mild and versatile.",
    quantity: "60.00",
    primaryUnitId: "pu5",
    active: true,
    createdAt: new Date("2024-03-01"),
    units: [
      { id: "pu5", productId: "p3", unit: "lbs", price: "2.00", ratio: "1.0000" },
    ],
  },
  {
    id: "p4",
    farmId: "farm-1",
    name: "Purple Carrots",
    description: "Vibrant purple carrots with an orange core. Sweet and crunchy.",
    quantity: "80.00",
    primaryUnitId: "pu6",
    active: true,
    createdAt: new Date("2024-03-10"),
    units: [
      { id: "pu6", productId: "p4", unit: "lbs", price: "2.50", ratio: "1.0000" },
      { id: "pu7", productId: "p4", unit: "bunch (approx 1 lb)", price: "3.00", ratio: "1.0000" },
    ],
  },
];

export type MockOrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: string; // numeric as string
  unit: string;
  priceAtOrder: string; // numeric as string
  ratioAtOrder: string; // numeric as string
  total: string; // precomputed: quantity * priceAtOrder
};

export type OrderStatus = "pending" | "confirmed" | "edited" | "completed" | "cancelled";

export type MockOrder = {
  id: string;
  farmId: string;
  buyerId: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  buyerName: string;
  buyerOrg: string;
  items: MockOrderItem[];
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "o1",
    farmId: "farm-1",
    buyerId: "u2",
    status: "pending",
    notes: "Please pack carrots separately",
    createdAt: new Date("2024-03-14"),
    buyerName: "Sarah Chen",
    buyerOrg: "The Green Table Restaurant",
    items: [
      { id: "oi1", productId: "p1", productName: "Celeriac, without tops", quantity: "10.00", unit: "lbs", priceAtOrder: "2.00", ratioAtOrder: "1.0000", total: "20.00" },
      { id: "oi2", productId: "p4", productName: "Purple Carrots", quantity: "5.00", unit: "lbs", priceAtOrder: "2.50", ratioAtOrder: "1.0000", total: "12.50" },
    ],
  },
  {
    id: "o2",
    farmId: "farm-1",
    buyerId: "u3",
    status: "confirmed",
    notes: null,
    createdAt: new Date("2024-03-13"),
    buyerName: "Mike Torres",
    buyerOrg: "Westside Co-op",
    items: [
      { id: "oi3", productId: "p2", productName: "Onion, Red Cipollini", quantity: "2.00", unit: "5 lb bag", priceAtOrder: "16.00", ratioAtOrder: "5.0000", total: "32.00" },
      { id: "oi4", productId: "p3", productName: "Onion, Red Storage", quantity: "25.00", unit: "lbs", priceAtOrder: "2.00", ratioAtOrder: "1.0000", total: "50.00" },
    ],
  },
  {
    id: "o3",
    farmId: "farm-1",
    buyerId: "u4",
    status: "pending",
    notes: null,
    createdAt: new Date("2024-03-14"),
    buyerName: "Jordan Lee",
    buyerOrg: "",
    items: [
      { id: "oi5", productId: "p4", productName: "Purple Carrots", quantity: "3.00", unit: "bunch (approx 1 lb)", priceAtOrder: "3.00", ratioAtOrder: "1.0000", total: "9.00" },
    ],
  },
];

export const MOCK_COMPLETED_ORDERS: MockOrder[] = [
  {
    id: "o10",
    farmId: "farm-1",
    buyerId: "u2",
    status: "completed",
    notes: null,
    createdAt: new Date("2024-03-07"),
    buyerName: "Sarah Chen",
    buyerOrg: "The Green Table Restaurant",
    items: [
      { id: "oi10", productId: "p1", productName: "Celeriac, without tops", quantity: "20.00", unit: "lbs", priceAtOrder: "2.00", ratioAtOrder: "1.0000", total: "40.00" },
    ],
  },
  {
    id: "o11",
    farmId: "farm-1",
    buyerId: "u3",
    status: "cancelled",
    notes: "Cancelled by buyer",
    createdAt: new Date("2024-03-05"),
    buyerName: "Mike Torres",
    buyerOrg: "Westside Co-op",
    items: [
      { id: "oi11", productId: "p3", productName: "Onion, Red Storage", quantity: "30.00", unit: "lbs", priceAtOrder: "2.00", ratioAtOrder: "1.0000", total: "60.00" },
    ],
  },
];

export const MOCK_FARM_NOTES = [
  { id: "fn1", farmId: "farm-1", note: "Back in action with surplus celeriac and purple carrots! All produce is certified organic. Orders due by Friday noon for Saturday pickup.", createdAt: new Date("2024-03-15") },
  { id: "fn2", farmId: "farm-1", note: "We'll be at the Springfield Farmers Market this Saturday. Stop by!", createdAt: new Date("2024-03-08") },
  { id: "fn3", farmId: "farm-1", note: "Red cipollini onions back in stock after the winter break.", createdAt: new Date("2024-02-20") },
];

export const MOCK_BUYERS = [
  { id: "u2", name: "Sarah Chen", org: "The Green Table Restaurant", email: "sarah@greentable.com", orderCount: 3, lastOrderAt: new Date("2024-03-14") },
  { id: "u3", name: "Mike Torres", org: "Westside Co-op", email: "mike@westsidecoop.com", orderCount: 5, lastOrderAt: new Date("2024-03-13") },
  { id: "u4", name: "Jordan Lee", org: "", email: "jordan.lee@example.com", orderCount: 1, lastOrderAt: new Date("2024-03-14") },
];

// Buyer-side: order history across farms
export const MOCK_BUYER_ORDERS = [
  {
    id: "o1",
    farmName: "Green Valley Farm",
    farmcode: "greenvalley",
    status: "pending" as OrderStatus,
    createdAt: new Date("2024-03-14"),
    notes: "Please pack carrots separately",
    items: [
      { productName: "Celeriac, without tops", quantity: "10.00", unit: "lbs", priceAtOrder: "2.00", total: "20.00" },
      { productName: "Purple Carrots", quantity: "5.00", unit: "lbs", priceAtOrder: "2.50", total: "12.50" },
    ],
    orderTotal: "32.50",
  },
  {
    id: "o5",
    farmName: "Sunrise Organics",
    farmcode: "sunrise",
    status: "completed" as OrderStatus,
    createdAt: new Date("2024-03-07"),
    notes: null,
    items: [
      { productName: "Butternut Squash", quantity: "15.00", unit: "lbs", priceAtOrder: "1.50", total: "22.50" },
    ],
    orderTotal: "22.50",
  },
];
