import type { Metadata } from "next";
import { Fredoka, Work_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Bazar de Aracely — Catálogo",
    template: "%s — Bazar de Aracely",
  },
  description:
    "Juguetes, accesorios y cuidado para perros — mercadería nueva, verificada pieza por pieza. Envío coordinado por WhatsApp.",
  openGraph: {
    title: "Bazar de Aracely — Catálogo",
    description:
      "Juguetes, accesorios y cuidado para perros — mercadería nueva, verificada pieza por pieza.",
    locale: "es_PE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${workSans.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
