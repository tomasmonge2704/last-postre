"use client";

import { useState, useTransition } from "react";
import type { PublicGuest } from "@/lib/guests";
import { GuestPicker } from "@/components/GuestPicker";
import { Avatar } from "@/components/Avatar";
import { enter } from "@/app/actions";

export function EntryForm() {
  const [candidate, setCandidate] = useState<PublicGuest | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <GuestPicker mode="single" onPick={setCandidate} />

      {candidate && (
        <div className="fixed inset-0 z-10 flex items-end bg-chocolate/60" onClick={() => setCandidate(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-sheet-up w-full rounded-t-[2rem] bg-chocolate px-6 text-crema pt-8 pb-10 text-center"
          >
            <div className="mx-auto w-fit">
              <Avatar guest={candidate} size={96} />
            </div>
            <p className="mt-4 text-2xl font-bold">¿Seguro que sos vos, {candidate.nickname}? 👀</p>
            {candidate.instagram && <p className="mt-1 text-crema/60">@{candidate.instagram}</p>}
            <button
              disabled={pending}
              onClick={() => startTransition(() => enter(candidate.id))}
              className="mt-6 w-full rounded-full bg-flan py-4 text-lg font-bold text-cafe shadow-[0_4px_0_var(--color-dulce)] active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {pending ? "Entrando…" : "Sí, soy yo 🍮"}
            </button>
            <button onClick={() => setCandidate(null)} className="mt-3 py-2 text-crema/60">
              No, me equivoqué
            </button>
          </div>
        </div>
      )}
    </>
  );
}
