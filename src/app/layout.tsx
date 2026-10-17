import type { Metadata, Viewport } from "next";
import { Lilita_One } from "next/font/google";
import { Suspense } from "react";
import { getCurrentGuest } from "@/lib/session";
import { isSingle, sealMyMatches } from "@/lib/match";
import { sealNotesAboutMe } from "@/lib/social";
import { LiveNotifications, MatchesProvider } from "./LiveNotifications";
import "./globals.css";

const lilita = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-lilita" });

export const metadata: Metadata = {
  title: "Postre 🍮",
  description: "Los juegos de la previa",
  // Instalada en el inicio del iPhone se abre como app (y recién ahí iOS permite push).
  appleWebApp: { capable: true, title: "Postre", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#2b1a10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${lilita.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MatchesProvider>
          {children}
          <Suspense>
            <LiveFeed />
          </Suspense>
        </MatchesProvider>
      </body>
    </html>
  );
}

// Escucha en vivo lo que te pasa (matches, apodos, comentarios) desde cualquier pantalla.
async function LiveFeed() {
  const me = await getCurrentGuest();
  if (!me) return null;
  const [notes, matches] = await Promise.all([sealNotesAboutMe(me.id), isSingle(me) ? sealMyMatches(me.id) : null]);
  return <LiveNotifications meId={me.id} realtimeUrl={process.env.NEON_REALTIME_URL!} notes={notes} matches={matches} />;
}
