import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { leave } from "@/app/actions";
import { ConnectInstagram } from "./ConnectInstagram";

async function Complete() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  if (me.instagram && !me.placeholder) redirect("/");
  return (
    <ConnectInstagram
      slot={me.placeholder ? me.nickname : null}
      initial={me.placeholder ? "" : (me.name ?? me.nickname)}
      gender={me.gender}
    />
  );
}

export default function CompletarPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-14 pb-10 text-cafe">
      <h1 className="wordmark animate-pop-in text-center text-6xl text-flan">
        ¿Cuál sos?
        <span className="block text-3xl text-crema">buscate en Instagram</span>
      </h1>
      <Suspense>
        <Complete />
      </Suspense>
      <form action={leave} className="mt-auto pt-6 text-center">
        <button className="py-2 text-sm font-semibold text-cafe/60">← No soy yo, volver a buscarme</button>
      </form>
    </main>
  );
}
