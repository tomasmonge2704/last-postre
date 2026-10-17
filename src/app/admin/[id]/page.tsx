import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminGuest, getCandidates, listAdminGuests, listFriendGroups } from "@/lib/admin";
import { ProfileEditor } from "./ProfileEditor";

async function Editor({ params }: { params: PageProps<"/admin/[id]">["params"] }) {
  const { id } = await params;
  const [guest, candidates, all, groups] = await Promise.all([
    getAdminGuest(id),
    getCandidates(id),
    listAdminGuests(),
    listFriendGroups(),
  ]);
  if (!guest) notFound();
  const others = all
    .filter((g) => g.id !== id)
    .map((g) => ({ id: g.id, nickname: g.nicknames[0] ?? g.id, avatarUrl: g.avatarUrl, gender: g.gender }));
  return <ProfileEditor key={guest.id} guest={guest} candidates={candidates} others={others} groups={groups} />;
}

export default function AdminGuestPage(props: PageProps<"/admin/[id]">) {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-4 pb-28 text-cafe">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Editor params={props.params} />
      </Suspense>
    </main>
  );
}
