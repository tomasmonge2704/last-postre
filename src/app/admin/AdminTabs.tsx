import Link from "next/link";

const tabs = [
  { href: "/admin", label: "Perfiles", emoji: "👥" },
  { href: "/admin/juegos", label: "Juegos", emoji: "🎲" },
  { href: "/admin/actividad", label: "Actividad", emoji: "📡" },
] as const;

export function AdminTabs({ current }: { current: (typeof tabs)[number]["href"] }) {
  return (
    <nav className="mb-5 grid grid-cols-3 gap-1 rounded-full bg-chocolate p-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-full py-2 text-center text-sm font-bold ${t.href === current ? "bg-flan text-cafe" : "text-crema/70"}`}
        >
          {t.emoji} {t.label}
        </Link>
      ))}
    </nav>
  );
}
