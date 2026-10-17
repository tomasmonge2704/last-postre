import { getCurrentGuest } from "@/lib/session";
import { isSingle, sealMyMatches } from "@/lib/match";
import { sealNotesAboutMe } from "@/lib/social";

// Renueva las consultas en vivo de los avisos (vencen al minuto). Solo las tuyas.
export async function POST(request: Request) {
  const { kind } = (await request.json()) as { kind: "matches" | "notes" };
  const me = await getCurrentGuest();
  if (!me) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (kind === "notes") return Response.json(await sealNotesAboutMe(me.id));
  if (kind === "matches" && isSingle(me)) return Response.json(await sealMyMatches(me.id));
  return Response.json({ error: "No autorizado" }, { status: 403 });
}
