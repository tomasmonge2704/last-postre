"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import type { MatchRow } from "@/lib/match";
import { Avatar } from "@/components/Avatar";

// Los matches viven en el layout: así el aviso salta en cualquier pantalla.
const MatchesContext = createContext<{ matches: readonly MatchRow[]; setMatches: (m: readonly MatchRow[]) => void } | null>(null);

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<readonly MatchRow[]>([]);
  return <MatchesContext value={{ matches, setMatches }}>{children}</MatchesContext>;
}

export function MatchBadge() {
  const count = useContext(MatchesContext)?.matches.length ?? 0;
  if (!count) return null;
  return (
    <span
      key={count}
      className="absolute -top-2 -right-2 flex animate-[badge-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)] items-center gap-1 rounded-full border-2 border-cafe bg-crema px-2.5 py-1 text-sm font-black text-frutilla shadow-[0_3px_0_var(--color-cafe)]"
    >
      💘 {count}
    </span>
  );
}

export function MatchListener(props: { realtimeUrl: string; sealed: SealedLiveQuery<MatchRow> }) {
  const [client] = useState(() => createRealtimeClient({ url: props.realtimeUrl }));
  return (
    <RealtimeProvider client={client}>
      <Listener sealed={props.sealed} />
    </RealtimeProvider>
  );
}

function Listener({ sealed }: { sealed: SealedLiveQuery<MatchRow> }) {
  const ctx = useContext(MatchesContext);
  const refreshQuery = useCallback(async () => {
    const res = await fetch("/api/match/live", { method: "POST" });
    if (!res.ok) throw new Error("No se pudo renovar la conexión");
    return (await res.json()) as SealedLiveQuery<MatchRow>;
  }, []);
  const { data } = useLiveQuery(sealed, { refreshQuery });
  const known = useRef<Set<string> | null>(null);
  const [toast, setToast] = useState<MatchRow | null>(null);
  const setMatches = ctx?.setMatches;

  useEffect(() => {
    if (!data) return;
    setMatches?.(data);
    // La primera carga no avisa: solo los matches que llegan mientras estás adentro.
    if (known.current) {
      const fresh = data.find((m) => !known.current!.has(m.id));
      if (fresh) setToast(fresh);
    }
    known.current = new Set(data.map((m) => m.id));
  }, [data, setMatches]);

  useEffect(() => {
    if (!toast) return;
    navigator.vibrate?.(200);
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className="animate-toast-down fixed inset-x-3 top-3 z-[100] mx-auto max-w-md">
      <Link
        href={`/social/${toast.id}`}
        onClick={() => setToast(null)}
        className="flex items-center gap-3 rounded-3xl border-2 border-cafe bg-crema p-3 text-cafe shadow-[0_6px_0_var(--color-cafe)]"
      >
        <Avatar guest={{ id: toast.id, nickname: toast.nickname, avatarUrl: toast.avatar_url }} size={48} />
        <div className="min-w-0 flex-1">
          <p className="wordmark text-2xl text-frutilla">¡Es un match! 💘</p>
          <p className="mt-1 truncate text-sm">A {toast.nickname} también le gustaste. Tocá para verlo.</p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setToast(null);
          }}
          aria-label="Cerrar"
          className="self-start px-1 text-cafe/40"
        >
          ✕
        </button>
      </Link>
    </div>
  );
}
