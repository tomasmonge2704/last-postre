import type { PublicGuest } from "@/lib/guests";

const colors = ["bg-flan", "bg-caramelo", "bg-vainilla", "bg-frutilla", "bg-dulce"];

export function Avatar({ guest, size = 44 }: { guest: Pick<PublicGuest, "id" | "nickname" | "avatarUrl">; size?: number }) {
  const color = colors[[...guest.id].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
  return (
    <div
      className={`${color} grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-cafe text-cafe`}
      style={{ width: size, height: size }}
    >
      {guest.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={guest.avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-[family-name:var(--font-wordmark)]" style={{ fontSize: size * 0.45 }}>
          {guest.nickname[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );
}
