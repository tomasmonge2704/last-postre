"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getGuest } from "@/lib/guests";
import { IG_SKIP_COOKIE, SESSION_COOKIE, getCurrentGuest } from "@/lib/session";
import { refresh } from "next/cache";
import { pool } from "@/lib/db";
import { logEvent } from "@/lib/events";
import { igSearch, isIgPicUrl, saveInstagram } from "@/lib/instagram";
import type { IgResult } from "@/components/IgSearch";
import { createMatch, dealRound, getMatchForMember, revealRound } from "@/lib/games/espia";
import { addUsedCards, getRoom, resetUsedCards, upsertRoom } from "@/lib/rooms";
import { type NoteKind, addNote, deleteNote } from "@/lib/social";
import { type MatchPref, isSingle, setMatchPref, swipe } from "@/lib/match";
import { type PushSub, removeSubscription, saveSubscription, sendPush } from "@/lib/push";
import { saveAvatar, updateOwnProfile } from "@/lib/profile";

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
  await logEvent("entro", guest.id);
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
  if (!input.id) await logEvent("sala", me?.id ?? null, null, { name, count: String(input.guestIds.length) });
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
  await logEvent("espia", me.id, null, { count: String(guestIds.length) });
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
  await logEvent("perfil", me.id, null, { slot: me.nickname, nickname });
  redirect("/");
}


// Al entrar, quien no tiene IG conectado se busca y elige su propio perfil.
async function guestWithoutInstagram() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  if (me.instagram && !me.placeholder) throw new Error("Ya tenés tu Instagram conectado");
  return me;
}

export async function searchMyInstagram(query: string) {
  await guestWithoutInstagram();
  return igSearch(query);
}

export async function claimInstagram(result: IgResult) {
  const me = await guestWithoutInstagram();
  if (!isIgPicUrl(result.pic)) throw new Error("Foto inválida");
  const { rows } = await pool.query<{ placeholder: boolean; taken: boolean }>(
    `select placeholder, exists(select 1 from guests where lower(instagram) = lower($2) and id <> $1) as taken
     from guests where id = $1`,
    [me.id, result.username],
  );
  if (rows[0]?.taken) throw new Error(`@${result.username} ya es de otro invitado 🤨`);
  if (me.placeholder && !rows[0]?.placeholder) throw new Error("Este cupo ya lo completó otra persona 😅");
  if (me.placeholder) {
    const nickname = result.fullName?.trim().split(/\s+/)[0] || result.username;
    await pool.query("update guests set nicknames = $2, name = $3, placeholder = false where id = $1", [
      me.id,
      [nickname],
      result.fullName?.trim() || null,
    ]);
  }
  await saveInstagram(me.id, result.username, result.fullName, result.pic);
  await logEvent("perfil", me.id, null, { instagram: result.username, ...(me.placeholder ? { slot: me.nickname } : {}) });
  redirect("/");
}

export async function skipInstagram() {
  (await cookies()).set(IG_SKIP_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 2, sameSite: "lax" });
  redirect("/");
}

export async function addGuestNote(input: { aboutId: string; kind: NoteKind; body: string }) {
  const me = await getCurrentGuest();
  if (!me) throw new Error("Sin sesión");
  const body = input.body.trim().slice(0, input.kind === "apodo" ? 40 : 280);
  if (!body || input.aboutId === me.id || !["apodo", "comentario"].includes(input.kind)) return;
  await addNote({ aboutId: input.aboutId, authorId: me.id, kind: input.kind, body });
  await logEvent("nota", me.id, input.aboutId, { kind: input.kind, body });
  await sendPush(input.aboutId, {
    title: input.kind === "apodo" ? `🏷️ ${me.nickname} te puso un apodo` : `💬 ${me.nickname} comentó en tu perfil`,
    body: input.kind === "apodo" ? `“${body}”` : body,
    url: `/social/${input.aboutId}`,
    icon: me.avatarUrl ?? undefined,
  });
  refresh();
}

export async function deleteGuestNote(id: string) {
  const me = await getCurrentGuest();
  if (!me) throw new Error("Sin sesión");
  await deleteNote(id, me.id);
  refresh();
}

export async function swipeGuest(toId: string, liked: boolean) {
  const me = await getCurrentGuest();
  if (!me) throw new Error("Sin sesión");
  const other = await getGuest(toId);
  // Solo entre solteros
  if (!other || other.id === me.id || !isSingle(me) || !isSingle(other)) return false;
  const matched = await swipe(me.id, other.id, liked);
  // Vos ves el cartel en el momento; al otro le llega la notificación aunque tenga la app cerrada.
  if (matched) {
    await logEvent("match", me.id, other.id);
    await sendPush(other.id, {
      title: "¡Es un match! 💘",
      body: `A ${me.nickname} también le gustaste 😏`,
      url: `/social/${me.id}`,
      icon: me.avatarUrl ?? undefined,
    });
  }
  return matched;
}

export async function subscribePush(sub: PushSub) {
  const me = await getCurrentGuest();
  if (!me) throw new Error("Sin sesión");
  await saveSubscription(me.id, sub);
}

export async function unsubscribePush(endpoint: string) {
  await removeSubscription(endpoint);
}

export async function chooseMatchPref(pref: MatchPref) {
  const me = await getCurrentGuest();
  if (!me || !["all", "f", "m"].includes(pref)) throw new Error("Sin sesión");
  await setMatchPref(me.id, pref);
  refresh();
}

// Los juegos de un solo celu corren en el cliente: avisan cuando arranca una partida.
export async function logGameStart(game: "verdad-reto" | "yo-nunca" | "accion-nombre", players: number) {
  const me = await getCurrentGuest();
  await logEvent("juego", me?.id ?? null, null, { game, players: String(players) });
}

// Tu propio perfil (lápiz en /social/[vos]): apodo, nombre y foto.
export async function updateMyProfile(formData: FormData) {
  const me = await getCurrentGuest();
  if (!me) throw new Error("Sin sesión");
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 30);
  if (!nickname) throw new Error("Poné cómo te dicen 🙏");
  const name = String(formData.get("name") ?? "").trim().slice(0, 60) || null;
  await updateOwnProfile(me.id, { nickname, name });

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/") || photo.size > 3_000_000) throw new Error("La foto tiene que ser una imagen de menos de 3 MB");
    await saveAvatar(me.id, photo.type, Buffer.from(await photo.arrayBuffer()));
  }
  refresh();
}
