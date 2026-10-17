import type { PublicGuest } from "@/lib/guests";
import { type Accion, type AccionCategory } from "@/lib/games/accion-nombre-cards";

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

// Con alguien de novio/a de por medio (y que no sean pareja) solo valen acciones sin contacto.
export function canTouch(a: PublicGuest, b: PublicGuest) {
  if (a.partnerId === b.id && b.partnerId === a.id) return true;
  return a.partnerId === null && b.partnerId === null;
}

export function pickTarget(player: PublicGuest, pool: PublicGuest[]) {
  const others = pool.filter((g) => g.id !== player.id);
  return others[Math.floor(Math.random() * others.length)] ?? null;
}

export function pickActions(player: PublicGuest, target: PublicGuest, selected: AccionCategory[], acciones: Accion[], count = 3): Accion[] {
  const touch = canTouch(player, target);
  const pool = acciones.filter((a) => selected.includes(a.category) && (touch || !a.physical));
  return shuffle(pool).slice(0, count);
}
