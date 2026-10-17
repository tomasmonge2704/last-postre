"use client";

import { useState, useTransition } from "react";

export type IgResult = { username: string; fullName: string | null; hint: string | null; pic: string };

export function IgSearch({
  initial = "",
  title = "🔍 Buscar en Instagram",
  search: run,
  pending,
  onPick,
}: {
  initial?: string;
  title?: string;
  search: (query: string) => Promise<IgResult[]>;
  pending: boolean;
  onPick: (r: IgResult) => void;
}) {
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<IgResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();

  const search = () =>
    startSearch(async () => {
      setError(null);
      try {
        setResults(await run(query));
      } catch (e) {
        setResults(null);
        setError(e instanceof Error ? e.message : "Falló la búsqueda");
      }
    });

  return (
    <section className="rounded-3xl bg-chocolate p-4 text-crema">
      <p className="mb-3 font-bold">{title}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Apodo, nombre o @"
          autoCapitalize="off"
          className="min-w-0 flex-1 rounded-2xl bg-crema/10 px-4 py-2.5 outline-none placeholder:text-crema/30"
        />
        <button disabled={searching || !query.trim()} className="rounded-2xl bg-flan px-4 font-bold text-cafe disabled:opacity-50">
          {searching ? "…" : "Buscar"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-crema/70">⚠️ {error}</p>}
      {results && (
        <ul className="mt-3 flex flex-col">
          {results.length === 0 && <li className="text-sm text-crema/60">Nada con ese nombre 🤷</li>}
          {results.map((r) => (
            <li key={r.username}>
              <button
                disabled={pending}
                onClick={() => onPick(r)}
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left active:bg-crema/10 disabled:opacity-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/ig-pic?url=${encodeURIComponent(r.pic)}`} alt="" className="size-11 shrink-0 rounded-full border-2 border-flan object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">@{r.username}</span>
                  <span className="block truncate text-xs text-crema/50">
                    {[r.fullName, r.hint].filter(Boolean).join(" · ") || "—"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
