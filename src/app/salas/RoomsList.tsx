"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import type { Room } from "@/lib/rooms";
import { Avatar } from "@/components/Avatar";
import { RoomEditor } from "@/components/RoomEditor";

export function RoomsList({ me, rooms: initial }: { me: PublicGuest; rooms: Room[] }) {
  const [rooms, setRooms] = useState(initial);
  const [editing, setEditing] = useState<Room | "new" | null>(initial.length === 0 ? "new" : null);

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-cafe/10 font-bold">‹</Link>
        <p className="font-bold">Salas del evento</p>
        <span className="size-10" />
      </div>
      <h1 className="wordmark mt-6 mb-6 text-center text-6xl text-flan">Salas</h1>

      {editing ? (
        <RoomEditor
          me={me}
          room={editing === "new" ? undefined : editing}
          onCancel={rooms.length ? () => setEditing(null) : undefined}
          onSaved={(room) => {
            setRooms((list) => [room, ...list.filter((r) => r.id !== room.id)]);
            setEditing(null);
          }}
        />
      ) : (
        <>
          <button onClick={() => setEditing("new")} className="mb-4 rounded-full bg-chocolate py-4 text-lg font-bold text-crema">
            + Armar una sala nueva
          </button>
          <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
            {rooms.map((room) => (
              <li key={room.id} className="border-b border-crema/10 last:border-none">
                <button onClick={() => setEditing(room)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <div className="flex -space-x-3">
                    {room.guests.slice(0, 3).map((g) => (
                      <Avatar key={g.id} guest={g} size={32} />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{room.name}</p>
                    <p className="truncate text-sm text-crema/60">{room.guests.map((g) => g.nickname).join(", ")}</p>
                  </div>
                  <span className="text-crema/40">✏️</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
