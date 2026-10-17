import "server-only";
import { pool } from "@/lib/db";

export type EventKind = "entro" | "perfil" | "match" | "nota" | "sala" | "espia" | "juego";

// Nunca rompe el flujo principal: si falla el log, se ignora.
export async function logEvent(kind: EventKind, guestId: string | null, targetId: string | null = null, data: object = {}) {
  await pool
    .query("insert into events (kind, guest_id, target_id, data) values ($1, $2, $3, $4)", [kind, guestId, targetId, data])
    .catch(() => {});
}

export type ActivityRow = {
  id: string;
  kind: EventKind;
  data: Record<string, string>;
  created_at: string;
  guest_id: string | null;
  guest_nick: string | null;
  guest_avatar: string | null;
  target_id: string | null;
  target_nick: string | null;
  target_avatar: string | null;
};

export async function listActivity(limit = 150) {
  const { rows } = await pool.query<ActivityRow>(
    `select e.id, e.kind, e.data, e.created_at,
            g.id guest_id, g.nicknames[1] guest_nick, g.avatar_url guest_avatar,
            t.id target_id, t.nicknames[1] target_nick, t.avatar_url target_avatar
     from events e left join guests g on g.id = e.guest_id left join guests t on t.id = e.target_id
     order by e.created_at desc limit $1`,
    [limit],
  );
  return rows;
}

export async function activityStats() {
  const { rows } = await pool.query<{ entraron: string; matches: string; notas: string; jugadas: string }>(
    `select count(distinct guest_id) filter (where kind = 'entro') entraron,
            count(*) filter (where kind = 'match') matches,
            count(*) filter (where kind = 'nota') notas,
            count(*) filter (where kind in ('juego', 'espia')) jugadas
     from events`,
  );
  return rows[0];
}
