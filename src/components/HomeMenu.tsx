"use client";

import Link from "next/link";
import { useState } from "react";
import { leave } from "@/app/actions";

const items = [
  { href: "/#juegos", label: "Juegos", emoji: "🎲" },
  { href: "/match", label: "Matcheá con alguien", emoji: "💘" },
  { href: "/social", label: "Social", emoji: "👀" },
  { href: "/salas", label: "Armar sala", emoji: "🎉" },
];

export function HomeMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menú"
        className="grid size-11 place-items-center rounded-full bg-crema/10 text-2xl text-crema"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-20 bg-chocolate/60" onClick={() => setOpen(false)}>
          <nav
            onClick={(e) => e.stopPropagation()}
            className="animate-pop-in absolute top-4 left-4 w-64 overflow-hidden rounded-3xl bg-chocolate text-crema shadow-[0_6px_0_var(--color-cafe)]"
          >
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-crema/10 px-5 py-4 text-lg font-bold active:bg-crema/10"
              >
                <span className="text-2xl">{i.emoji}</span>
                {i.label}
              </Link>
            ))}
            <form action={leave}>
              <button className="w-full px-5 py-3 text-left text-sm font-semibold text-crema/50">No soy yo, salir</button>
            </form>
          </nav>
        </div>
      )}
    </>
  );
}
