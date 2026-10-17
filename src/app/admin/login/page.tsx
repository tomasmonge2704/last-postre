"use client";

import { useActionState } from "react";
import { adminLogin } from "../actions";

export default function AdminLoginPage() {
  const [error, action, pending] = useActionState(adminLogin, null);
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-20 text-cafe">
      <h1 className="wordmark animate-pop-in text-center text-6xl text-flan">
        Postre
        <span className="block text-3xl text-crema">admin</span>
      </h1>
      <form action={action} className="mt-10 flex flex-col gap-4">
        <input
          name="pin"
          type="password"
          inputMode="text"
          autoFocus
          placeholder="PIN del anfitrión"
          className="rounded-full border-2 border-cafe bg-vainilla px-5 py-3.5 text-center text-lg font-semibold shadow-[0_4px_0_var(--color-cafe)] outline-none placeholder:text-cafe/40"
        />
        {error && <p className="text-center font-semibold text-frutilla">{error}</p>}
        <button
          disabled={pending}
          className="rounded-full bg-chocolate py-4 text-lg font-bold text-crema active:translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar 🔐"}
        </button>
      </form>
    </main>
  );
}
