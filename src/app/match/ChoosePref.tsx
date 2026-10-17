"use client";

import { useTransition } from "react";
import Link from "next/link";
import { chooseMatchPref } from "@/app/actions";
import type { MatchPref } from "@/lib/match";

const options: { key: MatchPref; label: string; emoji: string; bg: string }[] = [
  { key: "f", label: "Chicas", emoji: "💃", bg: "from-frutilla to-dulce" },
  { key: "m", label: "Chicos", emoji: "🕺", bg: "from-caramelo to-frutilla" },
  { key: "all", label: "Todos", emoji: "🌈", bg: "from-flan to-caramelo" },
];

// Se elige una sola vez y queda guardado en tu usuario.
export function ChoosePref() {
  const [pending, startTransition] = useTransition();
  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-crema/10 font-bold">‹</Link>
        <span />
        <span className="size-10" />
      </div>
      <h1 className="wordmark mt-8 text-center text-[2.6rem] text-flan">¿Qué buscás? 💘</h1>
      <p className="mt-4 text-center text-crema/70">Elegilo una vez y armamos tu feed. No se cambia después 😉</p>
      <div className="mt-8 flex flex-col gap-4">
        {options.map((o) => (
          <button
            key={o.key}
            disabled={pending}
            onClick={() => startTransition(() => chooseMatchPref(o.key))}
            className={`flex items-center justify-between rounded-3xl border-2 border-crema/40 bg-gradient-to-r ${o.bg} px-6 py-5 shadow-[0_5px_0_var(--color-cafe)] transition active:translate-y-1 active:shadow-none disabled:opacity-60`}
          >
            <span className="wordmark text-4xl text-crema">{o.label}</span>
            <span className="text-5xl">{o.emoji}</span>
          </button>
        ))}
      </div>
    </>
  );
}
