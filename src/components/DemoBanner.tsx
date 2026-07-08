"use client";

import { useEffect, useState } from "react";

/**
 * Aviso temporal de demo/copyright -- pedido explicito del usuario mientras
 * el link publico de GitHub Pages este activo (Fase 0, sin backend/auth
 * reales todavia). Se puede retirar o reemplazar cuando el producto pase a
 * un entorno de produccion real (ver Fase 1 del roadmap tecnico).
 */

const DISMISS_KEY = "professor-ai:aviso-demo-cerrado";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cerrado = window.localStorage.getItem(DISMISS_KEY);
    if (!cerrado) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] flex items-center justify-center gap-3 bg-[#071941] px-4 py-2 text-center text-[11px] leading-tight text-white/90 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
      <span>
        Versión de demostración de Professor AI (Learn5) — contenido de prueba, sujeto a cambios.
        Prohibida su reproducción o distribución sin autorización. © 2026 Learn5.
      </span>
      <button
        onClick={() => {
          window.localStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded-full px-2 py-0.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
