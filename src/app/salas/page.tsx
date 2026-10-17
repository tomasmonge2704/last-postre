import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { listRooms } from "@/lib/rooms";
import { RoomsList } from "./RoomsList";

async function Rooms() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  return <RoomsList me={me} rooms={await listRooms(me.id, 100)} />;
}

export default function SalasPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-4 pb-10 text-cafe">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Rooms />
      </Suspense>
    </main>
  );
}
