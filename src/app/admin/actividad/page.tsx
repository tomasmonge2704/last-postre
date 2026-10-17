import { Suspense } from "react";
import { activityStats, listActivity, type ActivityRow } from "@/lib/events";
import { Avatar } from "@/components/Avatar";
import { AdminTabs } from "../AdminTabs";
import { AutoRefresh } from "./AutoRefresh";

const gameNames: Record<string, string> = { "verdad-reto": "Verdad o reto", "yo-nunca": "Yo nunca", "accion-nombre": "Acción y nombre" };

function describe(e: ActivityRow) {
  const who = e.guest_nick ?? "Alguien";
  switch (e.kind) {
    case "entro":
      return { emoji: "👋", text: `${who} entró a Postre` };
    case "perfil":
      return { emoji: "📸", text: e.data.slot ? `${e.data.slot} es ${who}${e.data.instagram ? ` (@${e.data.instagram})` : ""}` : `${who} conectó su IG @${e.data.instagram}` };
    case "match":
      return { emoji: "💘", text: `¡${who} y ${e.target_nick} hicieron match!` };
    case "nota":
      return { emoji: e.data.kind === "apodo" ? "🏷️" : "💬", text: `${who} → ${e.target_nick}: “${e.data.body}”` };
    case "sala":
      return { emoji: "🎉", text: `${who} armó la sala ${e.data.name} (${e.data.count})` };
    case "espia":
      return { emoji: "🕵️", text: `${who} abrió una partida de El Espía` };
    case "juego":
      return { emoji: "🎲", text: `${who} arrancó ${gameNames[e.data.game] ?? e.data.game}${Number(e.data.players) ? ` con ${e.data.players}` : ""}` };
  }
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

async function Feed() {
  const [rows, stats] = await Promise.all([listActivity(), activityStats()]);
  return (
    <>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ["👋", stats.entraron, "entraron"],
          ["💘", stats.matches, "matches"],
          ["💬", stats.notas, "notas"],
          ["🎲", stats.jugadas, "partidas"],
        ].map(([emoji, n, label]) => (
          <div key={label} className="rounded-2xl bg-chocolate py-3 text-crema">
            <p className="text-2xl font-extrabold">{n}</p>
            <p className="text-[11px] font-semibold text-crema/60">
              {emoji} {label}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-4 overflow-hidden rounded-3xl bg-chocolate text-crema">
        {rows.length === 0 && <li className="px-4 py-6 text-center text-crema/50">Todavía no pasó nada 🦗</li>}
        {rows.map((e) => {
          const d = describe(e);
          return (
            <li key={e.id} className="flex items-center gap-3 border-b border-crema/10 px-4 py-3 last:border-none">
              {e.guest_id ? (
                <Avatar guest={{ id: e.guest_id, nickname: e.guest_nick ?? "?", avatarUrl: e.guest_avatar }} size={36} />
              ) : (
                <span className="grid size-9 place-items-center text-xl">{d.emoji}</span>
              )}
              <p className="min-w-0 flex-1 text-sm">
                <span className="mr-1">{d.emoji}</span>
                {d.text}
              </p>
              <span className="text-xs text-crema/40">{time(e.created_at)}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function ActividadPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-6 pb-10 text-cafe">
      <AdminTabs current="/admin/actividad" />
      <AutoRefresh seconds={10} />
      <Suspense fallback={<p className="m-auto text-4xl">📡</p>}>
        <Feed />
      </Suspense>
    </main>
  );
}
