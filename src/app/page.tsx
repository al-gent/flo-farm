import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role === "farmer") redirect("/dashboard");
  if (session.user.role === "buyer") redirect("/orders");

  redirect("/login");
}
