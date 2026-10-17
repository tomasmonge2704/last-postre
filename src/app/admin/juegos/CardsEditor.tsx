"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CardRow, Game } from "@/lib/cards";
import { categories as vrCategories } from "@/lib/games/verdad-reto-cards";
import { yoNuncaCategories } from "@/lib/games/yo-nunca-cards";
import { accionCategories } from "@/lib/games/accion-nombre-cards";
import { addCards, deleteCard, updateCard } from "../actions";

const games: { id: Game; label: string; categories: { id: string; emoji: string; title: string }[]; hint: string }[] = [
  { id: "verdad-reto", label: "Verdad o reto", categories: vrCategories, hint: "{yo} jugador · {otro} un varón · {otra} una mujer · {random} cualquiera" },
  { id: "yo-nunca", label: "Yo nunca", categories: yoNuncaCategories, hint: "Sin el “Yo nunca” adelante: “me chapé a alguien de esta previa”" },
  { id: "accion-nombre", label: "Acción y nombre", categories: accionCategories, hint: "{nombre} es quien sale en la ruleta" },
];

export function CardsEditor({ game, cards }: { game: Game; cards: CardRow[] }) {
  const meta = games.find((g) => g.id === game)!;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [category, setCategory] = useState(meta.categories[0].id);
  const [type, setType] = useState<"verdad" | "reto">("verdad");
  const [physical, setPhysical] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [lines, setLines] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>, ok?: string) =>
    startTransition(async () => {
      try {
        await fn();
        if (ok) setStatus(ok);
        router.refresh();
      } catch (e) {
        setStatus(`⚠️ ${e instanceof Error ? e.message : "Algo falló"}`);
      }
    });

  const count = lines.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {games.map((g) => (
          <Link
            key={g.id}
            href={`/admin/juegos?game=${g.id}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${g.id === game ? "bg-chocolate text-crema" : "bg-crema/70 text-cafe"}`}
          >
            {g.label}
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3 rounded-3xl bg-chocolate p-4 text-crema">
        <p className="font-bold">➕ Agregar cartas</p>
        <p className="text-xs text-crema/50">Una por línea. {meta.hint}</p>
        {game === "verdad-reto" && (
          <div className="grid grid-cols-2 gap-1 rounded-full bg-crema/10 p-1">
            {(["verdad", "reto"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`rounded-full py-2 text-sm font-bold ${type === t ? "bg-flan text-cafe" : "text-crema/60"}`}>
                {t === "verdad" ? "🤫 Verdad" : "🔥 Reto"}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {meta.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${category === c.id ? "bg-flan text-cafe" : "bg-crema/10 text-crema/60"}`}
            >
              {c.emoji} {c.title}
            </button>
          ))}
        </div>
        <textarea
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          rows={5}
          placeholder={game === "accion-nombre" ? "Bailá una canción con {nombre}" : game === "yo-nunca" ? "me chapé a alguien de esta previa" : "{yo}, ¿a quién de acá le darías un beso?"}
          className="rounded-2xl bg-crema/10 px-4 py-3 outline-none placeholder:text-crema/30"
        />
        <div className="flex items-center gap-3">
          {game !== "yo-nunca" && (
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={physical} onChange={(e) => setPhysical(e.target.checked)} className="size-4 accent-[var(--color-flan)]" />
              Contacto físico 💋
            </label>
          )}
          {game === "accion-nombre" && (
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="w-20 rounded-2xl bg-crema/10 px-3 py-2 text-center outline-none" />
          )}
        </div>
        <button
          disabled={pending || !count}
          onClick={() =>
            run(async () => {
              const n = await addCards({ game, type, category, physical, emoji: emoji || null }, lines);
              setLines("");
              setStatus(`✅ ${n} carta${n === 1 ? "" : "s"} agregada${n === 1 ? "" : "s"}`);
            })
          }
          className="rounded-full bg-flan py-3 font-bold text-cafe disabled:opacity-40"
        >
          {pending ? "…" : `Agregar ${count || ""}`}
        </button>
        {status && <p className="text-center text-sm font-semibold">{status}</p>}
      </section>

      {meta.categories.map((c) => {
        const list = cards.filter((card) => card.category === c.id);
        return (
          <section key={c.id}>
            <p className="mb-2 font-bold">
              {c.emoji} {c.title} <span className="text-cafe/50">· {list.filter((x) => x.active).length}</span>
            </p>
            <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
              {list.length === 0 && <li className="px-4 py-3 text-sm text-crema/40">Sin cartas todavía</li>}
              {list.map((card) => (
                <li key={card.id} className={`border-b border-crema/10 px-4 py-3 last:border-none ${card.active ? "" : "opacity-40"}`}>
                  {editing === card.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const text = new FormData(e.currentTarget).get("text") as string;
                        run(() => updateCard(card.id, { text }));
                        setEditing(null);
                      }}
                      className="flex gap-2"
                    >
                      <input name="text" defaultValue={card.text} autoFocus className="min-w-0 flex-1 rounded-xl bg-crema/10 px-3 py-2 outline-none" />
                      <button className="rounded-xl bg-flan px-3 font-bold text-cafe">OK</button>
                    </form>
                  ) : (
                    <button onClick={() => setEditing(card.id)} className="w-full text-left">
                      {card.type && <span className="mr-1">{card.type === "verdad" ? "🤫" : "🔥"}</span>}
                      {card.emoji && <span className="mr-1">{card.emoji}</span>}
                      {card.text}
                      {card.physical && <span className="ml-1">💋</span>}
                    </button>
                  )}
                  <div className="mt-1.5 flex gap-4 text-xs font-semibold text-crema/50">
                    <button disabled={pending} onClick={() => run(() => updateCard(card.id, { active: !card.active }))}>
                      {card.active ? "Pausar" : "Activar"}
                    </button>
                    {game !== "yo-nunca" && (
                      <button disabled={pending} onClick={() => run(() => updateCard(card.id, { physical: !card.physical }))}>
                        {card.physical ? "Sin contacto" : "Con contacto"}
                      </button>
                    )}
                    <button
                      disabled={pending}
                      onClick={() => confirm("¿Borrar esta carta?") && run(() => deleteCard(card.id))}
                      className="text-frutilla"
                    >
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
