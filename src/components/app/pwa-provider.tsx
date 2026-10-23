"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Home, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLang } from "@/components/app/language-provider";
import type { Dict } from "@/lib/i18n";

/** Chrome/Edge "Add to home screen" deferred prompt. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaContextValue {
  /** The browser fired beforeinstallprompt — native install flow available. */
  canInstall: boolean;
  /** Running as an installed app (display-mode standalone / iOS navigator.standalone). */
  isStandalone: boolean;
  /** iOS Safari (no native prompt — needs the manual "Add to Home Screen" flow). */
  isIOS: boolean;
  isOnline: boolean;
  /** Install entry point should be offered in the UI (not standalone, supported platform). */
  showInstallEntry: boolean;
  /** Native prompt when available; opens the iOS instructions dialog on iOS. */
  install: () => void;
}

const PwaContext = createContext<PwaContextValue | null>(null);

export function usePwa(): PwaContextValue {
  const ctx = useContext(PwaContext);
  if (!ctx) throw new Error("usePwa must be used within PwaProvider");
  return ctx;
}

/**
 * PWA plumbing:
 *  - Registers /sw.js on secure contexts (localhost counts) so the app shell,
 *    fonts and previously seen data work offline.
 *  - On the very first activation the page reloads once (controllerchange) so
 *    the initial load — which happened before the worker existed — gets cached.
 *  - Captures beforeinstallprompt for a custom "Install app" UI.
 *  - Detects standalone mode (installed) and iOS (manual Add to Home Screen).
 *  - Toasts connectivity changes so students know when they went offline.
 *
 * Mutations (answer/submit/login) are never cached by the worker — offline
 * students keep reading, but scoring always goes through the server.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLang();

  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const isIOSRef = useRef(false);
  const reloadedRef = useRef(false);
  // Keep latest strings for listeners registered once.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    // iPadOS 13+ masquerades as desktop Safari.
    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    // Browser-only APIs (matchMedia/navigator) resolved after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolving install state after hydration
    setIsStandalone(standalone);
    setIsIOS(ios);
    isIOSRef.current = ios;
    setIsOnline(window.navigator.onLine);

    // --- Service worker ---
    if ("serviceWorker" in navigator && window.isSecureContext) {
      const onControllerChange = () => {
        // First activation only: reload so this load goes through the worker
        // and gets cached for offline use. Later workers activate only after
        // every tab is closed, so this never interrupts a study session.
        if (reloadedRef.current) return;
        reloadedRef.current = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[pwa] service worker registration failed:", err);
      });
    }

    // --- Install / connectivity events ---
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const onAppInstalled = () => {
      promptRef.current = null;
      setCanInstall(false);
      toast.success(tRef.current.pwa.installed);
    };
    const onOnline = () => {
      setIsOnline(true);
      toast.success(tRef.current.pwa.onlineToast);
    };
    const onOffline = () => {
      setIsOnline(false);
      toast.error(tRef.current.pwa.offlineToast);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const install = useCallback(() => {
    const promptEvent = promptRef.current;
    if (promptEvent) {
      promptRef.current = null;
      setCanInstall(false);
      promptEvent
        .prompt()
        .catch(() => {
          /* browser refused the prompt — button simply hides */
        });
      return;
    }
    if (isIOSRef.current) setIosHelpOpen(true);
  }, []);

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall,
      isStandalone,
      isIOS,
      isOnline,
      showInstallEntry: !isStandalone && (canInstall || isIOS),
      install,
    }),
    [canInstall, isStandalone, isIOS, isOnline, install]
  );

  return (
    <PwaContext.Provider value={value}>
      {children}
      <IosInstallDialog open={iosHelpOpen} onOpenChange={setIosHelpOpen} />
    </PwaContext.Provider>
  );
}

/** iOS Safari has no install prompt — teach the 3-step Add to Home Screen flow. */
function IosInstallDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useLang();
  const steps = [
    { icon: Share, text: t.pwa.iosStep1 },
    { icon: SquarePlus, text: t.pwa.iosStep2 },
    { icon: Home, text: t.pwa.iosStep3 },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.pwa.iosTitle}</DialogTitle>
          <DialogDescription>{t.pwa.iosDesc}</DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-foreground/90">
                <step.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {step.text}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t.common.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Narrow the Dict type to what this module needs (keeps i18n additions honest). */
type PwaDict = Dict["pwa"];
export type { PwaDict };
