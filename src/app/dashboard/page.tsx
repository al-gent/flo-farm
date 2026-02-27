import Link from "next/link";
import { auth } from "@/auth";
import { getFarmByUserId, getPendingOrderCount } from "@/db/queries";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const farm = await getFarmByUserId(session!.user.id);
  const pendingCount = farm ? await getPendingOrderCount(farm.id) : 0;

  const tiles = [
    { label: "New Orders", href: "/dashboard/orders", count: pendingCount, highlight: pendingCount > 0 },
    { label: "Edit Produce", href: "/dashboard/products", count: null, highlight: false },
    { label: "Completed Orders", href: "/dashboard/completed", count: null, highlight: false },
    { label: "Today's Harvest", href: "/dashboard/harvest", count: null, highlight: false },
    { label: "Farm Notes", href: "/dashboard/notes", count: null, highlight: false },
    { label: "Update Buyers", href: "/dashboard/buyers", count: null, highlight: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{farm?.name ?? "Your Farm"}</h1>
            <p className="text-gray-500 mt-1">Farmer Dashboard</p>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="text-gray-500">
              Sign out
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex flex-col items-center justify-center min-h-36 rounded-2xl font-bold text-lg text-white shadow-sm transition-colors active:scale-95 bg-green-600 hover:bg-green-700"
            >
              <span className="text-center px-4 leading-tight">{tile.label}</span>
              {tile.count !== null && (
                <span className="text-4xl font-extrabold mt-2">{tile.count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
