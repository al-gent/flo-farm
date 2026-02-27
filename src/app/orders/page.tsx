import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerOrders } from "@/db/queries";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  edited: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  edited: "Updated",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BuyerOrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "buyer") redirect("/dashboard");

  const buyerOrders = await getBuyerOrders(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="text-gray-500">
              Sign out
            </Button>
          </form>
        </div>

        {buyerOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {buyerOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/${order.farmcode}`}
                      className="font-semibold text-gray-900 hover:text-green-700"
                    >
                      {order.farmName}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <Separator />

                <div className="px-5 py-3 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.productName} · {item.quantity} {item.unit}
                      </span>
                      <span className="text-gray-600 font-medium">
                        ${parseFloat(item.total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="px-5 py-3 flex justify-between items-center">
                  {order.notes ? (
                    <p className="text-xs text-gray-400 italic truncate pr-4">
                      &ldquo;{order.notes}&rdquo;
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="font-bold text-gray-900 shrink-0">
                    ${parseFloat(order.orderTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
