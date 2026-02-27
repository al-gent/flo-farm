"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  createProductAction,
  deactivateProductAction,
  reactivateProductAction,
} from "@/app/actions/products";

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

type UnitRow = {
  id: string;
  unit: string;
  price: string;
  ratio: string;
  isPrimary: boolean;
};

function newUnitRow(): UnitRow {
  return { id: crypto.randomUUID(), unit: "", price: "", ratio: "1", isPrimary: false };
}

function ProductForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [units, setUnits] = useState<UnitRow[]>([
    { ...newUnitRow(), isPrimary: true },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addUnit() {
    setUnits((prev) => [...prev, newUnitRow()]);
  }

  function removeUnit(id: string) {
    setUnits((prev) => {
      const next = prev.filter((u) => u.id !== id);
      if (prev.find((u) => u.id === id)?.isPrimary && next.length > 0) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }

  function setPrimary(id: string) {
    setUnits((prev) => prev.map((u) => ({ ...u, isPrimary: u.id === id })));
  }

  function updateUnit(id: string, field: keyof UnitRow, value: string) {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const description = (fd.get("description") as string)?.trim() || null;
    const quantity = fd.get("quantity") as string;

    setError(null);
    startTransition(async () => {
      const result = await createProductAction({ name, description, quantity, units });
      if (result) {
        setError(result);
      } else {
        router.refresh();
        onCancel();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">New Product</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pname">Product name</Label>
          <Input id="pname" name="name" required className="h-11" placeholder="e.g. Celeriac, without tops" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdesc">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Textarea id="pdesc" name="description" rows={2} className="resize-none" placeholder="Brief description for buyers" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pqty">Quantity available (in primary unit)</Label>
          <Input id="pqty" name="quantity" type="number" min="0" step="0.01" required className="h-11" placeholder="0" />
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Units &amp; Prices</h3>
            <Button type="button" variant="outline" size="sm" onClick={addUnit}>
              + Add unit
            </Button>
          </div>

          <div className="space-y-3">
            {units.map((unit, i) => (
              <div key={unit.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  {i === 0 && <Label className="text-xs text-gray-500">Unit name</Label>}
                  <Input
                    value={unit.unit}
                    onChange={(e) => updateUnit(unit.id, "unit", e.target.value)}
                    required
                    className="h-10"
                    placeholder="lbs, bunch, bag…"
                  />
                </div>
                <div className="w-24 space-y-1">
                  {i === 0 && <Label className="text-xs text-gray-500">Price ($)</Label>}
                  <Input
                    value={unit.price}
                    onChange={(e) => updateUnit(unit.id, "price", e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>
                <div className="w-20 space-y-1">
                  {i === 0 && <Label className="text-xs text-gray-500">Ratio</Label>}
                  <Input
                    value={unit.ratio}
                    onChange={(e) => updateUnit(unit.id, "ratio", e.target.value)}
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    required
                    className="h-10"
                    placeholder="1"
                    title="Primary units per 1 of this unit (e.g. '5 lb bag' → ratio 5)"
                  />
                </div>
                <div className="flex items-center gap-1.5 pb-1">
                  {i === 0 && <div className="h-4" />}
                  <button
                    type="button"
                    onClick={() => setPrimary(unit.id)}
                    title="Set as primary unit"
                    className={`w-7 h-7 rounded-full border-2 transition-colors flex items-center justify-center text-xs ${
                      unit.isPrimary
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 text-gray-400 hover:border-green-400"
                    }`}
                  >
                    ★
                  </button>
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnit(unit.id)}
                      className="w-7 h-7 rounded-full border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">★ marks the primary unit. Ratio = how many primary units equal 1 of this unit (e.g. &quot;5 lb bag&quot; → ratio 5).</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 h-11 px-6"
        >
          {isPending ? "Saving…" : "Save product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-11">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProductManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  function deactivate(id: string) {
    startTransition(async () => {
      await deactivateProductAction(id);
      router.refresh();
    });
  }

  function reactivate(id: string) {
    startTransition(async () => {
      await reactivateProductAction(id);
      router.refresh();
    });
  }

  const active = products.filter((p) => p.active);
  const inactive = products.filter((p) => !p.active);

  return (
    <div>
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full h-12 text-base bg-green-600 hover:bg-green-700 mb-6"
        >
          + Add New Product
        </Button>
      )}

      {showForm && <ProductForm onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {active.map((product) => {
          const primaryUnit = product.units.find((u) => u.id === product.primaryUnitId) ?? product.units[0];
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{product.description}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {parseFloat(product.quantity).toFixed(0)} {primaryUnit?.unit ?? ""} available
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {product.units.map((u) => (
                      <span key={u.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        ${parseFloat(u.price).toFixed(2)}/{u.unit}
                        {u.id === product.primaryUnitId && " ★"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-9">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    className="h-9 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => deactivate(product.id)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {inactive.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500 mb-3">Inactive products</p>
          <div className="space-y-2">
            {inactive.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-3 flex items-center justify-between">
                <span className="text-gray-400 line-through">{product.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  className="h-8 text-xs"
                  onClick={() => reactivate(product.id)}
                >
                  Reactivate
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
