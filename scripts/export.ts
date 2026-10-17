// Uso: npm run db:export  → vuelca los perfiles editados en /admin a data/guests.json
import { writeFileSync } from "node:fs";
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();
const { rows } = await client.query(
  `select g.*, (a.guest_id is not null) as has_avatar from guests g
   left join guest_avatars a on a.guest_id = g.id order by g.gender desc, g.sheet_label`,
);
const guests = rows.map((r) => ({
  id: r.id,
  nicknames: r.nicknames,
  name: r.name,
  instagram: r.instagram,
  instagramName: r.instagram_name,
  gender: r.gender,
  avatarUrl: r.has_avatar ? `/api/avatars/${r.id}` : null,
  tags: r.tags,
  relationship: { status: r.relationship_status, ...(r.partner_id ? { partnerId: r.partner_id } : {}) },
  friendGroups: r.friend_groups,
  knows: r.knows,
  funFacts: r.fun_facts,
  placeholder: r.placeholder,
  sheetLabel: r.sheet_label,
}));
writeFileSync("data/guests.json", JSON.stringify(guests, null, 2) + "\n");
console.log(`exported ${guests.length} guests`);
await client.end();
