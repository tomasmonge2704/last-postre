import { getCurrentGuest } from "@/lib/session";
import { sealMyMatches } from "@/lib/match";

// Renueva la consulta en vivo de tus matches (vence al minuto).
export async function POST() {
  const me = await getCurrentGuest();
  if (!me) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await sealMyMatches(me.id));
}
