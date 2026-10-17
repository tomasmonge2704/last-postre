import type { PublicGuest } from "@/lib/guests";
import { type Card, type CardType, type Category } from "@/lib/games/verdad-reto-cards";

export type Dealt = { card: Card; text: string };

const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

// Reemplaza los placeholders con invitados reales de la ronda. null si la carta no se puede armar.
function fill(card: Card, player: PublicGuest, players: PublicGuest[]): string | null {
  const taken = player.partnerId !== null;
  const used = new Set([player.id]);
  let ok = true;

  const text = card.text.replace(/\{(yo|otro|otra|random)\}/g, (_, slot: string) => {
    if (slot === "yo") return player.nickname;
    let pool = players.filter((g) => !used.has(g.id));
    if (slot === "otro") pool = pool.filter((g) => g.gender === "m");
    if (slot === "otra") pool = pool.filter((g) => g.gender === "f");
    // Novios: contacto físico solo con su pareja (y nadie hace contacto con alguien de novio/a que no sea su pareja).
    if (card.physical) {
      pool = taken
        ? pool.filter((g) => g.id === player.partnerId)
        : pool.filter((g) => g.partnerId === null);
    }
    const target = pickOne(pool);
    if (!target) {
      ok = false;
      return "";
    }
    used.add(target.id);
    return target.nickname;
  });

  return ok ? text : null;
}

export function deal(
  player: PublicGuest,
  players: PublicGuest[],
  type: CardType,
  selected: Category[],
  usedIds: Set<string>,
  cards: Card[],
): Dealt | null {
  const pool = cards.filter((c) => c.type === type && selected.includes(c.category));
  const tryFrom = (list: Card[]) => {
    for (const card of list) {
      const text = fill(card, player, players);
      if (text) return { card, text };
    }
    return null;
  };
  const fresh = pool.filter((c) => !usedIds.has(c.id));
  const dedicated = fresh.filter((c) => c.forGuest === player.id);
  const general = fresh.filter((c) => !c.forGuest);
  // Si ya salieron todas, se repiten antes que quedarse sin carta.
  return tryFrom(shuffle(dedicated)) ?? tryFrom(shuffle(general)) ?? tryFrom(shuffle(pool.filter((c) => !c.forGuest)));
}
