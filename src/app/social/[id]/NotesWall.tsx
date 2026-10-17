"use client";

import { useState, useTransition } from "react";
import type { GuestNote, NoteKind } from "@/lib/social";
import { addGuestNote, deleteGuestNote } from "@/app/actions";
import { Avatar } from "@/components/Avatar";

type Props = { aboutId: string; aboutName: string; meId: string; isMe: boolean; notes: GuestNote[] };

export function NotesWall({ aboutId, aboutName, meId, isMe, notes }: Props) {
  const [kind, setKind] = useState<NoteKind>("apodo");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const apodos = notes.filter((n) => n.kind === "apodo");
  const comentarios = notes.filter((n) => n.kind === "comentario");
  const canDelete = (n: GuestNote) => isMe || n.author.id === meId;
  const remove = (id: string) => startTransition(() => deleteGuestNote(id));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      await addGuestNote({ aboutId, kind, body });
      setBody("");
    });
  }

  return (
    <>
      <section className="mt-8">
        <h2 className="text-lg font-bold">Apodos 🏷️</h2>
        {apodos.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {apodos.map((n) => (
              <li key={n.id} className="flex items-center gap-1.5 rounded-full border-2 border-cafe bg-flan py-1 pr-2 pl-1 font-bold text-cafe">
                <Avatar guest={n.author} size={24} />
                {n.body}
                {canDelete(n) && (
                  <button onClick={() => remove(n.id)} disabled={pending} aria-label="Borrar" className="ml-0.5 text-cafe/50">✕</button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-crema/50">{isMe ? "Todavía nadie te bautizó." : `Nadie le puso un apodo a ${aboutName} todavía.`}</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Lo que dicen 💬</h2>
        {comentarios.length ? (
          <ul className="mt-3 flex flex-col gap-3">
            {comentarios.map((n) => (
              <li key={n.id} className="flex gap-3 rounded-3xl bg-crema p-3 text-cafe">
                <Avatar guest={n.author} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-dulce">{n.author.id === meId ? "Vos" : n.author.nickname}</p>
                  <p className="break-words">{n.body}</p>
                </div>
                {canDelete(n) && (
                  <button onClick={() => remove(n.id)} disabled={pending} aria-label="Borrar" className="self-start text-cafe/40">✕</button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-crema/50">Sin comentarios por ahora.</p>
        )}
      </section>

      {!isMe && (
        <form onSubmit={submit} className="mt-8 rounded-3xl bg-crema/10 p-4">
          <div className="flex gap-2">
            {(["apodo", "comentario"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 rounded-full py-2 text-sm font-bold ${kind === k ? "bg-flan text-cafe" : "bg-crema/10 text-crema/70"}`}
              >
                {k === "apodo" ? "Apodo 🏷️" : "Comentario 💬"}
              </button>
            ))}
          </div>
          {kind === "apodo" ? (
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={40}
              placeholder={`Un apodo para ${aboutName}`}
              className="mt-3 w-full rounded-full bg-crema px-5 py-3 text-cafe placeholder:text-cafe/40 focus:outline-none"
            />
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder={`¿Qué tenés para decir de ${aboutName}?`}
              className="mt-3 w-full resize-none rounded-3xl bg-crema px-5 py-3 text-cafe placeholder:text-cafe/40 focus:outline-none"
            />
          )}
          <button
            disabled={pending || !body.trim()}
            className="mt-3 w-full rounded-full bg-gradient-to-r from-caramelo to-frutilla py-3 font-bold text-crema shadow-[0_4px_0_var(--color-cafe)] disabled:opacity-50"
          >
            {pending ? "Enviando…" : "Dejar"}
          </button>
        </form>
      )}
    </>
  );
}
