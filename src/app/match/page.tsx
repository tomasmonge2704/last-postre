import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { getGuests } from "@/lib/guests";
import { getMatchPref, isSingle, listDeck, listMatchIds } from "@/lib/match";
import { Swiper } from "./Swiper";
import { ChoosePref } from "./ChoosePref";

async function Match() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  if (!isSingle(me)) {
    return (
      <div className="m-auto flex flex-col items-center gap-4 text-center">
        <p className="text-7xl">💍</p>
        <p className="wordmark text-4xl text-flan">Estás de novio/a</p>
        <p className="max-w-64 text-crema/70">Esto es solo para los solteros de la previa. Andá a jugar algo 😉</p>
        <Link href="/" className="mt-2 rounded-full bg-crema/10 px-6 py-3 font-bold">Volver</Link>
      </div>
    );
  }
  const pref = await getMatchPref(me.id);
  if (!pref) return <ChoosePref />;
  const [deck, matches] = await Promise.all([listDeck(me.id, pref), listMatchIds(me.id).then(getGuests)]);
  return <Swiper me={me} deck={deck} matches={matches} />;
}

export default function MatchPage() {
  return (
    <main className="flex flex-1 flex-col overflow-hidden px-4 pt-4 pb-8">
      <Suspense fallback={<p className="m-auto text-4xl">💘</p>}>
        <Match />
      </Suspense>
    </main>
  );
}
