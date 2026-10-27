"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/app/language-provider";
import { APP_VERSION } from "@/lib/version";

const SEEN_KEY = "ranvier:whatsnew:seen";

/**
 * Aviso de novidades (pedido do fundador, 2026-10-25).
 *
 *  - Aparece na tela inicial SEMPRE que o app recebe uma atualização,
 *    descrevendo as novidades da versão.
 *  - Só aparece UMA vez por usuário para cada versão: a versão vista é
 *    registrada no localStorage e o popup só volta quando APP_VERSION muda.
 *  - Estética do patch: papel, hairline, mono nos metadados, serifa no
 *    título — sem sombras, sem confete (é um bilhete, não um troféu).
 *  - Nunca durante questão/simulado: vive apenas na landing (patch §8
 *    proíbe pop-up na tela de questão; aqui não há nada competindo).
 */
export function WhatsNewDialog() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    /* Checagem após o primeiro paint (400 ms): evita setState síncrono no
       efeito e deixa a landing respirar antes do aviso. */
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const seen = window.localStorage.getItem(SEEN_KEY);
        if (seen !== APP_VERSION) setOpen(true);
      } catch {
        /* localStorage indisponível (modo privado etc.) — não mostrar */
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      try {
        window.localStorage.setItem(SEEN_KEY, APP_VERSION);
      } catch {
        /* sem storage: o aviso pode repetir — aceitável */
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.whatsNew.eyebrow} · v{APP_VERSION}
          </p>
          <DialogTitle className="font-display text-2xl font-light tracking-[-0.02em]">
            {t.whatsNew.title}
          </DialogTitle>
          <DialogDescription>{t.whatsNew.subtitle}</DialogDescription>
        </DialogHeader>

        <ol className="mt-2 space-y-3">
          {t.whatsNew.items.map((item, i) => (
            <li key={i} className="flex gap-3 border-t pt-3 first:border-t-0 first:pt-0">
              <span className="shrink-0 font-mono text-xs font-medium text-app-ink" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => handleOpenChange(false)}>{t.whatsNew.close}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
