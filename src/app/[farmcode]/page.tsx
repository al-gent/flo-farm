import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getFarmByFarmcode, getActiveProductsWithUnits, getLatestFarmNote } from "@/db/queries";
import { StorefrontClient } from "@/components/storefront/StorefrontClient";

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ farmcode: string }>;
}) {
  const { farmcode } = await params;

  const [farm, session] = await Promise.all([getFarmByFarmcode(farmcode), auth()]);
  if (!farm) notFound();

  const [products, note] = await Promise.all([
    getActiveProductsWithUnits(farm.id),
    getLatestFarmNote(farm.id),
  ]);

  const prefill =
    session?.user.role === "buyer"
      ? { name: "", organization: "", email: session.user.email ?? "" }
      : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{farm.name}</h1>
        {farm.location && (
          <p className="text-gray-500 text-sm mb-6">{farm.location}</p>
        )}

        {note && (
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-500 italic mb-1">Farmer&apos;s Note:</p>
            <p className="text-gray-700">{note.note}</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Order Form</h2>

        <StorefrontClient farmId={farm.id} products={products} prefill={prefill} />
      </div>
    </div>
  );
}
