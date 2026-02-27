import Link from "next/link";
import { auth } from "@/auth";
import { getFarmByUserId, getOrdersWithDetails } from "@/db/queries";
import { OrderList } from "@/components/dashboard/OrderList";

export default async function OrdersPage() {
  const session = await auth();
  const farm = await getFarmByUserId(session!.user.id);
  const activeOrders = farm
    ? await getOrdersWithDetails(farm.id, ["pending", "confirmed", "edited"])
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-green-600 text-sm font-medium inline-block mb-4">
          ← Dashboard
        </Link>
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Orders</h1>
          <span className="text-gray-500 text-sm">
            {activeOrders.length} order{activeOrders.length !== 1 ? "s" : ""}
          </span>
        </div>
        <OrderList orders={activeOrders} />
      </div>
    </div>
  );
}
