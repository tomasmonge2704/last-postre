import { pool } from "@/lib/db";

export type Guest = {
  id: string;
  name: string | null;
  nicknames: string[]; // el primero es el principal (como figura en la planilla)
  instagram: string | null;
  instagramName?: string | null;
  phone?: string;
  gender: "m" | "f";
  avatarUrl: string | null;
  tags: string[];
  relationship: { status: "single" | "taken"; partnerId?: string };
  friendGroups: string[];
  knows: string[];
  funFacts: string[];
  placeholder: boolean; // cupo de un grupo sin nombre real todavía ("Amiga 2 de Solga")
  sheetLabel: string; // texto original de la planilla
};

// Lo único que viaja al cliente (sin teléfono ni etiquetas privadas).
export type PublicGuest = {
  id: string;
  name: string | null;
  nickname: string;
  instagram: string | null;
  avatarUrl: string | null;
  friendGroups: string[];
  gender: "m" | "f";
  partnerId: string | null; // solo para filtrar prendas con terceros
};

type GuestRow = {
  id: string;
  name: string | null;
  nicknames: string[];
  instagram: string | null;
  avatar_url: string | null;
  friend_groups: string[];
  gender: "m" | "f";
  relationship_status: "single" | "taken";
  partner_id: string | null;
};

const columns = "id, name, nicknames, instagram, avatar_url, friend_groups, gender, relationship_status, partner_id";

function toPublic(row: GuestRow): PublicGuest {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nicknames[0] ?? row.name ?? row.id,
    instagram: row.instagram,
    avatarUrl: row.avatar_url,
    friendGroups: row.friend_groups,
    gender: row.gender,
    // "taken" sin pareja invitada: igual cuenta como de novio/a
    partnerId: row.relationship_status === "taken" ? (row.partner_id ?? "") : null,
  };
}

export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^@/, "").toLowerCase().trim();
}

// ~100 invitados: se filtra en memoria, más tolerante que SQL y sin extensiones.
export async function searchGuests(query: string, limit = 8): Promise<PublicGuest[]> {
  const q = normalize(query);
  if (!q) return [];
  const { rows } = await pool.query<GuestRow>(`select ${columns} from guests`);

  const scored = rows
    .map((row) => {
      const fields = [row.name, row.instagram, ...row.nicknames].filter((f): f is string => !!f).map(normalize);
      const words = fields.flatMap((f) => f.split(/[\s._-]+/));
      let score = 0;
      if (fields.some((f) => f === q)) score = 3;
      else if (words.some((w) => w.startsWith(q)) || fields.some((f) => f.startsWith(q))) score = 2;
      else if (fields.some((f) => f.includes(q))) score = 1;
      return { row, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || toPublic(a.row).nickname.localeCompare(toPublic(b.row).nickname));

  return scored.slice(0, limit).map((r) => toPublic(r.row));
}

export async function getGuest(id: string): Promise<PublicGuest | null> {
  const { rows } = await pool.query<GuestRow>(`select ${columns} from guests where id = $1`, [id]);
  return rows[0] ? toPublic(rows[0]) : null;
}

export async function getGuests(ids: string[]): Promise<PublicGuest[]> {
  if (ids.length === 0) return [];
  const { rows } = await pool.query<GuestRow>(`select ${columns} from guests where id = any($1)`, [ids]);
  const byId = new Map(rows.map((r) => [r.id, toPublic(r)]));
  return ids.map((id) => byId.get(id)).filter((g): g is PublicGuest => !!g);
}

// Todo el evento (sin cupos pendientes), para sortear nombres en modo rápido.
export async function listEventGuests(): Promise<PublicGuest[]> {
  const { rows } = await pool.query<GuestRow>(`select ${columns} from guests where not placeholder`);
  return rows.map(toPublic);
}
