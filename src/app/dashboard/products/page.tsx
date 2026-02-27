import Link from "next/link";
import { auth } from "@/auth";
import { getFarmByUserId, getAllProductsWithUnits } from "@/db/queries";
import { ProductManager } from "@/components/dashboard/ProductManager";

export default async function ProductsPage() {
  const session = await auth();
  const farm = await getFarmByUserId(session!.user.id);
  const products = farm ? await getAllProductsWithUnits(farm.id) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-green-600 text-sm font-medium inline-block mb-4">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Produce</h1>
        <ProductManager products={products} />
      </div>
    </div>
  );
}
