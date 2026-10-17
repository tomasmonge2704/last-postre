import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { listRooms } from "@/lib/rooms";
import { VerdadReto } from "./VerdadReto";

async function Game() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const rooms = await listRooms(me.id);
  return <VerdadReto me={me} rooms={rooms} />;
}

export default function VerdadRetoPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-flan via-caramelo to-dulce">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Game />
      </Suspense>
    </main>
  );
}
