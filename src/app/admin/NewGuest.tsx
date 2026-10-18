"use client";

import { useState, useTransition } from "react";
import { createGuest } from "./actions";

export function NewGuest() {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"m" | "f">("f");
  const [placeholder, setPlaceholder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-chocolate py-3 font-bold text-crema shadow-[0_4px_0_var(--color-cafe)] active:translate-y-1 active:shadow-none"
      >
        ➕ Agregar invitado
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await createGuest({ nickname, gender, placeholder });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Algo falló");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-3xl bg-chocolate p-4 text-crema"
    >
      <p className="font-bold">➕ Nuevo invitado</p>
      <input
        autoFocus
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder={placeholder ? "Ej: Amiga de Solga" : "Apodo (ej: Juli)"}
        className="rounded-2xl bg-crema/10 px-4 py-2.5 outline-none placeholder:text-crema/30"
      />
      <div className="grid grid-cols-2 gap-1 rounded-full bg-crema/10 p-1">
        {(["f", "m"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            className={`rounded-full py-2 text-sm font-bold ${gender === g ? "bg-flan text-cafe" : "text-crema/60"}`}
          >
            {g === "f" ? "👩 Mujer" : "👨 Hombre"}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={placeholder} onChange={(e) => setPlaceholder(e.target.checked)} className="size-4" />
        Es un cupo: completa su perfil al entrar
      </label>
      {error && <p className="text-sm">⚠️ {error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full py-3 font-semibold text-crema/60">
          Cancelar
        </button>
        <button disabled={pending || !nickname.trim()} className="flex-1 rounded-full bg-flan py-3 font-bold text-cafe disabled:opacity-40">
          {pending ? "…" : "Crear"}
        </button>
      </div>
    </form>
  );
}
