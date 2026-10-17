import "server-only";
import { pool } from "@/lib/db";
import type { Card } from "@/lib/games/verdad-reto-cards";
import type { Accion } from "@/lib/games/accion-nombre-cards";
import type { YoNuncaCard } from "@/lib/games/yo-nunca-cards";

export type Game = "verdad-reto" | "yo-nunca" | "accion-nombre";

export type CardRow = {
  id: string;
  game: Game;
  type: "verdad" | "reto" | null;
  category: string;
  text: string;
  emoji: string | null;
  physical: boolean;
  for_guest: string | null;
  active: boolean;
};

const activeCards = async (game: Game) =>
  (await pool.query<CardRow>("select * from game_cards where game = $1 and active order by created_at", [game])).rows;

export async function listAllCards(game: Game) {
  return (await pool.query<CardRow>("select * from game_cards where game = $1 order by category, type, created_at", [game])).rows;
}

export async function verdadRetoCards(): Promise<Card[]> {
  return (await activeCards("verdad-reto")).map((c) => ({
    id: c.id,
    type: c.type ?? "verdad",
    category: c.category as Card["category"],
    text: c.text,
    physical: c.physical,
    forGuest: c.for_guest ?? undefined,
  }));
}

export async function yoNuncaCards(): Promise<YoNuncaCard[]> {
  return (await activeCards("yo-nunca")).map((c) => ({ id: c.id, category: c.category as YoNuncaCard["category"], text: c.text }));
}

export async function accionCards(): Promise<Accion[]> {
  return (await activeCards("accion-nombre")).map((c) => ({
    id: c.id,
    category: c.category as Accion["category"],
    emoji: c.emoji ?? "🎲",
    text: c.text,
    physical: c.physical,
  }));
}
