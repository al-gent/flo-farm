"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createFarmNoteAction } from "@/app/actions/notes";

type Note = { id: string; note: string; createdAt: Date };

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function NotesManager({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const noteText = draft.trim();
    setDraft("");
    startTransition(async () => {
      await createFarmNoteAction(noteText);
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">New note for buyers</h2>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="resize-none text-base"
          placeholder="Let buyers know what's in season, pickup times, anything they should know…"
        />
        <Button
          type="submit"
          disabled={!draft.trim() || isPending}
          className="mt-3 h-11 bg-green-600 hover:bg-green-700 w-full"
        >
          {isPending ? "Saving…" : "Post note"}
        </Button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          The most recent note is shown on your storefront.
        </p>
      </form>

      {initialNotes.length > 0 && (
        <div className="space-y-3">
          {initialNotes.map((note, i) => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">{formatDate(note.createdAt)}</span>
                {i === 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Shown on storefront
                  </span>
                )}
              </div>
              {i > 0 && <Separator className="mb-3" />}
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
