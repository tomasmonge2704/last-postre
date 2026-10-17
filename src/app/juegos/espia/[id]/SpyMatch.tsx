"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import type { PublicGuest } from "@/lib/guests";
import type { LiveKind, SpyMatchRow, SpyPlayerRow, SpyRoleRow } from "@/lib/games/espia";
import { places } from "@/lib/games/espia-places";
import { dealSpyRound, revealSpyRound } from "@/app/actions";
import { Avatar } from "@/components/Avatar";

type Sealed = {
  match: SealedLiveQuery<SpyMatchRow>;
  players: SealedLiveQuery<SpyPlayerRow>;
  me: SealedLiveQuery<SpyRoleRow>;
};

export function SpyMatch(props: { me: PublicGuest; matchId: string; realtimeUrl: string; sealed: Sealed }) {
  // Un cliente por página, creado en el navegador.
  const [client] = useState(() => createRealtimeClient({ url: props.realtimeUrl }));
  return (
    <RealtimeProvider client={client}>
      <Match {...props} />
    </RealtimeProvider>
  );
}

function useRefresh<Row>(matchId: string, kind: LiveKind) {
  return useCallback(async () => {
    const res = await fetch(`/api/espia/${matchId}/live`, { method: "POST", body: JSON.stringify({ kind }) });
    if (!res.ok) throw new Error("No se pudo renovar la conexión");
    return (await res.json()) as SealedLiveQuery<Row>;
  }, [matchId, kind]);
}

