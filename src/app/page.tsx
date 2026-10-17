import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { IG_SKIP_COOKIE, getCurrentGuest } from "@/lib/session";
import { leave } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { MatchBadge } from "./LiveNotifications";
import { PushPrompt } from "@/components/PushPrompt";
import { SpicyStrawberry, DevilFlan, LoveMacarons, ShyIceCream, SpyCupcake } from "@/components/DessertArt";
import { HomeMenu } from "@/components/HomeMenu";

const games = [
  { href: "/juegos/verdad-o-reto", top: "Verdad o", bottom: "reto", Art: DevilFlan, bg: "from-flan to-caramelo", ready: true },
  { href: "/juegos/espia", top: "¿Quién es", bottom: "el espía?", Art: SpyCupcake, bg: "from-caramelo to-frutilla", ready: true },
  { href: "/juegos/accion-y-nombre", top: "Acción y", bottom: "nombre", Art: SpicyStrawberry, bg: "from-vainilla to-flan", ready: true },
  { href: "/juegos/yo-nunca", top: "Yo", bottom: "nunca", Art: ShyIceCream, bg: "from-frutilla to-dulce", ready: true },
];

async function Home() {
  const me = await getCurrentGuest();
  if (!me) {
    return (
      <form action={leave} className="m-auto">
        <button className="underline">Tu sesión expiró, volvé a entrar</button>
      </form>
    );
  }
  if (me.placeholder || (!me.instagram && !(await cookies()).has(IG_SKIP_COOKIE))) redirect("/completar");
  return (
    <>
      <header className="flex items-center justify-between">
        <div className="w-24">
          <HomeMenu />
        </div>
        <h1 className="wordmark text-4xl text-flan">Postre</h1>
        <Link href={`/social/${me.id}`} aria-label="Mi perfil" className="flex w-24 justify-end">
          <span className="rounded-full border-2 border-flan">
            <Avatar guest={me} size={38} />
          </span>
        </Link>
      </header>

      <PushPrompt />

      <section className="mt-6">
        <Link
          href="/match"
          className="relative flex items-center justify-between rounded-3xl border-2 border-crema/40 bg-gradient-to-r from-frutilla to-dulce p-4 shadow-[0_5px_0_var(--color-cafe)] transition active:translate-y-1 active:shadow-none"
        >
          <span>
            <span className="wordmark block text-3xl text-crema">Matcheá con alguien</span>
            <span className="mt-1 block text-sm text-crema/80">Solo solteros 😏</span>
          </span>
          <LoveMacarons className="-my-3 w-24 shrink-0" />
          <MatchBadge />
        </Link>
        <h2 id="juegos" className="mt-6 scroll-mt-4 text-xl font-bold">Juegos 🎲</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {games.map((g) => (
            <Link
              key={g.top + g.bottom}
              href={g.href}
              aria-disabled={!g.ready}
              className={`relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl border-2 border-crema/40 bg-gradient-to-b ${g.bg} p-3 shadow-[0_5px_0_var(--color-cafe)] transition active:translate-y-1 active:shadow-none ${g.ready ? "" : "pointer-events-none opacity-60"}`}
            >
              <g.Art className="mx-auto -mt-1 w-[78%] drop-shadow-[0_3px_0_rgba(43,26,16,0.35)]" />
              <p className="wordmark text-center text-[1.6rem] leading-[0.95] text-crema">
                <span className="text-flan">{g.top}</span>
                <br />
                {g.bottom}
              </p>
              {!g.ready && (
                <span className="absolute top-3 right-3 rounded-full bg-chocolate px-2 py-0.5 text-xs font-bold">Pronto</span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-4 pb-10">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Home />
      </Suspense>
    </main>
  );
}
