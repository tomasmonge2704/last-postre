"use client";

import { useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import type { Room } from "@/lib/rooms";
import { Avatar } from "@/components/Avatar";
import { GuestPicker } from "@/components/GuestPicker";
import { RoomEditor } from "@/components/RoomEditor";

export type Players = { guests: PublicGuest[]; room: Room | null };

// Paso común a todos los juegos: "Así nomás, rápido" o elegir/armar una sala.
export function PlayersPicker({
  me,
  rooms: initialRooms,
  value,
  onChange,
}: {
  me: PublicGuest;
  rooms: Room[];
  value: Players;
  onChange: (players: Players) => void;
}) {
  const [tab, setTab] = useState<"rapido" | "salas">(value.room ? "salas" : "rapido");
  const [rooms, setRooms] = useState(initialRooms);
  const [editing, setEditing] = useState<Room | "new" | null>(null);

  function onSaved(room: Room) {
    setRooms((list) => [room, ...list.filter((r) => r.id !== room.id)]);
    setEditing(null);
    onChange({ guests: room.guests, room });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 rounded-full border-2 border-cafe bg-vainilla p-1 font-bold text-cafe">
        {(["rapido", "salas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full py-2 ${tab === t ? "bg-chocolate text-crema" : ""}`}
          >
            {t === "rapido" ? "Así nomás ⚡" : "Salas 🎉"}
          </button>
        ))}
      </div>

      {tab === "rapido" && (
        <GuestPicker
          mode="multi"
          selected={value.room ? [me] : value.guests}
          onChange={(guests) => onChange({ guests, room: null })}
          placeholder="¿Quiénes juegan?"
        />
      )}

      {tab === "salas" && editing && (
        <RoomEditor
          me={me}
          room={editing === "new" ? undefined : editing}
          onSaved={onSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {tab === "salas" && !editing && (
        <>
          <button
            onClick={() => setEditing("new")}
            className="rounded-full border-2 border-dashed border-cafe py-3 font-bold text-cafe"
          >
            + Armar una sala nueva
          </button>
          {rooms.length === 0 && <p className="text-center text-sm text-cafe/70">Todavía no hay salas. ¡Armá la primera!</p>}
          <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
            {rooms.map((room) => {
              const active = value.room?.id === room.id;
              return (
                <li key={room.id} className="flex items-center border-b border-crema/10 last:border-none">
                  <button
                    onClick={() => onChange({ guests: room.guests, room })}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex -space-x-3">
                      {room.guests.slice(0, 3).map((g) => (
                        <Avatar key={g.id} guest={g} size={32} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{room.name}</p>
                      <p className="truncate text-sm text-crema/60">
                        {room.guests.map((g) => g.nickname).join(", ")}
                      </p>
                    </div>
                    <span className={active ? "text-frutilla" : "text-crema/30"}>{active ? "✓" : "○"}</span>
                  </button>
                  <button onClick={() => setEditing(room)} className="px-4 text-crema/50" aria-label="Editar sala">
                    ✏️
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
