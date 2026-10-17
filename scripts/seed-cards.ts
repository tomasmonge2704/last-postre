// Uso: npm run db:cards            → carga data/cards.json solo en los juegos que no tienen cartas
//      npm run db:cards -- --force → borra las cartas y vuelve a cargar todo desde el JSON
// Una vez cargadas, se editan en /admin/juegos (la base es la fuente de verdad).
import { readFileSync } from "node:fs";
import { Client } from "pg";

type Bank = {
  "verdad-reto": { verdad: Record<string, string[]>; reto: Record<string, string[]>; physical: string[] };
  "yo-nunca": Record<string, string[]>;
  "accion-nombre": Record<string, [string, string, boolean?][]>;
};

const force = process.argv.includes("--force");
const bank: Bank = JSON.parse(readFileSync("data/cards.json", "utf8"));
const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();
await client.query(readFileSync("db/010_cards_events.sql", "utf8"));

type Row = { game: string; type: string | null; category: string; text: string; emoji: string | null; physical: boolean };
const rows: Row[] = [];
const physical = new Set(bank["verdad-reto"].physical);
for (const type of ["verdad", "reto"] as const) {
  for (const [category, texts] of Object.entries(bank["verdad-reto"][type])) {
    for (const text of texts) rows.push({ game: "verdad-reto", type, category, text, emoji: null, physical: physical.has(text) });
  }
}
for (const [category, texts] of Object.entries(bank["yo-nunca"])) {
  for (const text of texts) rows.push({ game: "yo-nunca", type: null, category, text, emoji: null, physical: false });
}
for (const [category, list] of Object.entries(bank["accion-nombre"])) {
  for (const [emoji, text, touch] of list) rows.push({ game: "accion-nombre", type: null, category, text, emoji, physical: !!touch });
}

await client.query("begin");
if (force) await client.query("delete from game_cards");
const { rows: existing } = await client.query<{ game: string }>("select distinct game from game_cards");
const skip = new Set(existing.map((r) => r.game));
let added = 0;
for (const r of rows) {
  if (skip.has(r.game)) continue;
  await client.query(
    "insert into game_cards (game, type, category, text, emoji, physical) values ($1, $2, $3, $4, $5, $6)",
    [r.game, r.type, r.category, r.text, r.emoji, r.physical],
  );
  added++;
}
await client.query("commit");
console.log(`${added} cartas cargadas${skip.size ? ` (salteados: ${[...skip].join(", ")})` : ""}`);
await client.end();
