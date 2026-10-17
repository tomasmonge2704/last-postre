// Uso: npm run db:seed            → solo agrega invitados nuevos (no pisa lo editado en /admin)
//      npm run db:seed -- --force → reemplaza todo con data/guests.json
// Aplica db/*.sql, upsertea data/guests.json, sube public/avatars/*.jpg y data/ig-pending.json.
// Ojo: la base es la fuente de verdad una vez que se edita desde /admin. `npm run db:export` baja los cambios al JSON.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { Client } from "pg";
import type { Guest } from "../src/lib/guests.ts";

const force = process.argv.includes("--force");
const guests: Guest[] = JSON.parse(readFileSync("data/guests.json", "utf8"));
const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();

for (const file of readdirSync("db").filter((f) => f.endsWith(".sql")).sort()) {
  await client.query(readFileSync(`db/${file}`, "utf8"));
  console.log(`applied ${file}`);
}

await client.query("begin");
const ids = guests.map((g) => g.id);
if (force) await client.query("delete from guests where not (id = any($1))", [ids]);
for (const g of guests) {
  await client.query(
    `insert into guests (id, name, nicknames, instagram, instagram_name, phone, gender, avatar_url, tags,
       relationship_status, partner_id, friend_groups, knows, fun_facts, placeholder, sheet_label)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     on conflict (id) do ${force ? `update set
       name = excluded.name, nicknames = excluded.nicknames, instagram = excluded.instagram,
       instagram_name = excluded.instagram_name, phone = excluded.phone, gender = excluded.gender,
       tags = excluded.tags, relationship_status = excluded.relationship_status,
       partner_id = excluded.partner_id, friend_groups = excluded.friend_groups, knows = excluded.knows,
       fun_facts = excluded.fun_facts, placeholder = excluded.placeholder, sheet_label = excluded.sheet_label`
       : "nothing"}`,
    [g.id, g.name, g.nicknames, g.instagram?.replace(/^@/, "") ?? null, g.instagramName ?? null,
     g.phone ?? null, g.gender, g.avatarUrl ?? null, g.tags, g.relationship.status, g.relationship.partnerId ?? null,
     g.friendGroups, g.knows, g.funFacts, g.placeholder, g.sheetLabel],
  );
}

for (const file of existsSync("public/avatars") ? readdirSync("public/avatars") : []) {
  const id = file.replace(/\.jpg$/, "");
  if (!ids.includes(id)) continue;
  await client.query(
    `insert into guest_avatars (guest_id, content_type, bytes) values ($1, 'image/jpeg', $2)
     on conflict (guest_id) do ${force ? "update set bytes = excluded.bytes, updated_at = now()" : "nothing"}`,
    [id, readFileSync(`public/avatars/${file}`)],
  );
}

await client.query(
  `update guests g set avatar_url = '/api/avatars/' || g.id
   where exists (select 1 from guest_avatars a where a.guest_id = g.id)`,
);

if (existsSync("data/ig-pending.json")) {
  const pending: Record<string, { u: string; full: string | null; pic: string }[]> = JSON.parse(
    readFileSync("data/ig-pending.json", "utf8"),
  );
  for (const [id, cands] of Object.entries(pending)) {
    for (const c of cands) {
      await client.query(
        `insert into ig_candidates (guest_id, username, full_name, pic_url) values ($1,$2,$3,$4)
         on conflict do nothing`,
        [id, c.u, c.full, c.pic],
      );
    }
  }
}
await client.query("commit");
console.log(`seeded ${guests.length} guests`);
await client.end();
