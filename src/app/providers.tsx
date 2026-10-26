"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { LanguageProvider } from "@/components/app/language-provider";
import { Toaster } from "@/components/ui/sonner";
import { PwaProvider } from "@/components/app/pwa-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Guia Noos v1.1 / patch §7: tema claro é o padrão ("tema escuro como padrão" é proibido);
          o escuro permanece disponível como escolha explícita do estudante. */}
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <LanguageProvider>
          <PwaProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </PwaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
