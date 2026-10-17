import { pool } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query("select now() as now, version() as version");
    return Response.json({ ok: true, db: rows[0] });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