function Match({ me, matchId, sealed }: { me: PublicGuest; matchId: string; sealed: Sealed }) {
  const match = useLiveQuery(sealed.match, { refreshQuery: useRefresh<SpyMatchRow>(matchId, "match") });
  const players = useLiveQuery(sealed.players, { refreshQuery: useRefresh<SpyPlayerRow>(matchId, "players") });
  const mine = useLiveQuery(sealed.me, { refreshQuery: useRefresh<SpyRoleRow>(matchId, "me") });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const failed = [match, players, mine].find((q) => q.status === "error");
  if (failed) {
    return (
      <Shell>
        <p className="m-auto text-center font-semibold text-crema">
          Se cortó la conexión en vivo 😵
          <br />
          <button onClick={() => location.reload()} className="mt-4 rounded-full bg-chocolate px-6 py-3">Reconectar</button>
        </p>
      </Shell>
    );
  }

  const m = match.data?.[0];
  const list = players.data ?? [];
  const role = mine.data?.[0];
  if (!m) return <Shell><p className="m-auto text-4xl">🕵️</p></Shell>;

  const isHost = m.host_id === me.id;
  const nick = (id: string | null) => list.find((p) => p.guest_id === id)?.nickname ?? "Alguien";
  const act = (fn: (id: string) => Promise<void>) =>
    startTransition(async () => {
      setError(null);
      try {
        await fn(matchId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo falló");
      }
    });

  const hostButton = (label: string, fn: (id: string) => Promise<void>, disabled = false) =>
    isHost ? (
      <button
        disabled={pending || disabled}
        onClick={() => act(fn)}
        className="w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema disabled:opacity-40"
      >
        {pending ? "…" : label}
      </button>
    ) : (
      <p className="text-center font-semibold text-crema/80">Esperando a {nick(m.host_id)}…</p>
    );

  return (
    <Shell>
      {m.status === "lobby" && (
        <>
          <h1 className="wordmark mt-4 text-center text-5xl text-flan">
            ¿Quién es <span className="block text-crema">el espía?</span>
          </h1>
          <p className="mt-6 mb-3 font-bold text-crema">En la sala ({list.length})</p>
          <PlayersList players={list} />
          <p className="mt-4 text-center text-sm font-semibold text-crema/80">
            Que cada uno entre a Postre → El Espía → Partidas abiertas.
          </p>
          <div className="mt-auto pt-6">
            {hostButton(list.length < 3 ? "Faltan jugadores (mín. 3)" : "Repartir cartas 🃏", dealSpyRound, list.length < 3)}
          </div>
        </>
      )}

      {m.status === "playing" && (
        <>
          {role && role.round === m.round ? (
            <SecretCard name={me.nickname} role={role} />
          ) : (
            <p className="mt-10 text-center font-semibold text-crema">
              Entraste con la ronda empezada. Vas a jugar la próxima. 🍿
            </p>
          )}
          <Timer endsAt={m.ends_at ? new Date(m.ends_at).getTime() : null} starter={nick(m.starter_id)} />
          <div className="mt-auto pt-4">{hostButton("Stop ✋ — revelar", revealSpyRound)}</div>
        </>
      )}

      {m.status === "reveal" && (
        <>
          <div className="animate-pop-in mt-10 rounded-[2rem] border-[6px] border-crema bg-chocolate p-8 text-center shadow-[0_10px_0_var(--color-cafe)]">
            <p className="font-bold text-crema/70">
              {(m.spy_ids?.split(",").length ?? 1) > 1 ? "Los espías eran" : "El espía era"}
            </p>
            <p className="wordmark mt-3 text-5xl text-frutilla">
              {m.spy_ids?.split(",").map(nick).join(" y ")}
            </p>
            <p className="mt-6 text-crema/70">El lugar era</p>
            <p className="mt-1 text-3xl font-extrabold text-flan">
              {places.find((p) => p.name === m.place)?.emoji} {m.place}
            </p>
          </div>
          <div className="mt-auto pt-6">{hostButton("Otra ronda 🔁", dealSpyRound, list.length < 3)}</div>
        </>
      )}
      {error && <p className="mt-3 text-center font-semibold text-crema">{error}</p>}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <span className="size-10" />
        <p className="font-bold text-crema">¿Quién es el espía?</p>
        <Link href="/juegos/espia" className="grid size-10 place-items-center rounded-full bg-crema/25 font-bold text-crema">✕</Link>
      </div>
      {children}
    </div>
  );
}

function PlayersList({ players }: { players: readonly SpyPlayerRow[] }) {
  return (
    <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
      {players.map((p) => (
        <li key={p.guest_id} className="flex items-center gap-3 border-b border-crema/10 px-4 py-3 last:border-none">
          <Avatar guest={{ id: p.guest_id, nickname: p.nickname, avatarUrl: p.avatar_url }} size={36} />
          <span className="flex-1 font-semibold">{p.nickname}</span>
          <span className="text-sm text-flan">conectado</span>
        </li>
      ))}
    </ul>
  );
}

// Carta privada: se desliza hacia arriba para ver el rol y vuelve a taparse al soltar.
function SecretCard({ name, role }: { name: string; role: SpyRoleRow }) {
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<number | null>(null);
  const place = places.find((p) => p.name === role.place);

  return (
    <div className="relative mx-auto mt-6 aspect-[3/4] w-full max-w-sm select-none">
      <div className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col items-center justify-center rounded-[2rem] bg-chocolate p-6 text-center">
        {role.is_spy ? (
          <>
            <p className="wordmark text-4xl text-frutilla">Espía 🕵️</p>
            <p className="mt-2 font-semibold text-crema/80">Averiguá el lugar sin que te pillen</p>
          </>
        ) : (
          <>
            <p className="text-5xl">{place?.emoji}</p>
            <p className="mt-1 text-3xl font-extrabold text-flan">{role.place}</p>
            <p className="mt-1 font-semibold text-crema/80">👤 {role.role}</p>
          </>
        )}
      </div>
      <div
        onPointerDown={(e) => {
          start.current = e.clientY;
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => start.current !== null && setDy(Math.min(0, e.clientY - start.current))}
        onPointerUp={() => {
          start.current = null;
          setDragging(false);
          setDy(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDragging(false);
          setDy(0);
        }}
        style={{ transform: `translateY(${dy}px)`, transition: dragging ? "none" : "transform .3s" }}
        className="absolute inset-0 flex touch-none flex-col items-center justify-between rounded-[2rem] border-[6px] border-crema bg-[radial-gradient(circle_at_30%_20%,var(--color-flan),var(--color-caramelo)_45%,var(--color-dulce))] p-6 shadow-[0_10px_0_var(--color-cafe)]"
      >
        <p className="wordmark text-center text-5xl text-crema">{name}</p>
        <p className="text-8xl">🕵️</p>
        <div className="text-center font-semibold text-cafe">
          <p>⬆️ Deslizá hacia arriba para revelar</p>
          <p className="text-sm text-cafe/70">Que nadie más la vea</p>
        </div>
      </div>
    </div>
  );
}

function Timer({ endsAt, starter }: { endsAt: number | null; starter: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.round(((endsAt ?? now) - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="mt-6 text-center">
      <p className="text-xl font-extrabold text-crema">¡{starter} empieza!</p>
      <p className="text-sm font-semibold text-crema/80">Hacele la primera pregunta a quien quieras.</p>
      <p className={`wordmark mt-3 text-6xl ${left === 0 ? "text-frutilla" : "text-flan"}`}>{left === 0 ? "¡Tiempo!" : `${mm}:${ss}`}</p>
    </div>
  );
}
