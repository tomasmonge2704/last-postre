import type { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE } from "@/lib/admin";

// Instagram bloquea las fotos embebidas desde otro origen (CORP): las servimos desde acá.
export async function GET(request: NextRequest) {
  if (!process.env.ADMIN_PIN || request.cookies.get(ADMIN_COOKIE)?.value !== process.env.ADMIN_PIN) {
    return new Response("No autorizado", { status: 401 });
  }
  const guestId = request.nextUrl.searchParams.get("guest");
  const username = request.nextUrl.searchParams.get("u");
  const { rows } = await pool.query<{ pic_url: string }>(
    "select pic_url from ig_candidates where guest_id = $1 and username = $2",
    [guestId, username],
  );
  if (!rows[0]) return new Response("Not found", { status: 404 });
  const res = await fetch(rows[0].pic_url);
  if (!res.ok) return new Response("Foto vencida", { status: 502 });
  return new Response(res.body, {
    headers: { "content-type": res.headers.get("content-type") ?? "image/jpeg", "cache-control": "private, max-age=3600" },
  });
}
