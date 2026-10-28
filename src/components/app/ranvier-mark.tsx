"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Símbolo Ranvier — Opção 03: Topologia Orbital 'R' (Câmara de Bolhas / Diagrama de Feynman).
 *
 * Geometria analítica em grade 120×120 (erro residual = 0.00 px):
 *  - Haste meridional x=34 (y=20..100) com cilindro E1 (cx=34, cy=60, rx=9, ry=40).
 *  - Dipolo orbital no bojo E2/E3 (cx=58, cy=42, rx=33, ry=16, rot=±16°), com
 *    ápice direito exato em (87.55, 42.00).
 *  - Arco do bojo C1-tangente em (34,20) e (87.55,42), terminando no Nó Receptor (54,62).
 *  - Salto balístico sobre círculo de Larmor R=88.25 centrado em (12.25, 139.75),
 *    unindo (34,54.22) → (54,62) → [Gap de Ranvier: K1(57.64,64.07), K2(60.46,65.83)] → (65,69) → (90,98).
 *
 * Escalas ópticas:
 *  - "full" (≥48px, abertura/editorial): malha completa (1.1px), traço 2.4px e 14 nós/quanta.
 *  - "ui" (default, 18–36px, rail/topbar): recorte óptico (14 12 92 96), órbita única de
 *    assinatura (2.2px), traço 5.2px e gap limpo (1.48px reais em 20×20).
 *  - "compact" (16px, favicon/micro): órbita única, traço 7.5px e gap com compensação óptica.
 */
