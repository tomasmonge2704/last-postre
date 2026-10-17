"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { PublicGuest } from "@/lib/guests";
import type { Room } from "@/lib/rooms";
import { startSpyMatch } from "@/app/actions";
import { PlayersPicker, type Players } from "@/components/PlayersPicker";
import { BottomSheet } from "@/components/BottomSheet";

const statusLabel = { lobby: "Esperando gente", playing: "Jugando", reveal: "Revelando" } as Record<string, string>;

export function EspiaSetup({
  me,
  rooms,
  openMatches,
}: {
  me: PublicGuest;
  rooms: Room[];
  openMatches: { id: string; room_name: string; status: string }[];
}) {
  const [players, setPlayers] = useState<Players>({ guests: [me], room: null });
  const [sheet, setSheet] = useState(false);
  const [pending, startTransition] = useTransition();
  const canStart = players.guests.length >= 3;

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-8">
      <div className="flex justify-end">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-crema/25 font-bold text-crema">✕</Link>
      </div>
      <h1 className="wordmark animate-pop-in mt-4 text-center text-6xl text-flan">
        ¿Quién es
        <span className="block text-crema">el espía?</span>
      </h1>
      <p className="mt-4 text-center font-semibold text-crema/90">
        Cada uno con su celu. Todos saben el lugar… menos uno. 🕵️
      </p>

      {openMatches.length > 0 && (
        <>
          <p className="mt-8 mb-2 font-bold text-crema">Partidas abiertas</p>
          <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
            {openMatches.map((m) => (
              <li key={m.id} className="border-b border-crema/10 last:border-none">
                <Link href={`/juegos/espia/${m.id}`} className="flex items-center gap-3 px-4 py-4">
                  <span className="text-xl">🕵️</span>
                  <span className="flex-1 font-semibold">{m.room_name}</span>
                  <span className="text-sm text-crema/60">{statusLabel[m.status]}</span>
                  <span className="text-crema/40">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <ul className="mt-8 overflow-hidden rounded-3xl bg-chocolate text-crema">
        <li>
          <button onClick={() => setSheet(true)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
            <span className="text-xl">☝️</span>
            <span className="flex-1 font-semibold">Jugadores</span>
            <span className="max-w-[45%] truncate text-crema/60">{players.room ? players.room.name : players.guests.length}</span>
            <span className="text-crema/40">›</span>
          </button>
        </li>
      </ul>

      <div className="mt-auto pt-8">
        {!canStart && <p className="mb-3 text-center text-sm font-semibold text-crema/80">Hacen falta al menos 3.</p>}
        <button
          disabled={!canStart || pending}
          onClick={() =>
            startTransition(() =>
              startSpyMatch({ roomId: players.room?.id ?? null, guestIds: players.guests.map((g) => g.id) }),
            )
          }
          className="w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema disabled:opacity-40"
        >
          {pending ? "Armando…" : "Crear partida"}
        </button>
      </div>

      {sheet && (
        <BottomSheet title="Jugadores" onClose={() => setSheet(false)}>
          <PlayersPicker me={me} rooms={rooms} value={players} onChange={setPlayers} />
        </BottomSheet>
      )}
    </div>
  );
}
