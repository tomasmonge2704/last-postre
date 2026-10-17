import { Suspense } from "react";
import { listAdminGuests } from "@/lib/admin";
import { AdminList } from "./AdminList";

async function Guests() {
  return <AdminList guests={await listAdminGuests()} />;
}

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-6 pb-10 text-cafe">
      <Suspense fallback={<p className="m-auto text-4xl">🍮</p>}>
        <Guests />
      </Suspense>
    </main>
  );
}