export function RanvierMark({
  className,
  compact = false,
  variant,
}: {
  className?: string;
  compact?: boolean;
  variant?: "full" | "ui" | "compact";
}) {
  const mode = variant ?? (compact ? "compact" : "ui");

  if (mode === "compact") {
    return (
      <svg
        viewBox="0 0 120 120"
        className={cn("shrink-0", className)}
        aria-hidden
        focusable="false"
        fill="none"
      >
        <ellipse
          cx="58"
          cy="42"
          rx="33"
          ry="16"
          transform="rotate(-16 58 42)"
          stroke="currentColor"
          strokeWidth={3.2}
          opacity={0.38}
        />
        <g stroke="currentColor" strokeWidth={7.5} strokeLinecap="round">
          <path d="M34 20V100" />
          <path d="M34 20A53.55 22 0 0 1 87.55 42A53.55 21.56 0 0 1 52 62.31" />
        </g>
        <path
          d="M68 71.34A88.25 88.25 0 0 1 90 98"
          stroke="var(--ranvier-node)"
          strokeWidth={7.5}
          strokeLinecap="round"
        />
        <g fill="currentColor">
          <circle cx="34" cy="20" r="4.8" />
          <circle cx="34" cy="100" r="4.8" />
          <circle cx="87.55" cy="42" r="4.8" />
          <circle cx="52" cy="62.31" r="4.2" />
        </g>
        <g fill="var(--ranvier-node)">
          <circle cx="68" cy="71.34" r="6.2" />
          <circle cx="90" cy="98" r="4.8" />
        </g>
      </svg>
    );
  }

  if (mode === "full") {
    return (
      <svg
        viewBox="0 0 120 120"
        className={cn("shrink-0", className)}
        aria-hidden
        focusable="false"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth={1.1} opacity={0.48}>
          <ellipse cx="34" cy="60" rx="9" ry="40" />
          <ellipse cx="58" cy="42" rx="33" ry="16" transform="rotate(-16 58 42)" />
          <ellipse cx="58" cy="42" rx="33" ry="16" transform="rotate(16 58 42)" />
          <path
            d="M34 54.22A88.25 88.25 0 0 1 54 62"
            strokeDasharray="2.2 2.8"
            strokeLinecap="round"
          />
        </g>
        <g stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M34 20V100" />
          <path d="M34 20A53.55 22 0 0 1 87.55 42A53.55 21.56 0 0 1 54 62" />
        </g>
        <path
          d="M65 69A88.25 88.25 0 0 1 90 98"
          stroke="var(--ranvier-node)"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <g fill="currentColor">
          <circle cx="34" cy="20" r="2.2" />
          <circle cx="34" cy="100" r="2.2" />
          <circle cx="87.55" cy="42" r="2.2" />
          <circle cx="54" cy="62" r="2.2" />
          <circle cx="34" cy="54.22" r="1.5" />
          <circle cx="25" cy="60" r="1.5" />
          <circle cx="40.43" cy="32" r="1.6" />
          <circle cx="43" cy="59.79" r="1.6" />
          <circle cx="28.45" cy="42" r="1.4" />
          <circle cx="58" cy="25.51" r="1.5" />
        </g>
        <g fill="var(--ranvier-node)">
          <circle cx="57.64" cy="64.07" r="1" opacity={0.42} />
          <circle cx="60.46" cy="65.83" r="1.35" opacity={0.72} />
          <circle cx="65" cy="69" r="3.2" />
          <circle cx="90" cy="98" r="2.2" />
        </g>
      </svg>
    );
  }

  /* Default: "ui" (18px–36px — LandingHeader 20px, Rail 20px, TopBar 18px) */
  return (
    <svg
      viewBox="14 12 92 96"
      className={cn("shrink-0", className)}
      aria-hidden
      focusable="false"
      fill="none"
    >
      <ellipse
        cx="58"
        cy="42"
        rx="33"
        ry="16"
        transform="rotate(-16 58 42)"
        stroke="currentColor"
        strokeWidth={2.2}
        opacity={0.38}
      />
      <g stroke="currentColor" strokeWidth={5.2} strokeLinecap="round">
        <path d="M34 20V100" />
        <path d="M34 20A53.55 22 0 0 1 87.55 42A53.55 21.56 0 0 1 53 62.16" />
      </g>
      <path
        d="M66.5 70.14A88.25 88.25 0 0 1 90 98"
        stroke="var(--ranvier-node)"
        strokeWidth={5.2}
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <circle cx="34" cy="20" r="3.6" />
        <circle cx="34" cy="100" r="3.6" />
        <circle cx="87.55" cy="42" r="3.6" />
        <circle cx="53" cy="62.16" r="3.6" />
      </g>
      <g fill="var(--ranvier-node)">
        <circle cx="66.5" cy="70.14" r="5" />
        <circle cx="90" cy="98" r="3.6" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Abertura Silenciosa em Tela Cheia (Símbolo Puro + Barra + by Noos) */
/* ------------------------------------------------------------------ */

let splashShownInSpaSession = false;

export function RanvierSplash() {
  const [phase, setPhase] = useState<"playing" | "fading" | "done">(() =>
    splashShownInSpaSession ? "done" : "playing"
  );

  useEffect(() => {
    if (splashShownInSpaSession) {
      return;
    }
    splashShownInSpaSession = true;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const quickTimer = window.setTimeout(() => setPhase("done"), 400);
      return () => window.clearTimeout(quickTimer);
    }

    const fadeTimer = window.setTimeout(() => setPhase("fading"), 4050);
    const doneTimer = window.setTimeout(() => setPhase("done"), 4600);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      role="status"
      aria-label="Ranvier by Noos"
      onClick={() => setPhase("done")}
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background text-foreground select-none transition-opacity duration-[450ms] ease-out",
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      <style>{`
        @keyframes ran-orbit-draw {
          0% { stroke-dashoffset: 100; opacity: 0; }
          30% { opacity: 0.45; }
          100% { stroke-dashoffset: 0; opacity: 0.45; }
        }
        @keyframes ran-micro-node-in {
          0% { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ran-spine-draw {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ran-wavefront {
          0% { stroke-dasharray: 0 100; stroke-dashoffset: 100; opacity: 0; }
          15% { stroke-dasharray: 18 100; opacity: 1; }
          85% { stroke-dasharray: 10 100; stroke-dashoffset: 8; opacity: 1; }
          100% { stroke-dasharray: 0 100; stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes ran-ion-ripple {
          0% { opacity: 0; transform: scale(0.25); stroke-width: 1.8px; }
          30% { opacity: 0.82; }
          100% { opacity: 0; transform: scale(2.4); stroke-width: 0.25px; }
        }
        @keyframes ran-quantum-k1 {
          0% { opacity: 0; transform: scale(0.2); }
          50% { opacity: 0.95; transform: scale(1.45); }
          100% { opacity: 0.42; transform: scale(1); }
        }
        @keyframes ran-quantum-k2 {
          0% { opacity: 0; transform: scale(0.2); }
          50% { opacity: 1; transform: scale(1.45); }
          100% { opacity: 0.72; transform: scale(1); }
        }
        @keyframes ran-node-ignite {
          0% { opacity: 0; transform: scale(0.2); }
          45% { opacity: 1; transform: scale(1.45); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ran-larmor-shot {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ran-rule-expand {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes ran-noos-fade {
          0% { opacity: 0; transform: translateX(-1px) translateY(5px); }
          100% { opacity: 1; transform: translateX(-1px) translateY(0); }
        }

        .ran-anim-e1 { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ran-orbit-draw 700ms cubic-bezier(0.22, 1, 0.36, 1) 120ms forwards; }
        .ran-anim-e2 { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ran-orbit-draw 760ms cubic-bezier(0.22, 1, 0.36, 1) 190ms forwards; }
        .ran-anim-e3 { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ran-orbit-draw 800ms cubic-bezier(0.22, 1, 0.36, 1) 250ms forwards; }
        .ran-anim-guide { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ran-orbit-draw 620ms cubic-bezier(0.22, 1, 0.36, 1) 620ms forwards; }
        .ran-anim-myelin { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ran-spine-draw 1000ms cubic-bezier(0.65, 0, 0.15, 1) 260ms forwards; }
        .ran-anim-wave { stroke-dasharray: 0 100; stroke-dashoffset: 100; opacity: 0; animation: ran-wavefront 1000ms cubic-bezier(0.65, 0, 0.15, 1) 260ms forwards; }
        .ran-anim-n2 { opacity: 0; transform-origin: 34px 100px; animation: ran-micro-node-in 300ms ease-out 260ms forwards; }
        .ran-anim-n1 { opacity: 0; transform-origin: 34px 20px; animation: ran-micro-node-in 300ms ease-out 520ms forwards; }
        .ran-anim-n3 { opacity: 0; transform-origin: 87.55px 42px; animation: ran-micro-node-in 300ms ease-out 820ms forwards; }
        .ran-anim-n4 { opacity: 0; transform-origin: 54px 62px; animation: ran-node-ignite 380ms cubic-bezier(0.22, 1, 0.36, 1) 1040ms forwards; }
        .ran-anim-mesh-nodes { opacity: 0; animation: ran-micro-node-in 500ms ease-out 480ms forwards; }
        .ran-anim-ripple-1 { opacity: 0; transform-origin: 59.5px 65.5px; animation: ran-ion-ripple 620ms cubic-bezier(0.16, 1, 0.3, 1) 1100ms forwards; }
        .ran-anim-ripple-2 { opacity: 0; transform-origin: 59.5px 65.5px; animation: ran-ion-ripple 680ms cubic-bezier(0.16, 1, 0.3, 1) 1200ms forwards; }
        .ran-anim-k1 { opacity: 0; transform-origin: 57.64px 64.07px; animation: ran-quantum-k1 360ms cubic-bezier(0.16, 1, 0.3, 1) 1160ms forwards; }
        .ran-anim-k2 { opacity: 0; transform-origin: 60.46px 65.83px; animation: ran-quantum-k2 360ms cubic-bezier(0.16, 1, 0.3, 1) 1250ms forwards; }
        .ran-anim-a1 { opacity: 0; transform-origin: 65px 69px; animation: ran-node-ignite 400ms cubic-bezier(0.16, 1, 0.3, 1) 1340ms forwards; }
        .ran-anim-larmor { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ran-larmor-shot 540ms cubic-bezier(0.08, 0.82, 0.17, 1) 1380ms forwards; }
        .ran-anim-a2 { opacity: 0; transform-origin: 90px 98px; animation: ran-node-ignite 320ms cubic-bezier(0.22, 1, 0.36, 1) 1760ms forwards; }
        .ran-anim-rule { opacity: 0; transform-origin: center; animation: ran-rule-expand 620ms cubic-bezier(0.22, 1, 0.36, 1) 1880ms forwards; }
        .ran-anim-noos { opacity: 0; animation: ran-noos-fade 640ms cubic-bezier(0.22, 1, 0.36, 1) 1940ms forwards; }
      `}</style>

      <div className="flex flex-col items-center">
        {/* Símbolo puro no centro do vazio (viewBox 0 0 116 120 alinha o centro de massa x=58) */}
        <svg
          viewBox="0 0 116 120"
          width={116}
          height={120}
          fill="none"
          aria-hidden="true"
          className="overflow-visible"
        >
          <g stroke="currentColor" strokeWidth={1.1}>
            <ellipse cx="34" cy="60" rx="9" ry="40" pathLength={100} className="ran-anim-e1" />
            <ellipse
              cx="58"
              cy="42"
              rx="33"
              ry="16"
              transform="rotate(-16 58 42)"
              pathLength={100}
              className="ran-anim-e2"
            />
            <ellipse
              cx="58"
              cy="42"
              rx="33"
              ry="16"
              transform="rotate(16 58 42)"
              pathLength={100}
              className="ran-anim-e3"
            />
            <path
              d="M34 54.22A88.25 88.25 0 0 1 54 62"
              strokeDasharray="2.2 2.8"
              strokeLinecap="round"
              pathLength={100}
              className="ran-anim-guide"
            />
          </g>

          <path
            d="M34 100V20A53.55 22 0 0 1 87.55 42A53.55 21.56 0 0 1 54 62"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            className="ran-anim-myelin"
          />
          <path
            d="M34 100V20A53.55 22 0 0 1 87.55 42A53.55 21.56 0 0 1 54 62"
            stroke="var(--ranvier-node)"
            strokeWidth={2.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            className="ran-anim-wave"
          />

          <circle
            cx="59.5"
            cy="65.5"
            r="4.8"
            stroke="var(--ranvier-node)"
            fill="none"
            className="ran-anim-ripple-1"
          />
          <circle
            cx="59.5"
            cy="65.5"
            r="3"
            stroke="var(--ranvier-node)"
            fill="none"
            className="ran-anim-ripple-2"
          />

          <path
            d="M65 69A88.25 88.25 0 0 1 90 98"
            stroke="var(--ranvier-node)"
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={100}
            className="ran-anim-larmor"
          />

          <g fill="currentColor" className="ran-anim-mesh-nodes">
            <circle cx="34" cy="54.22" r="1.5" />
            <circle cx="25" cy="60" r="1.5" />
            <circle cx="40.43" cy="32" r="1.6" />
            <circle cx="43" cy="59.79" r="1.6" />
            <circle cx="28.45" cy="42" r="1.4" />
            <circle cx="58" cy="25.51" r="1.5" />
          </g>

          <g fill="currentColor">
            <circle cx="34" cy="100" r="2.2" className="ran-anim-n2" />
            <circle cx="34" cy="20" r="2.2" className="ran-anim-n1" />
            <circle cx="87.55" cy="42" r="2.2" className="ran-anim-n3" />
            <circle cx="54" cy="62" r="2.3" className="ran-anim-n4" />
          </g>

          <g fill="var(--ranvier-node)">
            <circle cx="57.64" cy="64.07" r="1.05" className="ran-anim-k1" />
            <circle cx="60.46" cy="65.83" r="1.4" className="ran-anim-k2" />
            <g className="ran-anim-a1">
              <circle cx="65" cy="69" r="6.2" fill="var(--ranvier-node)" fillOpacity={0.16} />
              <circle cx="65" cy="69" r="3.3" />
            </g>
            <circle cx="90" cy="98" r="2.2" className="ran-anim-a2" />
          </g>
        </svg>

        {/* Por último: a barra fina embaixo surgindo junto com o by Noos */}
        <div className="mt-4 flex flex-col items-center gap-2.5">
          <span aria-hidden="true" className="ran-anim-rule h-px w-8 bg-border-strong/45" />
          <span className="ran-anim-noos inline-flex items-center gap-1.5 font-mono text-[11.5px] leading-none tracking-[0.04em] text-muted-foreground">
            <img
              src="/brand/noos-compact.svg"
              alt=""
              width={13}
              height={13}
              aria-hidden="true"
              className="h-[13px] w-[13px] opacity-85 dark:hidden"
            />
            <img
              src="/brand/noos-mark-negative.svg"
              alt=""
              width={13}
              height={13}
              aria-hidden="true"
              className="hidden h-[13px] w-[13px] opacity-90 dark:block"
            />
            <span>
              <span className="font-normal opacity-75">by</span>{" "}
              <span className="font-medium tracking-[0.02em] text-foreground/85">Noos</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
