"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminGuest } from "@/lib/admin";
import { Avatar } from "@/components/Avatar";
import { GuestBadges } from "./GuestBadges";

const filters = {
  todos: { label: "Todos", test: () => true },
  m: { label: "👨", test: (g: AdminGuest) => g.gender === "m" },
  f: { label: "👩", test: (g: AdminGuest) => g.gender === "f" },
  sinIg: { label: "Sin IG", test: (g: AdminGuest) => !g.instagram },
  dudosos: { label: "🤔 Elegir IG", test: (g: AdminGuest) => g.candidates > 0 },
  novios: { label: "💍", test: (g: AdminGuest) => g.relationshipStatus === "taken" },
} as const;

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^@/, "");

export function AdminList({ guests }: { guests: AdminGuest[] }) {
  const [filter, setFilter] = useState<keyof typeof filters>("todos");
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const visible = guests.filter(
    (g) =>
      filters[filter].test(g) &&
      (!q ||
        [g.name, g.instagram, g.instagramName, ...g.nicknames, ...g.friendGroups]
          .filter((f): f is string => !!f)
          .some((f) => normalize(f).includes(q))),
  );
  const withIg = guests.filter((g) => g.instagram).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="wordmark text-5xl text-flan">Perfiles</h1>
        <p className="pb-1 text-sm font-semibold text-cafe/70">
          {guests.length} invitados · {withIg} con IG
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-full border-2 border-cafe bg-vainilla px-5 py-3 shadow-[0_4px_0_var(--color-cafe)]">
        <span className="text-xl">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Apodo, nombre, @ o grupo"
          className="w-full bg-transparent font-semibold outline-none placeholder:text-cafe/40"
        />
      </label>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {Object.entries(filters).map(([key, f]) => (
          <button
            key={key}
            onClick={() => setFilter(key as keyof typeof filters)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              filter === key ? "bg-chocolate text-crema" : "bg-crema/70 text-cafe"
            }`}
          >
            {f.label} <span className="opacity-60">{guests.filter(f.test).length}</span>
          </button>
        ))}
      </div>

      <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
        {visible.map((g) => (
          <li key={g.id} className="border-b border-crema/10 last:border-none">
            <Link href={`/admin/${g.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-crema/5">
              <Avatar guest={{ id: g.id, nickname: g.nicknames[0] ?? g.id, avatarUrl: g.avatarUrl }} size={52} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {g.nicknames[0]}
                  {g.nicknames.length > 1 && <span className="text-crema/50"> · {g.nicknames.slice(1).join(", ")}</span>}
                </p>
                <p className="mb-1 truncate text-sm text-crema/60">
                  {g.instagram ? `@${g.instagram}` : "sin Instagram"}
                  {g.name && ` · ${g.name}`}
                </p>
                <GuestBadges guest={g} />
              </div>
              {g.candidates > 0 && (
                <span className="rounded-full bg-frutilla px-2 py-0.5 text-xs font-bold">{g.candidates}</span>
              )}
              <span className="text-crema/30">›</span>
            </Link>
          </li>
        ))}
        {visible.length === 0 && <li className="px-4 py-6 text-center text-crema/60">Nadie por acá 🤷</li>}
      </ul>
    </div>
  );
}
