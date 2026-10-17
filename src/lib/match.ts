import { rawSql } from "@neon/realtime/server";
import { pool } from "@/lib/db";
import { realtime } from "@/lib/realtime";
import { type PublicGuest, listEventGuests } from "@/lib/guests";

export const isSingle = (g: PublicGuest) => g.partnerId === null;

export type MatchPref = "all" | "f" | "m";

export async function getMatchPref(meId: string): Promise<MatchPref | null> {
  const { rows } = await pool.query<{ match_pref: MatchPref | null }>(`select match_pref from guests where id = $1`, [meId]);
  return rows[0]?.match_pref ?? null;
}

export async function setMatchPref(meId: string, pref: MatchPref) {
  await pool.query(`update guests set match_pref = $2 where id = $1`, [meId, pref]);
}

// Solteros que todavía no swipeaste (ni vos mismo), según lo que elegiste ver.
export async function listDeck(meId: string, pref: MatchPref): Promise<PublicGuest[]> {
  const [guests, { rows }] = await Promise.all([
    listEventGuests(),
    pool.query<{ to_id: string }>(`select to_id from swipes where from_id = $1`, [meId]),
  ]);
  const seen = new Set(rows.map((r) => r.to_id));
  return guests.filter((g) => isSingle(g) && g.id !== meId && !seen.has(g.id) && (pref === "all" || g.gender === pref)).sort(() => Math.random() - 0.5);
}

// Match = like de ida y vuelta.
export async function listMatchIds(meId: string): Promise<string[]> {
  const { rows } = await pool.query<{ id: string }>(
    `select a.to_id as id from swipes a
       join swipes b on b.from_id = a.to_id and b.to_id = a.from_id and b.liked
      where a.from_id = $1 and a.liked
      order by greatest(a.created_at, b.created_at) desc`,
    [meId],
  );
  return rows.map((r) => r.id);
}

// Guarda el swipe y devuelve true si hizo match.
export async function swipe(fromId: string, toId: string, liked: boolean): Promise<boolean> {
  await pool.query(
    `insert into swipes (from_id, to_id, liked) values ($1, $2, $3)
     on conflict (from_id, to_id) do update set liked = excluded.liked, created_at = now()`,
    [fromId, toId, liked],
  );
  if (!liked) return false;
  const { rowCount } = await pool.query(`select 1 from swipes where from_id = $1 and to_id = $2 and liked`, [toId, fromId]);
  return !!rowCount;
}

// En vivo: con quién matcheaste (para el globito del home).
export type MatchRow = { id: string; nickname: string; avatar_url: string | null };

export const myMatchesQuery = (meId: string) =>
  rawSql<MatchRow>(
    `SELECT g.id, coalesce(g.nicknames[1], g.name, g.id) AS nickname, g.avatar_url
     FROM swipes a
     JOIN swipes b ON b.from_id = a.to_id AND b.to_id = a.from_id AND b.liked
     JOIN guests g ON g.id = a.to_id
     WHERE a.from_id = $1 AND a.liked`,
    [meId],
  );

export const sealMyMatches = (meId: string) => realtime.seal({ query: myMatchesQuery(meId) });
