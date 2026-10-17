import { Suspense } from "react";
import { yoNuncaCards } from "@/lib/cards";
import { YoNunca } from "./YoNunca";

async function Game() {
  return <YoNunca cards={await yoNuncaCards()} />;
}

export default function YoNuncaPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<p className="m-auto text-4xl">🙈</p>}>
        <Game />
      </Suspense>
    </main>
  );
}
