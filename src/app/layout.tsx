import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Typography per the Noos identity manual (Fase 1):
 *  - Instrument Sans: app body font.
 *  - IBM Plex Mono: public IDs and code.
 *  - Newsreader: RESERVED for the mother's wordmark (the "Noos" in "by Noos").
 */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ranvier — Simulados e estudos gratuitos para certificações",
  description:
    "Preparação gratuita para a certificação Databricks Certified Data Engineer Associate: simulados no formato real do exame, modo estudo com explicações e fontes oficiais, e progresso por domínio. Projeto independente, sem afiliação.",
  keywords: [
    "Databricks",
    "Data Engineer Associate",
    "certificação",
    "simulado",
    "prova",
    "estudos",
    "gratuito",
    "Delta Lake",
    "Unity Catalog",
    "Lakeflow",
  ],
  authors: [{ name: "Ironides Junior", url: "https://github.com/ironidesflj" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Ranvier — Simulados gratuitos para certificações",
    description:
      "Simulados fiéis ao exame real Databricks Data Engineer Associate. Gratuito, independente e 100% baseado em fontes oficiais.",
    siteName: "Ranvier",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B1424" },
    { media: "(prefers-color-scheme: light)", color: "#246cad" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${plexMono.variable} ${newsreader.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
