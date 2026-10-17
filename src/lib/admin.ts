import { pool } from "@/lib/db";

export const ADMIN_COOKIE = "postre_admin";

export type AdminGuest = {
  id: string;
  name: string | null;
  nicknames: string[];
  instagram: string | null;
  instagramName: string | null;
  gender: "m" | "f";
  avatarUrl: string | null;
  tags: string[];
  relationshipStatus: "single" | "taken";
  partnerId: string | null;
  friendGroups: string[];
  placeholder: boolean;
  sheetLabel: string | null;
  candidates: number;
};

export type IgCandidate = { username: string; fullName: string | null; picUrl: string };

type Row = {
  id: string;
  name: string | null;
  nicknames: string[];
  instagram: string | null;
  instagram_name: string | null;
  gender: "m" | "f";
  avatar_url: string | null;
  tags: string[];
  relationship_status: "single" | "taken";
  partner_id: string | null;
  friend_groups: string[];
  placeholder: boolean;
  sheet_label: string | null;
  candidates: number;
};

const select = `
  select g.id, g.name, g.nicknames, g.instagram, g.instagram_name, g.gender, g.avatar_url, g.tags,
         g.relationship_status, g.partner_id, g.friend_groups, g.placeholder, g.sheet_label,
         (select count(*)::int from ig_candidates c where c.guest_id = g.id) as candidates
  from guests g`;

function toAdmin(r: Row): AdminGuest {
  return {
    id: r.id,
    name: r.name,
    nicknames: r.nicknames,
    instagram: r.instagram,
    instagramName: r.instagram_name,
    gender: r.gender,
    avatarUrl: r.avatar_url,
    tags: r.tags,
    relationshipStatus: r.relationship_status,
    partnerId: r.partner_id,
    friendGroups: r.friend_groups,
    placeholder: r.placeholder,
    sheetLabel: r.sheet_label,
    candidates: r.candidates,
  };
}

export async function listAdminGuests() {
  const { rows } = await pool.query<Row>(`${select} order by g.gender desc, g.nicknames[1]`);
  return rows.map(toAdmin);
}

export async function getAdminGuest(id: string) {
  const { rows } = await pool.query<Row>(`${select} where g.id = $1`, [id]);
  return rows[0] ? toAdmin(rows[0]) : null;
}

export async function getCandidates(id: string): Promise<IgCandidate[]> {
  const { rows } = await pool.query<{ username: string; full_name: string | null; pic_url: string }>(
    "select username, full_name, pic_url from ig_candidates where guest_id = $1 order by username",
    [id],
  );
  return rows.map((r) => ({ username: r.username, fullName: r.full_name, picUrl: r.pic_url }));
}

export async function listFriendGroups() {
  const { rows } = await pool.query<{ group: string; count: number }>(
    `select unnest(friend_groups) as group, count(*)::int as count from guests group by 1 order by 2 desc, 1`,
  );
  return rows;
}
