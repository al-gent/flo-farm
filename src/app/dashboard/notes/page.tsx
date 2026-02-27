import Link from "next/link";
import { auth } from "@/auth";
import { getFarmByUserId, getFarmNotes } from "@/db/queries";
import { NotesManager } from "@/components/dashboard/NotesManager";

export default async function NotesPage() {
  const session = await auth();
  const farm = await getFarmByUserId(session!.user.id);
  const notes = farm ? await getFarmNotes(farm.id) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-green-600 text-sm font-medium inline-block mb-4">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Farm Notes</h1>
        <NotesManager initialNotes={notes} />
      </div>
    </div>
  );
}
