import Link from "next/link";
import { auth } from "@/auth";
import { getFarmByUserId, getOrdersWithDetails } from "@/db/queries";
import { Separator } from "@/components/ui/separator";

type HarvestEntry = {
  productId: string;
  productName: string;
  totalPrimaryQty: number;
  primaryUnit: string;
  breakdown: { unit: string; qty: number }[];
};

type HarvestOrder = Awaited<ReturnType<typeof getOrdersWithDetails>>[number];

function buildHarvest(activeOrders: HarvestOrder[]): HarvestEntry[] {
  const map = new Map<string, HarvestEntry>();

  for (const order of activeOrders) {
    for (const item of order.items) {
      const qty = parseFloat(item.quantity);
      const ratio = parseFloat(item.ratioAtOrder);
      const primaryQty = qty * ratio;

      const existing = map.get(item.productId);
      if (!existing) {
        map.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalPrimaryQty: primaryQty,
          primaryUnit: ratio === 1 ? item.unit : "lbs",
          breakdown: [{ unit: item.unit, qty }],
        });
      } else {
        existing.totalPrimaryQty += primaryQty;
        const bEntry = existing.breakdown.find((b) => b.unit === item.unit);
        if (bEntry) {
          bEntry.qty += qty;
        } else {
          existing.breakdown.push({ unit: item.unit, qty });
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );
}

export default async function HarvestPage() {
  const session = await auth();
  const farm = await getFarmByUserId(session!.user.id);
  const activeOrders = farm
    ? await getOrdersWithDetails(farm.id, ["pending", "confirmed"])
    : [];
  const harvest = buildHarvest(activeOrders);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-green-600 text-sm font-medium inline-block mb-4">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Harvest</h1>
        <p className="text-gray-500 text-sm mt-1 mb-6">{today} · pending &amp; confirmed orders</p>

        {harvest.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No active orders.</p>
        ) : (
          <div className="space-y-3">
            {harvest.map((entry) => (
              <div key={entry.productId} className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-semibold text-gray-900 text-lg">{entry.productName}</h2>
                  <span className="text-2xl font-bold text-green-700">
                    {entry.totalPrimaryQty % 1 === 0
                      ? entry.totalPrimaryQty.toFixed(0)
                      : entry.totalPrimaryQty.toFixed(2)}{" "}
                    <span className="text-base font-medium">{entry.primaryUnit}</span>
                  </span>
                </div>
                {entry.breakdown.length > 1 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      {entry.breakdown.map((b) => (
                        <div key={b.unit} className="flex justify-between text-sm text-gray-600">
                          <span>{b.unit}</span>
                          <span>
                            {b.qty % 1 === 0 ? b.qty.toFixed(0) : b.qty.toFixed(2)} ×{" "}
                            {b.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
