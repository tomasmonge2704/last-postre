import type { AdminGuest } from "@/lib/admin";

export function GuestBadges({ guest }: { guest: AdminGuest }) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className="rounded-full bg-crema/10 px-2 py-0.5 text-xs">{guest.gender === "f" ? "👩 Mujer" : "👨 Hombre"}</span>
      {guest.relationshipStatus === "taken" && (
        <span className="rounded-full bg-frutilla/25 px-2 py-0.5 text-xs">💍 De novio/a</span>
      )}
      {guest.friendGroups.map((g) => (
        <span key={g} className="rounded-full bg-flan/25 px-2 py-0.5 text-xs">👥 {g}</span>
      ))}
      {guest.tags.map((t) => (
        <span key={t} className="rounded-full bg-caramelo/25 px-2 py-0.5 text-xs">🏷️ {t}</span>
      ))}
      {guest.placeholder && <span className="rounded-full bg-crema/10 px-2 py-0.5 text-xs">⏳ sin nombre</span>}
    </div>
  );
}
