import { pool } from "@/lib/db";

// Edición del propio perfil: el apodo principal reemplaza al primero (los demás quedan para la búsqueda).
export async function updateOwnProfile(id: string, input: { nickname: string; name: string | null }) {
  await pool.query(
    `update guests set nicknames = array[$2::text] || coalesce(nicknames[2:], '{}'), name = $3 where id = $1`,
    [id, input.nickname, input.name],
  );
}

export async function saveAvatar(id: string, contentType: string, bytes: Buffer) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      `insert into guest_avatars (guest_id, content_type, bytes) values ($1, $2, $3)
       on conflict (guest_id) do update set content_type = excluded.content_type, bytes = excluded.bytes, updated_at = now()`,
      [id, contentType, bytes],
    );
    await client.query("update guests set avatar_url = $2 where id = $1", [id, `/api/avatars/${id}?v=${Date.now()}`]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
