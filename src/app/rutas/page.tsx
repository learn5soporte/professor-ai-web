"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { useSession, type EstadoFase } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";

const BADGE_POR_FASE: Record<string, string> = {
  Explorar: "fase-explorar",
  Aplicar: "fase-aplicar",
  Dominar: "fase-dominar",
};

const SIGUIENTE_ESTADO: Record<EstadoFase, EstadoFase> = {
  pendiente: "en_progreso",
  en_progreso: "completado",
  completado: "pendiente",
};

const ETIQUETA_ESTADO: Record<EstadoFase, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completado: "Completado",
};

export default function RutasPage() {
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    progresoRutas,
    actualizarProgresoFase,
    otorgarBadge,
    cargando,
  } = useSession();
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !resultadoTmaid) return null;

  const totalFases = resultadoTmaid.rutaPersonalizada.length;
  const completadas = resultadoTmaid.rutaPersonalizada.filter(
    (f) => progresoRutas[f.fase] === "completado"
  ).length;

  function avanzarFase(fase: string) {
    const estadoActual = progresoRutas[fase] ?? "pendiente";
    const siguiente = SIGUIENTE_ESTADO[estadoActual];
    actualizarProgresoFase(fase, siguiente);

    if (siguiente === "completado") {
      const badgeId = BADGE_POR_FASE[fase];
      if (badgeId && otorgarBadge(badgeId)) {
        setBadgeGanado(BADGES[badgeId]);
      }
    }
  }

  return (
    <AppShell titulo="Rutas">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <div className="mx-auto max-w-2xl">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Tu ruta personalizada
        </p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">
          {completadas} de {totalFases} fases completadas
        </h1>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completadas / totalFases) * 100}%` }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {resultadoTmaid.rutaPersonalizada.map((fase) => {
            const estado = progresoRutas[fase.fase] ?? "pendiente";
            return (
              <div key={fase.fase} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-on-surface">
                      {fase.fase}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {fase.descripcion}
                    </p>
                  </div>
                  <button
                    onClick={() => avanzarFase(fase.fase)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                      estado === "completado"
                        ? "bg-primary text-on-primary"
                        : estado === "en_progreso"
                          ? "bg-secondary-fixed text-on-secondary-fixed"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {estado === "completado" && <CheckCircle2 size={14} />}
                    {estado === "en_progreso" && <PlayCircle size={14} />}
                    {estado === "pendiente" && <Circle size={14} />}
                    {ETIQUETA_ESTADO[estado]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-on-surface-variant">
          Toca el estado de cada fase para avanzarla. En Fase 4 del roadmap
          esto se conecta a retos reales con evidencia, no solo un click.
        </p>
      </div>
    </AppShell>
  );
}
