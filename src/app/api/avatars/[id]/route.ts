import { pool } from "@/lib/db";

export async function GET(_request: Request, ctx: RouteContext<"/api/avatars/[id]">) {
  const { id } = await ctx.params;
  const { rows } = await pool.query<{ content_type: string; bytes: Buffer }>(
    "select content_type, bytes from guest_avatars where guest_id = $1",
    [id],
  );
  if (!rows[0]) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(rows[0].bytes), {
    headers: {
      "content-type": rows[0].content_type,
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
