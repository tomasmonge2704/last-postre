"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import type { Room } from "@/lib/rooms";
import { categories, type Card, type CardType, type Category } from "@/lib/games/verdad-reto-cards";
import { deal, type Dealt } from "@/lib/games/verdad-reto";
import { clearRoomCards, markCardsUsed, logGameStart } from "@/app/actions";
import { PlayersPicker, type Players } from "@/components/PlayersPicker";
import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";

type Sheet = "players" | "categories" | null;
type Turn = { player: PublicGuest; dealt: (Dealt & { type: CardType }) | null; missing?: CardType };

export function VerdadReto({ me, rooms, cards }: { me: PublicGuest; rooms: Room[]; cards: Card[] }) {
  const [players, setPlayers] = useState<Players>({ guests: [me], room: null });
  const [selected, setSelected] = useState<Category[]>(["clasico", "fiesta"]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [order, setOrder] = useState<PublicGuest[] | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());

  const canStart = players.guests.length >= 2 && selected.length > 0;

  function start() {
    const shuffled = [...players.guests].sort(() => Math.random() - 0.5);
    void logGameStart("verdad-reto", shuffled.length);
    setOrder(shuffled);
    setTurnIndex(0);
    setUsed(new Set(players.room?.usedCards ?? []));
    setTurn({ player: shuffled[0], dealt: null });
  }

  function choose(type: CardType) {
    if (!turn || !order) return;
    const dealt = deal(turn.player, order, type, selected, used, cards);
    if (dealt) {
      setUsed((u) => new Set(u).add(dealt.card.id));
      if (players.room) markCardsUsed(players.room.id, [dealt.card.id]);
    }
    setTurn({ ...turn, dealt: dealt ? { ...dealt, type } : null, missing: dealt ? undefined : type });
  }

  function next() {
    if (!order) return;
    const i = (turnIndex + 1) % order.length;
    setTurnIndex(i);
    setTurn({ player: order[i], dealt: null });
  }

  if (order && turn) {
    return (
      <div className="flex flex-1 flex-col px-4 pt-4 pb-8">
        <Header title="Verdad o reto" onClose={() => setOrder(null)} />
        <PlayCard turn={turn} onChoose={choose} onNext={next} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-8">
      <Header title="" closeHref="/" />
      <h1 className="wordmark animate-pop-in mt-6 text-center text-7xl text-flan">
        Verdad o
        <span className="block text-crema">reto</span>
      </h1>
      <p className="mt-4 text-center font-semibold text-crema/90">El clásico de siempre, pero con nombres reales. 😈</p>

      <ul className="mt-8 overflow-hidden rounded-3xl bg-chocolate text-crema">
        <Row emoji="☝️" label="Jugadores" value={players.room ? players.room.name : `${players.guests.length}`} onClick={() => setSheet("players")} />
        <Row
          emoji="🍮"
          label="Categorías"
          value={selected.map((c) => categories.find((x) => x.id === c)?.emoji).join(" ") || "Ninguna"}
          onClick={() => setSheet("categories")}
        />
      </ul>
      {players.room && players.room.usedCards.length > 0 && (
        <button
          onClick={async () => {
            await clearRoomCards(players.room!.id);
            setPlayers({ ...players, room: { ...players.room!, usedCards: [] } });
          }}
          className="mt-3 text-sm font-semibold text-crema/80 underline"
        >
          Esta sala ya jugó {players.room.usedCards.length} cartas · reiniciar
        </button>
      )}

      <div className="mt-auto pt-8">
        {!canStart && <p className="mb-3 text-center text-sm font-semibold text-crema/80">Sumá al menos 2 jugadores.</p>}
        <button
          onClick={start}
          disabled={!canStart}
          className="w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema disabled:opacity-40"
        >
          Comienza el juego
        </button>
      </div>

      {sheet && (
        <BottomSheet onClose={() => setSheet(null)} title={sheet === "players" ? "Jugadores" : "Categorías"}>
          {sheet === "players" ? (
            <PlayersPicker me={me} rooms={rooms} value={players} onChange={setPlayers} />
          ) : (
            <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
              {categories.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <li key={c.id} className="border-b border-crema/10 last:border-none">
                    <button
                      onClick={() => setSelected(on ? selected.filter((x) => x !== c.id) : [...selected, c.id])}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{c.title}</p>
                        <p className="text-sm text-crema/60">{c.description}</p>
                      </div>
                      <span className={on ? "text-xl text-frutilla" : "text-xl text-crema/20"}>✓</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

function PlayCard({ turn, onChoose, onNext }: { turn: Turn; onChoose: (t: CardType) => void; onNext: () => void }) {
  const { player, dealt } = turn;
  const flipped = dealt !== null;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 [perspective:1200px]">
      <div
        key={player.id + (dealt?.card.id ?? "")}
        className="animate-card-in relative aspect-[3/4] w-full max-w-sm rounded-[2rem] border-[6px] border-crema shadow-[0_10px_0_var(--color-cafe)]"
      >
        {!flipped ? (
          <div className="flex size-full flex-col items-center justify-between rounded-[1.6rem] bg-[radial-gradient(circle_at_30%_20%,var(--color-flan),var(--color-caramelo)_45%,var(--color-dulce))] p-6">
            <p className="wordmark text-center text-5xl text-crema">{player.nickname}</p>
            <Avatar guest={player} size={150} />
            <p className="font-semibold text-cafe">¿Verdad o reto?</p>
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-between rounded-[1.6rem] bg-chocolate p-6 text-center">
            <p className="font-bold text-crema/70">
              {player.nickname} · {dealt.type === "verdad" ? "Verdad" : "Reto"}
            </p>
            <p className={`text-3xl leading-tight font-extrabold ${dealt.type === "verdad" ? "text-flan" : "text-frutilla"}`}>
              {dealt.text}
            </p>
            <span className="text-4xl">{categories.find((c) => c.id === dealt.card.category)?.emoji}</span>
          </div>
        )}
      </div>
      {turn.missing && (
        <p className="text-center font-semibold text-crema">
          No hay {turn.missing === "verdad" ? "verdades" : "retos"} para {player.nickname} con estas categorías. Probá la otra. 🤷
        </p>
      )}
      {!flipped ? (
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <button onClick={() => onChoose("verdad")} className="rounded-full bg-crema py-4 text-lg font-bold text-cafe shadow-[0_4px_0_var(--color-cafe)]">
            Verdad
          </button>
          <button onClick={() => onChoose("reto")} className="rounded-full bg-frutilla py-4 text-lg font-bold text-crema shadow-[0_4px_0_var(--color-cafe)]">
            Reto
          </button>
        </div>
      ) : (
        <button onClick={onNext} className="w-full max-w-sm rounded-full bg-chocolate py-4 text-lg font-bold text-crema">
          Continuar
        </button>
      )}
    </div>
  );
}

function Header({ title, onClose, closeHref }: { title: string; onClose?: () => void; closeHref?: string }) {
  const cls = "grid size-10 place-items-center rounded-full bg-crema/25 text-lg font-bold text-crema backdrop-blur";
  return (
    <div className="flex items-center justify-between">
      <span className="size-10" />
      <p className="font-bold text-crema">{title}</p>
      {closeHref ? (
        <Link href={closeHref} className={cls}>✕</Link>
      ) : (
        <button onClick={onClose} className={cls}>✕</button>
      )}
    </div>
  );
}

function Row({ emoji, label, value, onClick }: { emoji: string; label: string; value: string; onClick: () => void }) {
  return (
    <li className="border-b border-crema/10 last:border-none">
      <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-4 text-left">
        <span className="text-xl">{emoji}</span>
        <span className="flex-1 font-semibold">{label}</span>
        <span className="max-w-[45%] truncate text-crema/60">{value}</span>
        <span className="text-crema/40">›</span>
      </button>
    </li>
  );
}
