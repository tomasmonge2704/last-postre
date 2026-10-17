import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { getGuest } from "@/lib/guests";
import { listNotes } from "@/lib/social";
import { Avatar } from "@/components/Avatar";
import { NotesWall } from "./NotesWall";
import { PushPrompt } from "@/components/PushPrompt";

async function Profile({ params }: { params: PageProps<"/social/[id]">["params"] }) {
  const { id } = await params;
  const [me, guest] = await Promise.all([getCurrentGuest(), getGuest(id)]);
  if (!me) redirect("/entrar");
  if (!guest || guest.placeholder) notFound();
  const notes = await listNotes(guest.id);
  const isMe = guest.id === me.id;

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/social" className="grid size-10 place-items-center rounded-full bg-crema/10 font-bold">‹</Link>
        <p className="font-bold">{isMe ? "Tu perfil" : "Perfil"}</p>
        <span className="size-10" />
      </div>

      <section className="mt-6 flex flex-col items-center text-center">
        <Avatar guest={guest} size={128} />
        <h1 className="wordmark mt-5 text-5xl text-flan">{guest.nickname}</h1>
        {guest.name && guest.name !== guest.nickname && <p className="mt-3 text-crema/70">{guest.name}</p>}
        {guest.instagram && (
          <a href={`https://instagram.com/${guest.instagram}`} target="_blank" rel="noreferrer" className="mt-1 text-sm font-semibold text-caramelo">
            @{guest.instagram}
          </a>
        )}
      </section>

      {isMe && <PushPrompt />}

      <NotesWall aboutId={guest.id} aboutName={guest.nickname} meId={me.id} isMe={isMe} notes={notes} />
    </>
  );
}

export default function ProfilePage(props: PageProps<"/social/[id]">) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-4 pb-10">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Profile params={props.params} />
      </Suspense>
    </main>
  );
}
