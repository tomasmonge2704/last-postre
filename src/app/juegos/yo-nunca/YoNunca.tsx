"use client";

import Link from "next/link";
import { useState } from "react";
import { yoNuncaCategories, type YoNuncaCard, type YoNuncaCategory } from "@/lib/games/yo-nunca-cards";
import { BottomSheet } from "@/components/BottomSheet";
import { logGameStart } from "@/app/actions";

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

export function YoNunca({ cards }: { cards: YoNuncaCard[] }) {
  const [selected, setSelected] = useState<YoNuncaCategory[]>(["clasico", "fiesta"]);
  const [sheet, setSheet] = useState(false);
  const [deck, setDeck] = useState<YoNuncaCard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [spins, setSpins] = useState(0);

  function start() {
    void logGameStart("yo-nunca", 0);
    setDeck(shuffle(cards.filter((c) => selected.includes(c.category))));
    setIndex(0);
  }

  // Al terminar el mazo se vuelve a mezclar.
  function next() {
    if (!deck) return;
    setSpins((s) => s + 1);
    // El texto cambia cuando la carta está de canto, a mitad del giro.
    setTimeout(() => {
      if (index + 1 < deck.length) setIndex(index + 1);
      else {
        setDeck(shuffle(deck));
        setIndex(0);
      }
    }, 200);
  }

  if (deck) {
    const card = deck[index];
    return (
      <div className="flex flex-1 flex-col bg-frutilla px-4 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <span className="size-10" />
          <p className="font-bold text-crema">Yo nunca</p>
          <button onClick={() => setDeck(null)} className="grid size-10 place-items-center font-bold text-crema">✕</button>
        </div>
        <div className="flex flex-1 items-center justify-center [perspective:1200px]">
          {card ? (
            <button
              onClick={next}
              style={{ transform: `rotateY(${spins * 360}deg)` }}
              className="flex aspect-[3/4] w-full max-w-sm flex-col items-center justify-between rounded-[2rem] border-[6px] border-crema bg-caramelo p-8 text-center shadow-[0_10px_0_var(--color-cafe)] transition-transform duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
            >
              <p className="wordmark text-5xl leading-[0.8] text-crema">
                <span className="text-2xl">Nunca</span>
                <br />
                he
              </p>
              <p className="text-2xl leading-snug font-extrabold text-crema">{card.text}</p>
              <span className="text-4xl">{yoNuncaCategories.find((c) => c.id === card.category)?.emoji}</span>
            </button>
          ) : (
            <p className="text-center font-semibold text-crema">No hay cartas en estas categorías 🤷</p>
          )}
        </div>
        <button onClick={next} className="mx-auto rounded-full bg-chocolate px-10 py-4 text-lg font-bold text-crema">
          Siguiente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-flan via-caramelo to-frutilla px-4 pt-4 pb-8">
      <div className="flex justify-end">
        <Link href="/" className="grid size-10 place-items-center rounded-full bg-crema/25 font-bold text-crema">✕</Link>
      </div>
      <h1 className="wordmark animate-pop-in mt-6 text-center text-7xl text-crema">
        Yo
        <span className="block text-flan">nunca</span>
      </h1>
      <ul className="mt-10 overflow-hidden rounded-3xl bg-chocolate text-crema">
        <li>
          <button onClick={() => setSheet(true)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
            <span className="text-xl">🐼</span>
            <span className="flex-1 font-semibold">Categorías</span>
            <span className="text-crema/60">{selected.map((c) => yoNuncaCategories.find((x) => x.id === c)?.emoji).join(" ") || "Ninguna"}</span>
            <span className="text-crema/40">›</span>
          </button>
        </li>
      </ul>
      <p className="mt-4 text-center font-semibold text-crema/90">
        Decilo en voz alta, el que lo hizo toma. Y que empiece el caos. 🥃
      </p>
      <div className="mt-auto pt-8">
        <button
          onClick={start}
          disabled={selected.length === 0}
          className="w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema disabled:opacity-40"
        >
          Comienza el juego
        </button>
      </div>
      {sheet && (
        <BottomSheet title="Categorías" onClose={() => setSheet(false)}>
          <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
            {yoNuncaCategories.map((c) => {
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
        </BottomSheet>
      )}
    </div>
  );
}
