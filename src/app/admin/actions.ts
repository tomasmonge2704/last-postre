"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE } from "@/lib/admin";

async function assertAdmin() {
  const pin = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) throw new Error("No autorizado");
}

const clean = (values: string[]) =>
  [...new Set(values.map((v) => v.trim()).filter(Boolean))];

const slugGroup = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function adminLogin(_prev: string | null, form: FormData) {
  if (form.get("pin") !== process.env.ADMIN_PIN) return "PIN incorrecto 🙅";
  (await cookies()).set(ADMIN_COOKIE, String(form.get("pin")), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
  redirect("/admin");
}

export type ProfileInput = {
  nicknames: string[];
  name: string;
  gender: "m" | "f";
  relationshipStatus: "single" | "taken";
  partnerId: string | null;
  friendGroups: string[];
  tags: string[];
  instagram: string;
};

export async function saveProfile(id: string, input: ProfileInput) {
  await assertAdmin();
  const nicknames = clean(input.nicknames);
  if (!nicknames.length) throw new Error("Tiene que tener al menos un apodo");
  const partnerId = input.relationshipStatus === "taken" ? input.partnerId || null : null;

  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ partner_id: string | null }>("select partner_id from guests where id = $1", [id]);
    const previousPartner = rows[0]?.partner_id ?? null;
    await client.query(
      `update guests set nicknames = $2, name = $3, gender = $4, relationship_status = $5, partner_id = $6,
         friend_groups = $7, tags = $8, instagram = $9 where id = $1`,
      [id, nicknames, input.name.trim() || null, input.gender, input.relationshipStatus, partnerId,
       clean(input.friendGroups.map(slugGroup)), clean(input.tags), input.instagram.trim().replace(/^@/, "") || null],
    );
    // La pareja es simétrica: si A está con B, B está con A.
    if (previousPartner && previousPartner !== partnerId) {
      await client.query(
        "update guests set relationship_status = 'single', partner_id = null where id = $1 and partner_id = $2",
        [previousPartner, id],
      );
    }
    if (partnerId) {
      await client.query("update guests set relationship_status = 'taken', partner_id = $2 where id = $1", [partnerId, id]);
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
  revalidatePath("/admin");
}

// Elegir un candidato de Instagram: guarda @, nombre IG y baja la foto a la base.
export async function pickCandidate(id: string, username: string) {
  await assertAdmin();
  const { rows } = await pool.query<{ full_name: string | null; pic_url: string }>(
    "select full_name, pic_url from ig_candidates where guest_id = $1 and username = $2",
    [id, username],
  );
  const candidate = rows[0];
  if (!candidate) throw new Error("Candidato no encontrado");

  const res = await fetch(candidate.pic_url);
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
      [id, username, candidate.full_name, `/api/avatars/${id}?v=${Date.now()}`],
    );
    await client.query("delete from ig_candidates where guest_id = $1", [id]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
  revalidatePath("/admin");
}

export async function discardCandidates(id: string) {
  await assertAdmin();
  await pool.query("delete from ig_candidates where guest_id = $1", [id]);
  revalidatePath("/admin");
}

// Para los que se bajaron: lo saca de salas, partidas y parejas.
export async function deleteGuest(id: string) {
  await assertAdmin();
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("update guests set relationship_status = 'single', partner_id = null where partner_id = $1", [id]);
    await client.query("update rooms set guest_ids = array_remove(guest_ids, $1)", [id]);
    await client.query("delete from spy_matches where host_id = $1", [id]);
    await client.query("delete from spy_roles where guest_id = $1", [id]);
    await client.query("delete from spy_players where guest_id = $1", [id]);
    await client.query("delete from guests where id = $1", [id]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
  revalidatePath("/admin");
  redirect("/admin");
}
