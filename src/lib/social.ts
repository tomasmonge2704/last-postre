import { rawSql } from "@neon/realtime/server";
import { pool } from "@/lib/db";
import { realtime } from "@/lib/realtime";

export type NoteKind = "apodo" | "comentario";

export type GuestNote = {
  id: string;
  kind: NoteKind;
  body: string;
  createdAt: string;
  author: { id: string; nickname: string; avatarUrl: string | null };
};

type NoteRow = {
  id: string;
  kind: NoteKind;
  body: string;
  created_at: Date;
  author_id: string;
  author_nick: string;
  author_avatar: string | null;
};

export async function listNotes(aboutId: string): Promise<GuestNote[]> {
  const { rows } = await pool.query<NoteRow>(
    `select n.id, n.kind, n.body, n.created_at, n.author_id,
            coalesce(g.nicknames[1], g.name, g.id) as author_nick, g.avatar_url as author_avatar
       from guest_notes n join guests g on g.id = n.author_id
      where n.about_id = $1
      order by n.created_at desc`,
    [aboutId],
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    body: r.body,
    createdAt: r.created_at.toISOString(),
    author: { id: r.author_id, nickname: r.author_nick, avatarUrl: r.author_avatar },
  }));
}

// Cuántos apodos/comentarios tiene cada uno, para la grilla del social.
export async function noteCounts(): Promise<Record<string, number>> {
  const { rows } = await pool.query<{ about_id: string; n: number }>(
    `select about_id, count(*)::int as n from guest_notes group by about_id`,
  );
  return Object.fromEntries(rows.map((r) => [r.about_id, r.n]));
}

export async function addNote(input: { aboutId: string; authorId: string; kind: NoteKind; body: string }) {
  await pool.query(`insert into guest_notes (about_id, author_id, kind, body) values ($1, $2, $3, $4)`, [
    input.aboutId,
    input.authorId,
    input.kind,
    input.body,
  ]);
}

// Lo puede borrar quien lo escribió o a quien se lo dejaron.
export async function deleteNote(id: string, guestId: string) {
  await pool.query(`delete from guest_notes where id = $1 and (author_id = $2 or about_id = $2)`, [id, guestId]);
}

// En vivo: lo que te dejan en tu perfil (para el aviso flotante).
export type LiveNoteRow = { id: string; kind: NoteKind; body: string; author_nick: string; author_avatar: string | null; author_id: string };

export const notesAboutMeQuery = (meId: string) =>
  rawSql<LiveNoteRow>(
    `SELECT n.id::text AS id, n.kind, n.body, n.author_id,
            coalesce(g.nicknames[1], g.name, g.id) AS author_nick, g.avatar_url AS author_avatar
     FROM guest_notes n JOIN guests g ON g.id = n.author_id
     WHERE n.about_id = $1`,
    [meId],
  );

export const sealNotesAboutMe = (meId: string) => realtime.seal({ query: notesAboutMeQuery(meId) });
