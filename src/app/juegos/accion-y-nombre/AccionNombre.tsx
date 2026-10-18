"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import type { Room } from "@/lib/rooms";
import { accionCategories, type Accion, type AccionCategory } from "@/lib/games/accion-nombre-cards";
import { pickActions, pickTarget } from "@/lib/games/accion-nombre";
import { PlayersPicker, type Players } from "@/components/PlayersPicker";
import { BottomSheet } from "@/components/BottomSheet";
import { Avatar } from "@/components/Avatar";
import { logGameStart } from "@/app/actions";

type Phase = "ready" | "spinning" | "choose" | "done";
type Turn = { player: PublicGuest; target: PublicGuest | null; actions: Accion[]; chosen: Accion | null; phase: Phase };

export function AccionNombre({ me, rooms, acciones }: { me: PublicGuest; rooms: Room[]; acciones: Accion[] }) {
  const [players, setPlayers] = useState<Players>({ guests: [me], room: null });
  const [selected, setSelected] = useState<AccionCategory[]>(["suave", "fiesta"]);
  const [sheet, setSheet] = useState<"players" | "categories" | null>(null);
  const [order, setOrder] = useState<PublicGuest[] | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);

  // La ruleta sale solo de los que están jugando (la sala o los elegidos).
  const pool = players.room ? players.room.guests : players.guests;
  const canStart = selected.length > 0 && pool.length >= 2;

  const newTurn = (player: PublicGuest): Turn => ({ player, target: null, actions: [], chosen: null, phase: "ready" });

  function start() {
    const list = [...players.guests].sort(() => Math.random() - 0.5);
    void logGameStart("accion-nombre", list.length);
    setOrder(list);
    setTurnIndex(0);
    setTurn(newTurn(list[0]));
  }

  function spin() {
    if (!turn) return;
    const target = pickTarget(turn.player, pool);
    setTurn({ ...turn, target, actions: target ? pickActions(turn.player, target, selected, acciones) : [], phase: "spinning" });
  }

  function next() {
    if (!order) return;
    const i = (turnIndex + 1) % order.length;
    setTurnIndex(i);
    setTurn(newTurn(order[i]));
  }

  if (order && turn) {
    return (
      <div className="flex flex-1 flex-col px-4 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <span className="size-10" />
          <p className="font-bold text-cafe">Acción y nombre</p>
          <button onClick={() => setOrder(null)} className="grid size-10 place-items-center rounded-full bg-cafe/15 font-bold text-cafe">✕</button>
        </div>
        <TurnView
          turn={turn}
          pool={pool}
          onSpin={spin}
          onLanded={() => setTurn({ ...turn, phase: "choose" })}
          onChoose={(a) => setTurn({ ...turn, chosen: a, phase: "done" })}
          onNext={next}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-8 text-cafe">
      <div className="flex justify-end">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-cafe/15 font-bold">✕</Link>
      </div>
      <h1 className="wordmark animate-pop-in mt-6 text-center text-7xl text-crema">
        Acción y
        <span className="block text-flan">nombre</span>
      </h1>
      <p className="mt-4 text-center font-semibold text-cafe/80">
        La ruleta elige con quién. Vos elegís qué. 😏
      </p>

      <ul className="mt-8 overflow-hidden rounded-3xl bg-chocolate text-crema">
        <li className="border-b border-crema/10">
          <button onClick={() => setSheet("players")} className="flex w-full items-center gap-3 px-4 py-4 text-left">
            <span className="text-xl">☝️</span>
            <span className="flex-1 font-semibold">Jugadores</span>
            <span className="max-w-[45%] truncate text-crema/60">{players.room ? players.room.name : players.guests.length}</span>
            <span className="text-crema/40">›</span>
          </button>
        </li>
        <li>
          <button onClick={() => setSheet("categories")} className="flex w-full items-center gap-3 px-4 py-4 text-left">
            <span className="text-xl">🍮</span>
            <span className="flex-1 font-semibold">Categorías</span>
            <span className="text-crema/60">{selected.map((c) => accionCategories.find((x) => x.id === c)?.emoji).join(" ") || "Ninguna"}</span>
            <span className="text-crema/40">›</span>
          </button>
        </li>
      </ul>
      <p className="mt-3 text-center text-sm font-semibold text-cafe/70">
        {pool.length < 2 ? "Sumá al menos a alguien más para jugar." : players.room ? `La ruleta sale de "${players.room.name}".` : "La ruleta sale de los que están jugando 🎲"}
      </p>

      <div className="mt-auto pt-8">
        <button
          onClick={start}
          disabled={!canStart}
          className="w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema disabled:opacity-40"
        >
          Comienza el juego
        </button>
      </div>

      {sheet && (
        <BottomSheet title={sheet === "players" ? "Jugadores" : "Categorías"} onClose={() => setSheet(null)}>
          {sheet === "players" ? (
            <PlayersPicker me={me} rooms={rooms} value={players} onChange={setPlayers} />
          ) : (
            <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
              {accionCategories.map((c) => {
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

function TurnView({
  turn,
  pool,
  onSpin,
  onLanded,
  onChoose,
  onNext,
}: {
  turn: Turn;
  pool: PublicGuest[];
  onSpin: () => void;
  onLanded: () => void;
  onChoose: (a: Accion) => void;
  onNext: () => void;
}) {
  const { player, target, phase } = turn;
  const fill = (a: Accion) => a.text.replace("{nombre}", target?.nickname ?? "");

  return (
    <div className="flex flex-1 flex-col items-center gap-5 pt-4">
      <div key={player.id} className="animate-card-in w-full max-w-sm rounded-[2rem] border-[6px] border-crema bg-[radial-gradient(circle_at_30%_20%,var(--color-flan),var(--color-caramelo)_45%,var(--color-dulce))] p-5 text-center shadow-[0_10px_0_var(--color-cafe)]">
        <p className="font-bold text-cafe/80">Le toca a</p>
        <p className="wordmark text-5xl text-crema">{player.nickname}</p>
        <div className="mt-4 rounded-3xl bg-chocolate px-4 py-5 text-crema">
          <p className="text-sm font-bold text-crema/60">con…</p>
          {phase === "ready" ? (
            <p className="mt-2 text-5xl">🎰</p>
          ) : phase === "spinning" ? (
            <Roulette pool={pool} exclude={player.id} target={target} onLanded={onLanded} />
          ) : (
            <TargetName guest={target} />
          )}
        </div>
      </div>

      {phase === "ready" && (
        <button onClick={onSpin} className="mt-auto w-full max-w-sm rounded-full bg-frutilla py-4 text-lg font-bold text-crema shadow-[0_4px_0_var(--color-cafe)]">
          Girar la ruleta 🎰
        </button>
      )}

      {phase === "choose" && (
        <div className="flex w-full max-w-sm flex-col gap-3">
          {turn.actions.length === 0 && (
            <p className="text-center font-semibold text-cafe">No hay acciones para esta combinación 🤷</p>
          )}
          {turn.actions.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onChoose(a)}
              style={{ animationDelay: `${i * 90}ms` }}
              className="animate-card-in flex items-center gap-3 rounded-3xl bg-chocolate px-4 py-4 text-left text-crema shadow-[0_4px_0_var(--color-cafe)]"
            >
              <span className="text-3xl">{a.emoji}</span>
              <span className="flex-1 font-bold">{fill(a)}</span>
            </button>
          ))}
          {turn.actions.length === 0 && <NextButtons onNext={onNext} />}
        </div>
      )}

      {phase === "done" && turn.chosen && (
        <>
          <div className="animate-card-in w-full max-w-sm rounded-3xl border-4 border-crema bg-chocolate p-6 text-center text-crema">
            <p className="text-5xl">{turn.chosen.emoji}</p>
            <p className="mt-3 text-2xl leading-snug font-extrabold text-flan">{fill(turn.chosen)}</p>
          </div>
          <NextButtons onNext={onNext} />
        </>
      )}
    </div>
  );
}

function NextButtons({ onNext }: { onNext: () => void }) {
  return (
    <div className="mt-auto grid w-full max-w-sm grid-cols-2 gap-3">
      <button onClick={onNext} className="rounded-full bg-crema py-4 font-bold text-cafe shadow-[0_4px_0_var(--color-cafe)]">
        Paso 🥃
      </button>
      <button onClick={onNext} className="rounded-full bg-frutilla py-4 font-bold text-crema shadow-[0_4px_0_var(--color-cafe)]">
        ¡Cumplí! ✅
      </button>
    </div>
  );
}

function TargetName({ guest }: { guest: PublicGuest | null }) {
  if (!guest) return <p className="mt-2 font-semibold">No hay nadie más 😅</p>;
  return (
    <div className="mt-2 flex flex-col items-center gap-2">
      <Avatar guest={guest} size={72} />
      <p className="wordmark text-4xl text-flan">{guest.nickname}</p>
    </div>
  );
}

// Pasa nombres cada vez más lento hasta frenar en el elegido.
function Roulette({
  pool,
  exclude,
  target,
  onLanded,
}: {
  pool: PublicGuest[];
  exclude: string;
  target: PublicGuest | null;
  onLanded: () => void;
}) {
  const names = pool.filter((g) => g.id !== exclude);
  const [shown, setShown] = useState<PublicGuest | null>(names[0] ?? null);
  const landed = useRef(onLanded);
  useEffect(() => {
    landed.current = onLanded;
  });

  useEffect(() => {
    let delay = 50;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (delay > 320) {
        setShown(target);
        timer = setTimeout(() => landed.current(), 500);
        return;
      }
      setShown(names[Math.floor(Math.random() * names.length)] ?? null);
      delay *= 1.15;
      timer = setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timer);
    // Una sola vuelta por turno.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <TargetName guest={shown} />;
}
