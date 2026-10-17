import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { listRooms } from "@/lib/rooms";
import { listOpenMatches } from "@/lib/games/espia";
import { EspiaSetup } from "./EspiaSetup";

async function Setup() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const [rooms, open] = await Promise.all([listRooms(me.id), listOpenMatches(me.id)]);
  return <EspiaSetup me={me} rooms={rooms} openMatches={open} />;
}

export default function EspiaPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-caramelo via-dulce to-frutilla">
      <Suspense fallback={<p className="m-auto text-4xl">🕵️</p>}>
        <Setup />
      </Suspense>
    </main>
  );
}
