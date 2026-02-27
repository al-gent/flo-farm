import Link from "next/link";
import { auth } from "@/auth";
import { getFarmByUserId, getBuyersForFarm } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BuyersPage() {
  const session = await auth();
  const farm = await getFarmByUserId(session!.user.id);
  const buyers = farm ? await getBuyersForFarm(farm.id) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-green-600 text-sm font-medium inline-block mb-4">
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Buyers</h1>
            <p className="text-gray-500 text-sm mt-1">
              Notify all buyers that your produce list has been updated.
            </p>
          </div>
        </div>

        {/* Send email CTA */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="text-sm text-green-800 mb-3">
            Send an email to all <strong>{buyers.length} buyers</strong> from{" "}
            {farm?.name ?? "your farm"} letting them know your produce list is updated and ready
            to order.
          </p>
          <form
            action={async () => {
              "use server";
              // TODO: send email notifications via Resend/SendGrid
            }}
          >
            <Button
              type="submit"
              className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
            >
              Send Update Email to All Buyers
            </Button>
          </form>
        </div>

        {/* Buyer list */}
        {buyers.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No buyers yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {buyers.map((buyer, i) => (
              <div key={buyer.id}>
                {i > 0 && <Separator />}
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{buyer.name}</p>
                    {buyer.org && (
                      <p className="text-sm text-gray-500 truncate">{buyer.org}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-0.5">{buyer.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-700">
                      {buyer.orderCount} order{buyer.orderCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last: {formatDate(buyer.lastOrderAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
