import "server-only";
import { pool } from "@/lib/db";

export const isIgPicUrl = (url: string) => /^https:\/\/[^/]*(cdninstagram\.com|fbcdn\.net)\//.test(url);

export type IgResult = { username: string; fullName: string | null; hint: string | null; pic: string };

// Busca en IG a través del Chromium logueado en la compu de casa (ver scripts/ig-proxy).
export async function igSearch(query: string): Promise<IgResult[]> {
  const base = process.env.IG_PROXY_URL;
  if (!base) throw new Error("Falta configurar IG_PROXY_URL");
  const res = await fetch(`${base}/search?q=${encodeURIComponent(query)}`, {
    headers: { authorization: `Bearer ${process.env.IG_PROXY_TOKEN}` },
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);
  if (!res) throw new Error("El buscador de IG no responde (¿está prendida la compu?)");
  const body = (await res.json().catch(() => ({}))) as { results?: IgResult[]; error?: string };
  if (!res.ok || !body.results) throw new Error(body.error ?? "Falló la búsqueda en IG");
  return body.results;
}

// Baja la foto de IG a la base y guarda @ + nombre (desde candidatos o desde el buscador).
export async function saveInstagram(id: string, username: string, fullName: string | null, picUrl: string) {
  const res = await fetch(picUrl);
  if (!res.ok) throw new Error("No se pudo bajar la foto (el link de Instagram puede haber vencido)");
  const bytes = Buffer.from(await res.arrayBuffer());

  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      `insert into guest_avatars (guest_id, content_type, bytes) values ($1, $2, $3)
       on conflict (guest_id) do update set content_type = excluded.content_type, bytes = excluded.bytes, updated_at = now()`,
      [id, res.headers.get("content-type") ?? "image/jpeg", bytes],
    );
    await client.query(
      "update guests set instagram = $2, instagram_name = $3, avatar_url = $4 where id = $1",
      [id, username, fullName, `/api/avatars/${id}?v=${Date.now()}`],
    );
    await client.query("delete from ig_candidates where guest_id = $1", [id]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

