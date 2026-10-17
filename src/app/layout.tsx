import type { Metadata, Viewport } from "next";
import { Lilita_One } from "next/font/google";
import "./globals.css";

const lilita = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-lilita" });

export const metadata: Metadata = {
  title: "Postre 🍮",
  description: "Los juegos de la previa",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
