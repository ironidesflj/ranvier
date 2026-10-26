import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Tipografia (guia Noos v1.1 + patch Ranvier §5):
 *  - Instrument Sans: corpo, botões e alternativas.
 *  - IBM Plex Mono: tempo, IDs, contadores e metadados.
 *  - Newsreader: display do app — H1, perguntas e títulos de tela.
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // iOS home-screen app: standalone, dark status bar, proper launcher title.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ranvier",
  },
  formatDetection: { telephone: false },
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
    { media: "(prefers-color-scheme: light)", color: "#f7fbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f10" },
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
    <html lang="pt-BR" data-app="ranvier" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${plexMono.variable} ${newsreader.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
