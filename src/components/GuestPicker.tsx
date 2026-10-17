"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicGuest } from "@/lib/guests";
import { Avatar } from "@/components/Avatar";

type Props =
  | { mode: "single"; onPick: (guest: PublicGuest) => void; autoFocus?: boolean; placeholder?: string }
  | {
      mode: "multi";
      selected: PublicGuest[];
      onChange: (guests: PublicGuest[]) => void;
      autoFocus?: boolean;
      placeholder?: string;
    };

// Buscador de invitados compartido: login (single) y armado de grupos/salas (multi).
export function GuestPicker(props: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ query: string; guests: PublicGuest[] }>({ query: "", guests: [] });
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    const id = ++requestId.current;
    if (!q) return;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/guests/search?q=${encodeURIComponent(q)}`);
      const guests: PublicGuest[] = await res.json();
      if (id === requestId.current) setResults({ query: q, guests });
    }, 120);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedIds = new Set(props.mode === "multi" ? props.selected.map((g) => g.id) : []);
  const q = query.trim();
  const loading = q !== "" && results.query !== q;
  const visible = q ? results.guests : [];

  function pick(guest: PublicGuest) {
    if (props.mode === "single") return props.onPick(guest);
    props.onChange(
      selectedIds.has(guest.id) ? props.selected.filter((g) => g.id !== guest.id) : [...props.selected, guest],
    );
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-3">
      {props.mode === "multi" && props.selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {props.selected.map((g) => (
            <button
              key={g.id}
              onClick={() => pick(g)}
              className="flex items-center gap-1.5 rounded-full bg-chocolate py-1 pr-3 pl-1 text-sm font-semibold text-crema"
            >
              <Avatar guest={g} size={26} />
              {g.nickname}
              <span className="text-crema/50">✕</span>
            </button>
          ))}
        </div>
      )}

      <label className="flex items-center gap-3 rounded-full border-2 border-cafe bg-vainilla px-5 py-3.5 text-cafe shadow-[0_4px_0_var(--color-cafe)]">
        <span className="text-xl">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={props.autoFocus}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={props.placeholder ?? "Tu nombre, apodo o @instagram"}
          className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-cafe/40"
        />
        {loading && <span className="animate-spin">🍮</span>}
      </label>

      {visible.length > 0 && (
        <ul className="overflow-hidden rounded-3xl bg-chocolate text-crema">
          {visible.map((g) => (
            <li key={g.id} className="border-b border-crema/10 last:border-none">
              <button onClick={() => pick(g)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-crema/5">
                <Avatar guest={g} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{g.nickname}</p>
                  <p className="truncate text-sm text-crema/60">
                    {[g.instagram && `@${g.instagram}`, g.name].filter(Boolean).join(" · ") || "Sin datos todavía"}
                  </p>
                </div>
                {props.mode === "multi" && (
                  <span className={selectedIds.has(g.id) ? "text-frutilla" : "text-crema/30"}>
                    {selectedIds.has(g.id) ? "✓" : "+"}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {q && !loading && visible.length === 0 && (
        <p className="text-center text-sm text-cafe/70">Nadie con ese nombre en la lista 🤔</p>
      )}
    </div>
  );
}
