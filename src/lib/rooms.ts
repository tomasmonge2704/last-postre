import { pool } from "@/lib/db";
import { getGuests, type PublicGuest } from "@/lib/guests";

export type Room = {
  id: string;
  name: string;
  guests: PublicGuest[];
  createdBy: string | null;
  usedCards: string[];
};

type RoomRow = { id: string; name: string; guest_ids: string[]; created_by: string | null; used_cards: string[] };

async function hydrate(rows: RoomRow[]): Promise<Room[]> {
  const guests = await getGuests([...new Set(rows.flatMap((r) => r.guest_ids))]);
  const byId = new Map(guests.map((g) => [g.id, g]));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    guests: r.guest_ids.map((id) => byId.get(id)).filter((g): g is PublicGuest => !!g),
    createdBy: r.created_by,
    usedCards: r.used_cards,
  }));
}

// Salas globales del evento: primero en las que estoy, después las más recientes.
export async function listRooms(guestId: string | null, limit = 30): Promise<Room[]> {
  const { rows } = await pool.query<RoomRow>(
    `select id, name, guest_ids, created_by, used_cards from rooms
     order by ($1 = any(guest_ids)) desc, updated_at desc limit $2`,
    [guestId, limit],
  );
  return hydrate(rows);
}

export async function getRoom(id: string): Promise<Room | null> {
  const { rows } = await pool.query<RoomRow>(
    "select id, name, guest_ids, created_by, used_cards from rooms where id = $1",
    [id],
  );
  return (await hydrate(rows))[0] ?? null;
}

export async function upsertRoom(input: { id?: string; name: string; guestIds: string[]; createdBy: string | null }) {
  const { rows } = input.id
    ? await pool.query<{ id: string }>(
        "update rooms set name = $2, guest_ids = $3, updated_at = now() where id = $1 returning id",
        [input.id, input.name, input.guestIds],
      )
    : await pool.query<{ id: string }>(
        "insert into rooms (name, guest_ids, created_by) values ($1, $2, $3) returning id",
        [input.name, input.guestIds, input.createdBy],
      );
  return rows[0]?.id ?? null;
}

export async function addUsedCards(roomId: string, cardIds: string[]) {
  await pool.query(
    `update rooms set used_cards = array(select distinct unnest(used_cards || $2::text[])), updated_at = now()
     where id = $1`,
    [roomId, cardIds],
  );
}

export async function resetUsedCards(roomId: string) {
  await pool.query("update rooms set used_cards = '{}' where id = $1", [roomId]);
}
