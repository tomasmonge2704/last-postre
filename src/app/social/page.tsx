import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { listEventGuests } from "@/lib/guests";
import { noteCounts } from "@/lib/social";
import { SocialList } from "./SocialList";

async function Social() {
  const me = await getCurrentGuest();
  if (!me) redirect("/entrar");
  const [guests, counts] = await Promise.all([listEventGuests(), noteCounts()]);
  guests.sort((a, b) => a.nickname.localeCompare(b.nickname));
  return <SocialList meId={me.id} guests={guests} counts={counts} />;
}

export default function SocialPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-4 pb-10">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Social />
      </Suspense>
    </main>
  );
}
