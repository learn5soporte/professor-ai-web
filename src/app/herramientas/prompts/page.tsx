"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { PROMPTS } from "@/lib/herramientas/prompts";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";

export default function BancoPromptsPage() {
  const router = useRouter();
  const { perfil, otorgarBadge, cargando } = useSession();
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
  }, [cargando, perfil, router]);

  if (cargando || !perfil) return null;

  async function copiar(texto: string, idx: number) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoIdx(idx);
      setTimeout(() => setCopiadoIdx((cur) => (cur === idx ? null : cur)), 1500);
      if (otorgarBadge("primer-prompt")) {
        setBadgeGanado(BADGES["primer-prompt"]);
      }
    } catch {
      // Si el navegador bloquea el acceso al portapapeles, no rompemos la UI.
    }
  }

  return (
    <AppShell titulo="Banco de Prompts">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <div className="mx-auto max-w-2xl">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Herramienta 3 · Módulo de creación
        </p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">
          Banco de Prompts Pedagógicos
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Selecciona, copia y pega en tu asistente de IA favorito — sin
          necesidad de saber &quot;promptear&quot;.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {PROMPTS.map((p, idx) => (
            <div key={p.titulo} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                    {p.categoria}
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-on-surface">
                    {p.titulo}
                  </h2>
                </div>
                <button
                  onClick={() => copiar(p.prompt, idx)}
                  className="shrink-0 rounded-full bg-secondary-fixed px-4 py-2 text-xs font-bold text-on-secondary-fixed"
                >
                  {copiadoIdx === idx ? "Copiado ✓" : "Copiar"}
                </button>
              </div>
              <p className="mt-3 rounded-lg bg-surface-container-low p-3 font-mono text-sm text-on-surface">
                {p.prompt}
              </p>
              <p className="mt-2 text-xs text-on-surface-variant">
                {p.paraQueSirve}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
