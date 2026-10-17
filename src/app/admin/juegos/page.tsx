import { Suspense } from "react";
import { listAllCards, type Game } from "@/lib/cards";
import { AdminTabs } from "../AdminTabs";
import { CardsEditor } from "./CardsEditor";

const games: Game[] = ["verdad-reto", "yo-nunca", "accion-nombre"];

async function Cards({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const requested = (await searchParams).game as Game | undefined;
  const game = requested && games.includes(requested) ? requested : "verdad-reto";
  return <CardsEditor key={game} game={game} cards={await listAllCards(game)} />;
}

export default function AdminJuegosPage(props: PageProps<"/admin/juegos">) {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-6 pb-10 text-cafe">
      <AdminTabs current="/admin/juegos" />
      <Suspense fallback={<p className="m-auto text-4xl">🎲</p>}>
        <Cards searchParams={props.searchParams as Promise<{ game?: string }>} />
      </Suspense>
    </main>
  );
}
