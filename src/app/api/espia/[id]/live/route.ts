import { getCurrentGuest } from "@/lib/session";
import { getMatchForMember, sealFor, type LiveKind } from "@/lib/games/espia";

const kinds: LiveKind[] = ["match", "players", "me"];

// Renueva las consultas en vivo (vencen al minuto). Solo para integrantes de la sala.
export async function POST(request: Request, ctx: RouteContext<"/api/espia/[id]/live">) {
  const { id } = await ctx.params;
  const { kind } = (await request.json()) as { kind: LiveKind };
  const me = await getCurrentGuest();
  if (!me || !kinds.includes(kind)) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!(await getMatchForMember(id, me.id))) return Response.json({ error: "No estás en esta sala" }, { status: 403 });
  return Response.json(await sealFor(kind, id, me.id));
}
