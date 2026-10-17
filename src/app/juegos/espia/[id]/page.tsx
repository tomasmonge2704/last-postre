import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { getMatchForMember, joinMatch, sealMatch } from "@/lib/games/espia";
import { SpyMatch } from "./SpyMatch";

async function Match({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const match = await getMatchForMember(id, me.id);
  if (!match) notFound();
  await joinMatch(id, me.id);
  const [matchQ, playersQ, meQ] = await sealMatch(id, me.id);
  return (
    <SpyMatch
      me={me}
      matchId={id}
      realtimeUrl={process.env.NEON_REALTIME_URL!}
      sealed={{ match: matchQ, players: playersQ, me: meQ }}
    />
  );
}

export default function SpyMatchPage({ params }: PageProps<"/juegos/espia/[id]">) {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-caramelo via-dulce to-frutilla">
      <Suspense fallback={<p className="m-auto text-4xl">🕵️</p>}>
        <Match params={params} />
      </Suspense>
    </main>
  );
}
