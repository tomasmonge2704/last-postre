import type { NextRequest } from "next/server";
import { searchGuests } from "@/lib/guests";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  return Response.json(await searchGuests(q));
}
