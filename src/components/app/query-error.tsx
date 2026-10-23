"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/app/language-provider";

/**
 * Estado de erro para queries (catalog/progress/attempts) com botão de retry.
 * Usado quando a API falha — nunca deixar a tela "carregando para sempre".
 */
export function QueryError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying?: boolean }) {
  const { t } = useLang();
  return (
    <div role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">{t.common.error}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {t.common.retry}
      </Button>
    </div>
  );
}
