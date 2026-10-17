import type { Metadata, Viewport } from "next";
import { Lilita_One } from "next/font/google";
import { Suspense } from "react";
import { getCurrentGuest } from "@/lib/session";
import { isSingle, sealMyMatches } from "@/lib/match";
import { MatchListener, MatchesProvider } from "./MatchLive";
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
            <LiveMatches />
          </Suspense>
        </MatchesProvider>
      </body>
    </html>
  );
}

// Escucha tus matches en vivo desde cualquier pantalla (solo solteros con sesión).
async function LiveMatches() {
  const me = await getCurrentGuest();
  if (!me || !isSingle(me)) return null;
  return <MatchListener realtimeUrl={process.env.NEON_REALTIME_URL!} sealed={await sealMyMatches(me.id)} />;
}
