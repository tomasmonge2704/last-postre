"use client";

import { useState, useTransition } from "react";
import { IgSearch, type IgResult } from "@/components/IgSearch";
import { claimInstagram, searchMyInstagram, skipInstagram } from "@/app/actions";
import { CompleteForm } from "./CompleteForm";

export function ConnectInstagram({ slot, initial, gender }: { slot: string | null; initial: string; gender: "m" | "f" }) {
  const [picked, setPicked] = useState<IgResult | null>(null);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (manual && slot) return <CompleteForm slot={slot} gender={gender} />;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="text-center font-semibold text-cafe/80">
        {slot ? `Entraste como “${slot}”. ` : ""}Buscate y tocá tu perfil: así todos te ven con tu foto. 📸
      </p>
      <IgSearch initial={initial} title="Tu Instagram" search={searchMyInstagram} pending={pending} onPick={setPicked} />
      <button
        onClick={() => (slot ? setManual(true) : startTransition(() => skipInstagram()))}
        className="py-2 font-semibold text-cafe/70 underline"
      >
        {slot ? "No tengo IG / no me encuentro" : "Ahora no"}
      </button>

      {picked && (
        <div className="fixed inset-0 z-10 flex items-end bg-chocolate/60" onClick={() => !pending && setPicked(null)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-sheet-up w-full rounded-t-[2rem] bg-chocolate px-6 pt-8 pb-10 text-center text-crema">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/ig-pic?url=${encodeURIComponent(picked.pic)}`} alt="" className="mx-auto size-24 rounded-full border-4 border-flan object-cover" />
            <p className="mt-4 text-2xl font-bold">¿Sos vos? 👀</p>
            <p className="mt-1 text-crema/70">
              @{picked.username}
              {picked.fullName && ` · ${picked.fullName}`}
            </p>
            {error && <p className="mt-3 font-semibold text-frutilla">{error}</p>}
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  try {
                    await claimInstagram(picked);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Algo falló");
                  }
                })
              }
              className="mt-6 w-full rounded-full bg-flan py-4 text-lg font-bold text-cafe shadow-[0_4px_0_var(--color-dulce)] active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Sí, soy yo 🍮"}
            </button>
            <button disabled={pending} onClick={() => { setPicked(null); setError(null); }} className="mt-3 py-2 text-crema/60">
              No, sigo buscando
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
