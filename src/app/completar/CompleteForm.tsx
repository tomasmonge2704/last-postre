"use client";

import { useState, useTransition } from "react";
import { completeProfile } from "@/app/actions";

const input = "w-full rounded-2xl bg-crema/10 px-4 py-3 text-crema outline-none placeholder:text-crema/30";

export function CompleteForm({ slot, gender: initialGender }: { slot: string; gender: "m" | "f" }) {
  const [form, setForm] = useState({ nickname: "", name: "", instagram: "", gender: initialGender });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await completeProfile(form);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Algo falló");
          }
        });
      }}
      className="mt-6 flex flex-col gap-4"
    >
      <p className="text-center font-semibold text-cafe/80">Entraste como “{slot}”. Así te encuentran los demás:</p>
      <div className="flex flex-col gap-3 rounded-3xl bg-chocolate p-4">
        <input autoFocus required value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="¿Cómo te dicen? (ej: Juli)" className={input} />
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre y apellido" className={input} />
        <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@instagram" autoCapitalize="off" autoCorrect="off" className={input} />
        <div className="grid grid-cols-2 gap-2">
          {(["f", "m"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm({ ...form, gender: g })}
              className={`rounded-2xl py-3 font-bold ${form.gender === g ? "bg-flan text-cafe" : "bg-crema/10 text-crema/60"}`}
            >
              {g === "f" ? "👩 Mujer" : "👨 Hombre"}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-center font-semibold">{error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema shadow-[0_4px_0_var(--color-cafe)] active:translate-y-1 active:shadow-none disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Listo, a jugar 🍮"}
      </button>
    </form>
  );
}
