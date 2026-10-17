"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import type { MatchRow } from "@/lib/match";
import type { LiveNoteRow } from "@/lib/social";
import { Avatar } from "@/components/Avatar";

// Los avisos viven en el layout: así saltan en cualquier pantalla.
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

type Toast = { key: string; title: string; body: string; href: string; who: { id: string; nickname: string; avatarUrl: string | null } };

type Props = {
  meId: string;
  realtimeUrl: string;
  notes: SealedLiveQuery<LiveNoteRow>;
  matches: SealedLiveQuery<MatchRow> | null; // solo solteros
};

export function LiveNotifications(props: Props) {
  const [client] = useState(() => createRealtimeClient({ url: props.realtimeUrl }));
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    navigator.vibrate?.(200);
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <RealtimeProvider client={client}>
      <NotesWatcher meId={props.meId} sealed={props.notes} onNew={setToast} />
      {props.matches && <MatchesWatcher sealed={props.matches} onNew={setToast} />}
      {toast && <ToastCard key={toast.key} toast={toast} onClose={() => setToast(null)} />}
    </RealtimeProvider>
  );
}

function useRefresh<Row>(kind: "matches" | "notes") {
  return useCallback(async () => {
    const res = await fetch("/api/live", { method: "POST", body: JSON.stringify({ kind }) });
    if (!res.ok) throw new Error("No se pudo renovar la conexión");
    return (await res.json()) as SealedLiveQuery<Row>;
  }, [kind]);
}

// Avisa solo de filas que aparecen mientras estás adentro, no de las que ya había al entrar.
function useNewRows<Row extends { id: string }>(data: readonly Row[] | undefined, onNew: (row: Row) => void) {
  const known = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!data) return;
    if (known.current) {
      const fresh = data.find((r) => !known.current!.has(r.id));
      if (fresh) onNew(fresh);
    }
    known.current = new Set(data.map((r) => r.id));
  }, [data, onNew]);
}

function NotesWatcher({ meId, sealed, onNew }: { meId: string; sealed: SealedLiveQuery<LiveNoteRow>; onNew: (t: Toast) => void }) {
  const { data } = useLiveQuery(sealed, { refreshQuery: useRefresh<LiveNoteRow>("notes") });
  const notify = useCallback(
    (n: LiveNoteRow) =>
      onNew({
        key: `note-${n.id}`,
        title: n.kind === "apodo" ? "Te pusieron un apodo 🏷️" : "Comentaron tu perfil 💬",
        body: n.kind === "apodo" ? `${n.author_nick}: “${n.body}”` : `${n.author_nick}: ${n.body}`,
        href: `/social/${meId}`,
        who: { id: n.author_id, nickname: n.author_nick, avatarUrl: n.author_avatar },
      }),
    [meId, onNew],
  );
  useNewRows(data, notify);
  return null;
}

function MatchesWatcher({ sealed, onNew }: { sealed: SealedLiveQuery<MatchRow>; onNew: (t: Toast) => void }) {
  const setMatches = useContext(MatchesContext)?.setMatches;
  const { data } = useLiveQuery(sealed, { refreshQuery: useRefresh<MatchRow>("matches") });
  useEffect(() => {
    if (data) setMatches?.(data);
  }, [data, setMatches]);
  const notify = useCallback(
    (m: MatchRow) =>
      onNew({
        key: `match-${m.id}`,
        title: "¡Es un match! 💘",
        body: `A ${m.nickname} también le gustaste. Tocá para verlo.`,
        href: `/social/${m.id}`,
        who: { id: m.id, nickname: m.nickname, avatarUrl: m.avatar_url },
      }),
    [onNew],
  );
  useNewRows(data, notify);
  return null;
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div className="animate-toast-down fixed inset-x-3 top-3 z-[100] mx-auto max-w-md">
      <Link
        href={toast.href}
        onClick={onClose}
        className="flex items-center gap-3 rounded-3xl border-2 border-cafe bg-crema p-3 text-cafe shadow-[0_6px_0_var(--color-cafe)]"
      >
        <Avatar guest={toast.who} size={48} />
        <div className="min-w-0 flex-1">
          <p className="wordmark text-xl text-frutilla">{toast.title}</p>
          <p className="mt-1 truncate text-sm">{toast.body}</p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onClose();
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
