import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { CompleteForm } from "./CompleteForm";

async function Complete() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  if (!me.placeholder) redirect("/");
  return <CompleteForm slot={me.nickname} gender={me.gender} />;
}

export default function CompletarPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-16 pb-10 text-cafe">
      <h1 className="wordmark animate-pop-in text-center text-6xl text-flan">
        ¡Bienvenida!
        <span className="block text-3xl text-crema">contanos quién sos</span>
      </h1>
      <Suspense>
        <Complete />
      </Suspense>
    </main>
  );
}
