"use client";

import { useActionState, useState } from "react";
import { signupAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Role = "farmer" | "buyer";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("buyer");
  const [farmcode, setFarmcode] = useState("");
  const [result, formAction, isPending] = useActionState(signupAction, null);

  if (result === "signup_pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Almost there!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Account creation will be fully available once database wiring is complete.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full h-12">Back to sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Who are you on flo-farm?</p>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {(["buyer", "farmer"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`h-12 rounded-xl font-semibold text-sm transition-colors ${
                role === r
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "farmer" ? "🌾 Farmer" : "🛒 Buyer"}
            </button>
          ))}
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value={role} />

          {/* Common fields */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="h-12 text-base" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="h-12 text-base" placeholder="Minimum 8 characters" minLength={8} />
          </div>

          {/* Farmer fields */}
          {role === "farmer" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="farmName">Farm name</Label>
                <Input id="farmName" name="farmName" required className="h-12 text-base" placeholder="Green Valley Farm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="farmcode">
                  Farm URL slug
                </Label>
                <Input
                  id="farmcode"
                  name="farmcode"
                  required
                  className="h-12 text-base"
                  placeholder="greenvalley"
                  value={farmcode}
                  onChange={(e) =>
                    setFarmcode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                />
                {farmcode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your storefront:{" "}
                    <span className="font-mono text-green-700">
                      flo.farm/{farmcode}
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="h-12 text-base" placeholder="555-867-5309" />
              </div>
            </>
          )}

          {/* Buyer fields */}
          {role === "buyer" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstname">First name</Label>
                  <Input id="firstname" name="firstname" required className="h-12 text-base" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastname">Last name</Label>
                  <Input id="lastname" name="lastname" required className="h-12 text-base" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="organization">
                  Organization{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input id="organization" name="organization" className="h-12 text-base" placeholder="Restaurant, co-op, etc." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="h-12 text-base" placeholder="555-867-5309" />
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 text-base bg-green-600 hover:bg-green-700 mt-2"
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
