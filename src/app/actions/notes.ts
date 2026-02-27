"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { farmNotes } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getFarmByUserId } from "@/db/queries";

export async function createFarmNoteAction(note: string): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "farmer") return "Unauthorized";

  const farm = await getFarmByUserId(session.user.id);
  if (!farm) return "Farm not found";

  if (!note.trim()) return "Note cannot be empty";

  await db.insert(farmNotes).values({ farmId: farm.id, note: note.trim() });

  revalidatePath("/dashboard/notes");
  revalidatePath(`/${farm.farmcode}`);
  return null;
}
