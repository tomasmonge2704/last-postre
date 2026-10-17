import { rawSql, createRealtime } from "@neon/realtime/server";
import { pool } from "@/lib/db";
import { places } from "@/lib/games/espia-places";

export const ROUND_MINUTES = 7;

export const realtime = createRealtime({
  secret: process.env.NEON_REALTIME_SECRET!,
  db: new URL(process.env.DATABASE_URL!).pathname.slice(1),
});

// Filas que viajan por Realtime. El lugar y el espía solo aparecen en la revelación.
export type SpyMatchRow = {
  id: string;
  room_id: string;
  round: number;
  status: "lobby" | "playing" | "reveal";
  host_id: string;
  starter_id: string | null;
  ends_at: Date | null;
  place: string | null;
  spy_ids: string | null;
};
export type SpyPlayerRow = { guest_id: string; nickname: string; avatar_url: string | null };
export type SpyRoleRow = { guest_id: string; round: number; place: string | null; role: string; is_spy: boolean };

export const matchQuery = (matchId: string) =>
  rawSql<SpyMatchRow>(
    `SELECT m.id, m.room_id, m.round, m.status, m.host_id, m.starter_id,
       m.ends_at,
       CASE WHEN m.status = 'reveal' THEN m.place END AS place,
       CASE WHEN m.status = 'reveal' THEN (
         SELECT string_agg(r.guest_id, ',') FROM spy_roles r
         WHERE r.match_id = m.id AND r.round = m.round AND r.is_spy
       ) END AS spy_ids
     FROM spy_matches m WHERE m.id = $1`,
    [matchId],
  );

export const playersQuery = (matchId: string) =>
  rawSql<SpyPlayerRow>(
    `SELECT p.guest_id, coalesce(g.nicknames[1], g.name, g.id) AS nickname, g.avatar_url
     FROM spy_players p JOIN guests g ON g.id = p.guest_id
     WHERE p.match_id = $1 ORDER BY p.joined_at`,
    [matchId],
  );

// Solo la fila del que pregunta, y solo la de la ronda actual.
export const myRoleQuery = (matchId: string, guestId: string) =>
  rawSql<SpyRoleRow>(
    `SELECT r.guest_id, r.round, r.place, r.role, r.is_spy
     FROM spy_roles r JOIN spy_matches m ON m.id = r.match_id AND m.round = r.round
     WHERE r.match_id = $1 AND r.guest_id = $2`,
    [matchId, guestId],
  );

export type LiveKind = "match" | "players" | "me";

export function sealFor(kind: LiveKind, matchId: string, guestId: string) {
  if (kind === "match") return realtime.seal({ query: matchQuery(matchId) });
  if (kind === "players") return realtime.seal({ query: playersQuery(matchId) });
  return realtime.seal({ query: myRoleQuery(matchId, guestId) });
}

export const sealMatch = (matchId: string, guestId: string) =>
  Promise.all([
    realtime.seal({ query: matchQuery(matchId) }),
    realtime.seal({ query: playersQuery(matchId) }),
    realtime.seal({ query: myRoleQuery(matchId, guestId) }),
  ]);

type MatchRow = { id: string; room_id: string; host_id: string; round: number; status: string; place: string | null };

export async function getMatchForMember(matchId: string, guestId: string) {
  const { rows } = await pool.query<MatchRow>(
    `select m.id, m.room_id, m.host_id, m.round, m.status, m.place from spy_matches m
     join rooms r on r.id = m.room_id where m.id = $1 and $2 = any(r.guest_ids)`,
    [matchId, guestId],
  );
  return rows[0] ?? null;
}

export async function createMatch(roomId: string, hostId: string) {
  const { rows } = await pool.query<{ id: string }>(
    "insert into spy_matches (room_id, host_id) values ($1, $2) returning id",
    [roomId, hostId],
  );
  return rows[0].id;
}

export async function joinMatch(matchId: string, guestId: string) {
  await pool.query("insert into spy_players (match_id, guest_id) values ($1, $2) on conflict do nothing", [matchId, guestId]);
}

export async function listOpenMatches(guestId: string) {
  const { rows } = await pool.query<{ id: string; room_name: string; status: string }>(
    `select m.id, r.name as room_name, m.status from spy_matches m join rooms r on r.id = m.room_id
     where $1 = any(r.guest_ids) and m.created_at > now() - interval '12 hours'
     order by m.updated_at desc limit 10`,
    [guestId],
  );
  return rows;
}

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

// Reparte una ronda nueva entre los presentes: 1 espía (2 si son 8 o más).
export async function dealRound(match: MatchRow) {
  const { rows: present } = await pool.query<{ guest_id: string }>(
    "select guest_id from spy_players where match_id = $1",
    [match.id],
  );
  if (present.length < 3) throw new Error("Hacen falta al menos 3 jugadores");

  const place = shuffle(places.filter((p) => p.id !== match.place))[0];
  const ids = shuffle(present.map((p) => p.guest_id));
  const spies = new Set(ids.slice(0, ids.length >= 8 ? 2 : 1));
  const roles = shuffle(place.roles);
  const round = match.round + 1;
  const rows = ids.map((id, i) => ({
    guest_id: id,
    place: spies.has(id) ? null : place.name,
    role: spies.has(id) ? "Espía" : roles[i % roles.length],
    is_spy: spies.has(id),
  }));

  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      `insert into spy_roles (match_id, round, guest_id, place, role, is_spy)
       select $1, $2, * from unnest($3::text[], $4::text[], $5::text[], $6::bool[])`,
      [match.id, round, rows.map((r) => r.guest_id), rows.map((r) => r.place), rows.map((r) => r.role), rows.map((r) => r.is_spy)],
    );
    await client.query(
      `update spy_matches set round = $2, status = 'playing', place = $3, starter_id = $4,
         ends_at = now() + make_interval(mins => $5), updated_at = now() where id = $1`,
      [match.id, round, place.name, shuffle(ids)[0], ROUND_MINUTES],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function revealRound(matchId: string) {
  await pool.query("update spy_matches set status = 'reveal', updated_at = now() where id = $1 and status = 'playing'", [matchId]);
}


