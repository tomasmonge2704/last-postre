import Link from "next/link";
import { Suspense } from "react";
import { getCurrentGuest } from "@/lib/session";
import { leave } from "@/app/actions";
import { Avatar } from "@/components/Avatar";

const games = [
  { href: "/juegos/verdad-o-reto", top: "Verdad o", bottom: "reto", emoji: "😈🍮", bg: "from-flan to-caramelo", ready: true },
  { href: "/juegos/espia", top: "¿Quién es", bottom: "el espía?", emoji: "🕵️🍸", bg: "from-caramelo to-frutilla", ready: true },
  { href: "/juegos/accion-y-nombre", top: "Acción y", bottom: "nombre", emoji: "💃🕺", bg: "from-vainilla to-flan", ready: true },
  { href: "/juegos/yo-nunca", top: "Yo", bottom: "nunca", emoji: "🙈🥃", bg: "from-frutilla to-dulce", ready: true },
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
  return (
    <>
      <header className="flex items-center justify-between">
        <span className="w-24" />
        <h1 className="wordmark text-4xl text-flan">Postre</h1>
        <form action={leave} className="flex w-24 justify-end">
          <button className="flex items-center gap-1 rounded-full bg-crema/10 py-1 pr-1 pl-3 text-xs whitespace-nowrap text-crema/70">
            No soy yo <Avatar guest={me} size={30} />
          </button>
        </form>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Para vos, {me.nickname} 🍮</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {games.map((g) => (
            <Link
              key={g.top + g.bottom}
              href={g.href}
              aria-disabled={!g.ready}
              className={`relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl border-2 border-crema/40 bg-gradient-to-b ${g.bg} p-3 shadow-[0_5px_0_var(--color-cafe)] transition active:translate-y-1 active:shadow-none ${g.ready ? "" : "pointer-events-none opacity-60"}`}
            >
              <span className="mt-2 text-center text-5xl leading-tight">{g.emoji}</span>
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
    <main className="flex flex-1 flex-col px-4 pt-4 pb-28">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Home />
      </Suspense>
      <Link
        href="/salas"
        className="fixed inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-gradient-to-r from-caramelo to-frutilla px-8 py-4 text-lg font-bold text-crema shadow-[0_6px_0_var(--color-cafe)]"
      >
        Armar sala 🎉
      </Link>
    </main>
  );
}
