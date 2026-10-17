import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin";
import { SESSION_COOKIE } from "@/lib/session";
import { isIgPicUrl } from "@/lib/instagram";

// Fotos de resultados del buscador de IG (Instagram bloquea embeberlas desde otro origen).
export async function GET(request: NextRequest) {
  const isAdmin = !!process.env.ADMIN_PIN && request.cookies.get(ADMIN_COOKIE)?.value === process.env.ADMIN_PIN;
  if (!isAdmin && !request.cookies.get(SESSION_COOKIE)) return new Response("No autorizado", { status: 401 });
  const url = request.nextUrl.searchParams.get("url") ?? "";
  if (!isIgPicUrl(url)) return new Response("Not found", { status: 404 });
  const res = await fetch(url);
  if (!res.ok) return new Response("Foto vencida", { status: 502 });
  return new Response(res.body, {
    headers: { "content-type": res.headers.get("content-type") ?? "image/jpeg", "cache-control": "private, max-age=3600" },
  });
}
