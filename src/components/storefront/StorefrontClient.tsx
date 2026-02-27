"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitOrderAction } from "@/app/actions/storefront";

type ProductUnit = {
  id: string;
  productId: string;
  unit: string;
  price: string;
  ratio: string;
};

type Product = {
  id: string;
  farmId: string;
  name: string;
  description: string | null;
  quantity: string;
  primaryUnitId: string | null;
  active: boolean;
  createdAt: Date;
  units: ProductUnit[];
};

type CartItem = {
  productId: string;
  unitId: string;
  productName: string;
  unit: string;
  price: string;
  ratio: string;
  quantity: number;
};

type BuyerPrefill = {
  name: string;
  organization: string;
  email: string;
} | null;

export function StorefrontClient({
  farmId,
  products,
  prefill,
}: {
  farmId: string;
  products: Product[];
  prefill: BuyerPrefill;
}) {
  const [selectedUnitIds, setSelectedUnitIds] = useState<Record<string, string>>(
    () => Object.fromEntries(products.map((p) => [p.id, p.units[0]?.id ?? ""]))
  );
  const [quantities, setQuantities] = useState<Record<string, string>>(
    () => Object.fromEntries(products.map((p) => [p.id, "0"]))
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getSelectedUnit(product: Product): ProductUnit {
    return (
      product.units.find((u) => u.id === selectedUnitIds[product.id]) ??
      product.units[0]
    );
  }

  function addToCart(product: Product) {
    const qty = parseFloat(quantities[product.id] ?? "0");
    if (!qty || qty <= 0) return;
    const unit = getSelectedUnit(product);

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.unitId === unit.id
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.unitId === unit.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          unitId: unit.id,
          productName: product.name,
          unit: unit.unit,
          price: unit.price,
          ratio: unit.ratio,
          quantity: qty,
        },
      ];
    });

    setQuantities((prev) => ({ ...prev, [product.id]: "0" }));
  }

  function removeFromCart(productId: string, unitId: string) {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.unitId === unitId))
    );
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cart.length === 0) return;
    const fd = new FormData(e.currentTarget);
    const checkout = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      organization: (fd.get("organization") as string) || "",
      notes: (fd.get("notes") as string) || "",
    };
    setError(null);
    setSubmitting(true);
    const result = await submitOrderAction(farmId, cart, checkout);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order received!</h2>
        <p className="text-gray-500">The farmer will confirm your order soon.</p>
        <Button
          className="mt-6 bg-green-600 hover:bg-green-700"
          onClick={() => {
            setCart([]);
            setSubmitted(false);
          }}
        >
          Place another order
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Product table */}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="font-semibold pb-3 pr-4">Name</th>
              <th className="font-semibold pb-3 pr-4 text-right whitespace-nowrap">Qty Available</th>
              <th className="font-semibold pb-3 pr-4">Unit</th>
              <th className="font-semibold pb-3 pr-4 text-right">Price</th>
              <th className="font-semibold pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const selectedUnit = getSelectedUnit(product);
              const primaryUnit =
                product.units.find((u) => u.id === product.primaryUnitId) ??
                product.units[0];

              return (
                <tr key={product.id}>
                  <td className="py-3 pr-4 font-medium text-gray-900 align-middle">
                    {product.name}
                    {product.description && (
                      <p className="text-xs text-gray-400 font-normal mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right align-middle text-gray-600 whitespace-nowrap">
                    {parseFloat(product.quantity).toFixed(0)} {primaryUnit?.unit}
                  </td>
                  <td className="py-3 pr-4 align-middle">
                    {product.units.length > 1 ? (
                      <Select
                        value={selectedUnitIds[product.id]}
                        onValueChange={(v) =>
                          setSelectedUnitIds((prev) => ({ ...prev, [product.id]: v }))
                        }
                      >
                        <SelectTrigger className="h-10 w-36 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {product.units.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">{product.units[0]?.unit}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right align-middle text-gray-700 whitespace-nowrap">
                    ${parseFloat(selectedUnit.price).toFixed(2)}/{selectedUnit.unit}
                  </td>
                  <td className="py-3 align-middle">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[product.id] ?? "0"}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        className="h-10 w-16 text-center text-base"
                      />
                      <Button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="h-10 px-3 bg-gray-800 hover:bg-gray-900 text-sm"
                      >
                        Add
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-4">CART</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="font-semibold pb-2 pr-4">Name</th>
                <th className="font-semibold pb-2 pr-4 text-right">Qty</th>
                <th className="font-semibold pb-2 pr-4 text-right">Price</th>
                <th className="font-semibold pb-2 pr-4 text-right">Total</th>
                <th className="font-semibold pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cart.map((item) => (
                <tr key={`${item.productId}-${item.unitId}`}>
                  <td className="py-2.5 pr-4 font-medium text-gray-900">{item.productName}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-600 whitespace-nowrap">
                    {item.quantity % 1 === 0 ? item.quantity.toFixed(0) : item.quantity}{" "}
                    {item.unit}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-gray-600">
                    ${parseFloat(item.price).toFixed(2)}/{item.unit}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.productId, item.unitId)}
                      className="h-8 text-xs"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator className="my-4" />

          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-900 text-lg">Checkout total:</span>
            <span className="font-bold text-gray-900 text-lg">${cartTotal.toFixed(2)}</span>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
          )}

          {/* Checkout form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-name">Name</Label>
                <Input
                  id="checkout-name"
                  name="name"
                  required
                  defaultValue={prefill?.name ?? ""}
                  className="h-11"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-org">
                  Organization{" "}
                  <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </Label>
                <Input
                  id="checkout-org"
                  name="organization"
                  defaultValue={prefill?.organization ?? ""}
                  className="h-11"
                  placeholder="Restaurant, co-op…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="checkout-email">Email</Label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                required
                defaultValue={prefill?.email ?? ""}
                className="h-11"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="checkout-notes">Notes</Label>
              <Textarea
                id="checkout-notes"
                name="notes"
                rows={3}
                className="resize-none"
                placeholder="Anything the farmer should know about your order…"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base bg-green-600 hover:bg-green-700 mt-2"
            >
              {submitting ? "Submitting…" : "Submit Order"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
