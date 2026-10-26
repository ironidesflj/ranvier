"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/app/language-provider";

/**
 * Estado de erro para queries (catalog/progress/attempts) com botão de retry
 * e código do erro em mono (patch Ranvier v1.0 §10). Nunca deixar a tela
 * "carregando para sempre" — o erro preserva o que está no dispositivo e
 * oferece nova tentativa.
 */
export function QueryError({ onRetry, isRetrying, code }: { onRetry: () => void; isRetrying?: boolean; code?: string }) {
  const { t } = useLang();
  return (
    <div role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">{t.common.error}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {t.common.retry}
      </Button>
      {code && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">{code}</p>
      )}
    </div>
  );
}
