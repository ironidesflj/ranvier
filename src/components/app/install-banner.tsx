"use client";

import { useEffect, useState } from "react";
import { MonitorSmartphone, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/app/language-provider";
import { usePwa } from "@/components/app/pwa-provider";

const DISMISS_KEY = "ranvier-install-dismissed";
/** A dismissal lasts 7 days — the offer resurfaces afterwards. */
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Slim install strip right below the home hero: "install from the browser,
 * works offline". Only rendered when the platform supports it (native
 * beforeinstallprompt or iOS manual flow) and the app is not already installed.
 */
export function InstallBanner() {
  const { t } = useLang();
  const { showInstallEntry, install } = usePwa();
  const [dismissed, setDismissed] = useState(true);

  // Hidden until we know it was not recently dismissed (avoids SSR flash).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      const at = raw ? Number(raw) : NaN;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resolving persisted dismissal after hydration
      setDismissed(Number.isFinite(at) && Date.now() - at < DISMISS_TTL_MS);
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!showInstallEntry || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* private mode — just hide for this session */
    }
  };

  return (
    <section aria-label={t.pwa.installTitle} className="border-b bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:py-3.5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WifiOff className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{t.pwa.installTitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.pwa.installDesc}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button size="sm" className="h-8" onClick={install}>
            <MonitorSmartphone className="h-4 w-4" aria-hidden />
            {t.pwa.installButton}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground" onClick={dismiss}>
            {t.pwa.dismiss}
          </Button>
        </div>
      </div>
    </section>
  );
}
