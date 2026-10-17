"use client";

import { useState, useTransition } from "react";
import type { PublicGuest } from "@/lib/guests";
import type { Room } from "@/lib/rooms";
import { saveRoom } from "@/app/actions";
import { GuestPicker } from "@/components/GuestPicker";

// Crear o editar una sala: nombre + integrantes. Sin permisos, cualquiera edita.
export function RoomEditor({
  room,
  me,
  onSaved,
  onCancel,
}: {
  room?: Room;
  me: PublicGuest;
  onSaved: (room: Room) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(room?.name ?? "");
  const [guests, setGuests] = useState<PublicGuest[]>(room?.guests ?? [me]);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const saved = await saveRoom({ id: room?.id, name, guestIds: guests.map((g) => g.id) });
      if (saved) onSaved(saved);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la sala (o te inventamos uno)"
        className="rounded-full border-2 border-cafe bg-crema px-5 py-3 font-semibold text-cafe outline-none placeholder:text-cafe/40"
      />
      <GuestPicker mode="multi" selected={guests} onChange={setGuests} placeholder="Sumá gente a la sala" />
      <p className="text-center text-sm font-semibold text-cafe/70">{guests.length} en la sala</p>
      <div className="flex gap-3">
        {onCancel && (
          <button onClick={onCancel} className="flex-1 rounded-full border-2 border-cafe py-3 font-bold text-cafe">
            Cancelar
          </button>
        )}
        <button
          onClick={save}
          disabled={pending || guests.length < 2}
          className="flex-1 rounded-full bg-chocolate py-3 font-bold text-crema disabled:opacity-40"
        >
          {pending ? "Guardando…" : room ? "Guardar cambios" : "Crear sala 🎉"}
        </button>
      </div>
    </div>
  );
}
