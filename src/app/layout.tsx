import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: `Controle de Saídas — ${NOME_UNIDADE}`,
  description: `Registro e controle de saídas — ${NOME_UNIDADE} · ${SETOR_RESPONSAVEL}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
