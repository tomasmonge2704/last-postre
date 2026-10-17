"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import { swipeGuest } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { PushPrompt } from "@/components/PushPrompt";

const colors = ["from-flan to-caramelo", "from-caramelo to-frutilla", "from-vainilla to-flan", "from-frutilla to-dulce"];
const THRESHOLD = 100;

type Props = { me: PublicGuest; deck: PublicGuest[]; matches: PublicGuest[] };

export function Swiper({ me, deck: initial, matches: initialMatches }: Props) {
  const [deck, setDeck] = useState(initial);
  const [matches, setMatches] = useState(initialMatches);
  const [drag, setDrag] = useState<{ startX: number; dx: number } | null>(null);
  const [leaving, setLeaving] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [match, setMatch] = useState<PublicGuest | null>(null);

  const [top, next] = deck;

  function decide(liked: boolean) {
    if (!top || leaving) return;
    const guest = top;
    setLeaving({ id: guest.id, dir: liked ? 1 : -1 });
    setDrag(null);
    setTimeout(() => {
      setDeck((d) => d.filter((g) => g.id !== guest.id));
      setLeaving(null);
    }, 250);
    swipeGuest(guest.id, liked).then((matched) => {
      if (!matched) return;
      setMatches((m) => [guest, ...m]);
      setMatch(guest);
    });
  }

  const dx = leaving ? leaving.dir * 500 : (drag?.dx ?? 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-crema/10 font-bold">‹</Link>
        <h1 className="wordmark text-3xl text-flan">Matcheá 💘</h1>
        <span className="size-10" />
      </div>

      <PushPrompt />

      {matches.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-bold text-crema/70">Tus matches</p>
          <ul className="mt-2 flex gap-3 overflow-x-auto pb-1">
            {matches.map((g) => (
              <li key={g.id}>
                <Link href={`/social/${g.id}`} className="flex w-16 flex-col items-center gap-1 text-center">
                  <Avatar guest={g} size={56} />
                  <span className="w-full truncate text-xs">{g.nickname}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}


      <div className="relative mt-4 aspect-[3/4] w-full">
        {!top && (
          <div className="absolute inset-0 grid place-items-center rounded-[2rem] border-2 border-dashed border-crema/20 p-8 text-center">
            <div>
              <p className="text-6xl">🍮</p>
              <p className="mt-3 font-bold">Ya viste a todos</p>
              <p className="mt-1 text-sm text-crema/60">Volvé más tarde, capaz cae alguien nuevo.</p>
            </div>
          </div>
        )}
        {next && <ProfileCard guest={next} className="scale-95 opacity-70" />}
        {top && (
          <ProfileCard
            key={top.id}
            guest={top}
            className={`touch-none select-none ${drag ? "" : "transition-transform duration-250"}`}
            style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)` }}
            stamp={dx > 40 ? "like" : dx < -40 ? "nope" : null}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDrag({ startX: e.clientX, dx: 0 });
            }}
            onPointerMove={(e) => drag && setDrag({ ...drag, dx: e.clientX - drag.startX })}
            onPointerUp={() => {
              if (drag && Math.abs(drag.dx) > THRESHOLD) decide(drag.dx > 0);
              else setDrag(null);
            }}
          />
        )}
      </div>

      {top && (
        <div className="mt-6 flex justify-center gap-8">
          <button onClick={() => decide(false)} aria-label="Paso" className="grid size-16 place-items-center rounded-full border-2 border-cafe bg-crema text-3xl shadow-[0_5px_0_var(--color-cafe)] active:translate-y-1 active:shadow-none">
            ✕
          </button>
          <button onClick={() => decide(true)} aria-label="Me gusta" className="grid size-16 place-items-center rounded-full border-2 border-cafe bg-frutilla text-3xl shadow-[0_5px_0_var(--color-cafe)] active:translate-y-1 active:shadow-none">
            💘
          </button>
        </div>
      )}

      {match && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-chocolate/95 p-6 text-center" onClick={() => setMatch(null)}>
          <p className="wordmark animate-pop-in text-6xl text-frutilla">¡Es un match!</p>
          <div className="flex -space-x-6">
            <Avatar guest={me} size={110} />
            <Avatar guest={match} size={110} />
          </div>
          <p className="text-crema/80">A {match.nickname} también le gustaste 😏<br />Buscalo/a en la previa.</p>
          <div className="flex gap-3">
            <Link href={`/social/${match.id}`} className="rounded-full bg-gradient-to-r from-caramelo to-frutilla px-6 py-3 font-bold shadow-[0_4px_0_var(--color-cafe)]">
              Ver perfil
            </Link>
            <button className="rounded-full bg-crema/10 px-6 py-3 font-bold">Seguir</button>
          </div>
        </div>
      )}
    </>
  );
}

type CardProps = React.HTMLAttributes<HTMLDivElement> & { guest: PublicGuest; stamp?: "like" | "nope" | null };

function ProfileCard({ guest, className = "", stamp, ...rest }: CardProps) {
  const color = colors[[...guest.id].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
  return (
    <div
      {...rest}
      className={`absolute inset-0 overflow-hidden rounded-[2rem] border-2 border-crema/40 bg-gradient-to-b ${color} shadow-[0_6px_0_var(--color-cafe)] ${className}`}
    >
      {guest.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={guest.avatarUrl} alt="" draggable={false} className="size-full object-cover" />
      ) : (
        <p className="wordmark grid size-full place-items-center text-[10rem] text-crema">{guest.nickname[0]}</p>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-chocolate/90 to-transparent p-5 pt-16">
        <p className="wordmark text-4xl text-flan">{guest.nickname}</p>
        {guest.instagram && <p className="mt-2 text-sm font-semibold text-crema/80">@{guest.instagram}</p>}
      </div>
      {stamp && (
        <span
          className={`absolute top-8 rounded-xl border-4 px-3 py-1 text-3xl font-black ${stamp === "like" ? "left-6 -rotate-12 border-frutilla text-frutilla" : "right-6 rotate-12 border-crema text-crema"}`}
        >
          {stamp === "like" ? "ME GUSTA" : "NOPE"}
        </span>
      )}
    </div>
  );
}
