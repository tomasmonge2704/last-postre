"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getGuest } from "@/lib/guests";
import { SESSION_COOKIE, getCurrentGuest } from "@/lib/session";
import { refresh } from "next/cache";
import { pool } from "@/lib/db";
import { createMatch, dealRound, getMatchForMember, revealRound } from "@/lib/games/espia";
import { addUsedCards, getRoom, resetUsedCards, upsertRoom } from "@/lib/rooms";

export async function enter(guestId: string) {
  const guest = await getGuest(guestId);
  if (!guest) throw new Error("Invitado no encontrado");
  (await cookies()).set(SESSION_COOKIE, guest.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
  redirect("/");
}

export async function leave() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/entrar");
}

const funnyNames = ["Los del fondo 🍻", "Team Flan 🍮", "Dulce de leche 🤎", "Los del balcón 🌙", "Mesa caramelo 🍯", "Los picantes 🌶️"];

export async function saveRoom(input: { id?: string; name: string; guestIds: string[] }) {
  const me = await getCurrentGuest();
  const name = input.name.trim() || funnyNames[Math.floor(Math.random() * funnyNames.length)];
  const id = await upsertRoom({ ...input, name, createdBy: me?.id ?? null });
  if (!id) throw new Error("Sala no encontrada");
  refresh();
  return getRoom(id);
}

export async function markCardsUsed(roomId: string, cardIds: string[]) {
  if (cardIds.length) await addUsedCards(roomId, cardIds);
}

export async function clearRoomCards(roomId: string) {
  await resetUsedCards(roomId);
}

export async function startSpyMatch(input: { roomId: string | null; guestIds: string[] }) {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const guestIds = [...new Set([me.id, ...input.guestIds])];
  const roomId =
    input.roomId ??
    (await upsertRoom({ name: funnyNames[Math.floor(Math.random() * funnyNames.length)], guestIds, createdBy: me.id }));
  if (!roomId) throw new Error("No se pudo crear la sala");
  const matchId = await createMatch(roomId, me.id);
  redirect(`/juegos/espia/${matchId}`);
}

async function hostMatch(matchId: string) {
  const me = await getCurrentGuest();
  const match = me && (await getMatchForMember(matchId, me.id));
  if (!match || match.host_id !== me.id) throw new Error("Solo el que creó la partida puede hacer esto");
  return match;
}

export async function dealSpyRound(matchId: string) {
  await dealRound(await hostMatch(matchId));
}

export async function revealSpyRound(matchId: string) {
  await hostMatch(matchId);
  await revealRound(matchId);
}

// Los cupos "Amiga de…" completan su propio perfil al entrar (una sola vez).
export async function completeProfile(input: { nickname: string; name: string; instagram: string; gender: "m" | "f" }) {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const nickname = input.nickname.trim();
  if (!nickname) throw new Error("Poné cómo te dicen 🙏");
  const { rowCount } = await pool.query(
    `update guests set nicknames = $2, name = $3, instagram = $4, gender = $5, placeholder = false
     where id = $1 and placeholder`,
    [me.id, [nickname], input.name.trim() || null, input.instagram.trim().replace(/^@/, "") || null, input.gender],
  );
  if (!rowCount) throw new Error("Este cupo ya lo completó otra persona 😅");
  redirect("/");
}
