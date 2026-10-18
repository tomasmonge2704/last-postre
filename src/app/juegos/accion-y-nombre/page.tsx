import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { listRooms } from "@/lib/rooms";
import { accionCards } from "@/lib/cards";
import { AccionNombre } from "./AccionNombre";

async function Game() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const [rooms, acciones] = await Promise.all([listRooms(me.id), accionCards()]);
  return <AccionNombre me={me} rooms={rooms} acciones={acciones} />;
}

export default function AccionNombrePage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-vainilla via-flan to-caramelo">
      <Suspense fallback={<p className="m-auto text-4xl">💃</p>}>
        <Game />
      </Suspense>
    </main>
  );
}
