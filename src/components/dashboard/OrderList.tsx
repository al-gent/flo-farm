"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderStatus } from "@/db/schema";
import { updateOrderStatusAction } from "@/app/actions/orders";

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: string;
  unit: string;
  priceAtOrder: string;
  ratioAtOrder: string;
  total: string;
};

type Order = {
  id: string;
  farmId: string;
  buyerId: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  buyerName: string;
  buyerOrg: string;
  items: OrderItem[];
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  edited: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  edited: "Edited",
  completed: "Completed",
  cancelled: "Cancelled",
};

type Action = {
  label: string;
  status: OrderStatus;
  variant?: "default" | "outline" | "destructive";
};

const ORDER_ACTIONS: Partial<Record<OrderStatus, Action[]>> = {
  pending: [
    { label: "Confirm", status: "confirmed" },
    { label: "Cancel", status: "cancelled", variant: "destructive" },
  ],
  confirmed: [
    { label: "Mark Edited", status: "edited" },
    { label: "Complete", status: "completed" },
    { label: "Cancel", status: "cancelled", variant: "destructive" },
  ],
  edited: [
    { label: "Complete", status: "completed" },
    { label: "Cancel", status: "cancelled", variant: "destructive" },
  ],
};

function orderTotal(order: Order) {
  return order.items
    .reduce((sum, item) => sum + parseFloat(item.total), 0)
    .toFixed(2);
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function OrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateStatus(id: string, status: OrderStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status })); // optimistic
    startTransition(async () => {
      await updateOrderStatusAction(id, status);
      router.refresh();
    });
  }

  if (orders.length === 0) {
    return <p className="text-gray-500 text-center py-12">No orders here.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const status = statuses[order.id] ?? order.status;
        const isExpanded = expanded.has(order.id);
        const actions = ORDER_ACTIONS[status] ?? [];

        return (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(order.id)}
              className="w-full text-left px-5 py-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{order.buyerName}</span>
                  {order.buyerOrg && (
                    <span className="text-gray-500 text-sm truncate">{order.buyerOrg}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ${orderTotal(order)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-gray-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5">
                <Separator className="mb-4" />

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left">
                      <th className="font-medium pb-2">Product</th>
                      <th className="font-medium pb-2 text-right">Qty</th>
                      <th className="font-medium pb-2 text-right">Price</th>
                      <th className="font-medium pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 pr-4">{item.productName}</td>
                        <td className="py-2 text-right whitespace-nowrap">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 text-right">${parseFloat(item.priceAtOrder).toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">${parseFloat(item.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="pt-3 font-semibold text-gray-700">Order total</td>
                      <td className="pt-3 text-right font-bold text-gray-900">${orderTotal(order)}</td>
                    </tr>
                  </tfoot>
                </table>

                {order.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-4">
                    <span className="font-medium">Note:</span> {order.notes}
                  </p>
                )}

                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {actions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant ?? "default"}
                        size="sm"
                        disabled={isPending}
                        onClick={() => updateStatus(order.id, action.status)}
                        className={
                          action.variant === "destructive"
                            ? ""
                            : action.status === "completed"
                            ? "bg-green-600 hover:bg-green-700"
                            : action.status === "confirmed"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-purple-600 hover:bg-purple-700"
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
