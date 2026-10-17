"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import { Avatar } from "@/components/Avatar";

// Copia de normalize() de lib/guests: ese módulo importa pg y no puede ir al cliente.
const normalize = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^@/, "").toLowerCase().trim();

export function SocialList({ meId, guests, counts }: { meId: string; guests: PublicGuest[]; counts: Record<string, number> }) {
  const [query, setQuery] = useState("");
  const q = normalize(query);
  const shown = q
    ? guests.filter((g) => [g.nickname, g.name, g.instagram].some((f) => f && normalize(f).includes(q)))
    : guests;

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-crema/10 font-bold">‹</Link>
        <p className="font-bold">{guests.length} en el evento</p>
        <Link href={`/social/${meId}`} className="rounded-full bg-crema/10 px-3 py-2 text-sm font-semibold">Mi perfil</Link>
      </div>
      <h1 className="wordmark mt-6 text-center text-6xl text-flan">Social</h1>
      <p className="mt-3 text-center text-sm text-crema/60">Dejale un apodo o un comentario a quien quieras 👀</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o @"
        className="mt-5 rounded-full bg-crema px-5 py-3 text-cafe placeholder:text-cafe/40 focus:outline-none"
      />

      <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5">
        {shown.map((g) => (
          <li key={g.id}>
            <Link href={`/social/${g.id}`} className="flex flex-col items-center gap-1.5 text-center">
              <div className="relative">
                <Avatar guest={g} size={76} />
                {!!counts[g.id] && (
                  <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-full border-2 border-cafe bg-frutilla px-1 text-xs font-bold">
                    {counts[g.id]}
                  </span>
                )}
              </div>
              <span className="w-full truncate text-sm font-semibold">{g.id === meId ? "Vos" : g.nickname}</span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="mt-10 text-center text-crema/60">Nadie con ese nombre 🤷</p>}
    </>
  );
}
