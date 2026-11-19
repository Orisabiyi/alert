import type { Metadata } from "next";
import { Archivo, Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-archivo", display: "swap" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Alert — money that lands before they leave",
  description:
    "Instant settlement for Nigerian merchants. Your customer taps, the money is yours while they are still packing their bag.",
  openGraph: {
    title: "Alert — instant settlement",
    description: "No T+1. No cut-off times. Money that lands before they leave.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoBlack.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
