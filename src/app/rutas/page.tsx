"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { Icon } from "@/components/Icon";

/**
 * Mi Ruta Formativa -- base literal: code.html real de Stitch
 * (bloque_4_y_5_dashboard_y_ruta_formativa, Section 15: screen-roadmap).
 * Selector de fase (Explorar/Aplicar/Dominar) + roadmap vertical con nodos
 * completado / activo (glow) / proximo (lock_open) / bloqueado (lock).
 */

type EstadoNodo = "completado" | "activo" | "proximo" | "bloqueado";

const ICONO_NODO: Record<EstadoNodo, string> = {
  completado: "check",
  activo: "lightbulb",
  proximo: "lock_open",
  bloqueado: "lock",
};

export default function RutasPage() {
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    progresoRutas,
    cargando,
  } = useSession();
  const [faseSeleccionada, setFaseSeleccionada] = useState<string | null>(null);
  const [badgeGanado] = useState<null | (typeof BADGES)[string]>(null);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const fases = resultadoTmaid.rutaPersonalizada;
  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const rutaCompleta = indiceActivo === -1;

  function estadoDe(i: number): EstadoNodo {
    if (progresoRutas[fases[i].fase] === "completado") return "completado";
    if (i === indiceActivo) return "activo";
    if (i === indiceActivo + 1) return "proximo";
    return "bloqueado";
  }

  return (
    <AppShell titulo="Rutas">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => {}} />
      <div className="mx-auto max-w-2xl space-y-gap-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-label-lg font-label-lg rounded-full bg-tertiary-fixed px-4 py-1 uppercase tracking-widest text-on-tertiary-fixed">
            Tu Viaje de Aprendizaje
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-primary-fixed">
            Ruta Formativa
          </h2>
        </div>

        {/* Selector de fase. Ampliado (jul 2026): la ruta paso de tener
            siempre 3 fases cortas (Explorar/Aplicar/Dominar) a 4-5 modulos
            con nombres a veces mas largos (Fundamentos/Integrar) segun el
            nivel -- sin overflow-x-auto esta fila desbordaba el ancho de
            pantalla en movil (mismo tipo de bug ya encontrado antes en la
            tabla de la rubrica). */}
        <div className="flex justify-center">
          <p className="no-scrollbar mb-1 text-center text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70 sm:hidden">
            Desliza para ver todos los módulos
          </p>
        </div>
        <div className="no-scrollbar -mx-margin-mobile overflow-x-auto px-margin-mobile">
          <div className="inline-flex w-max gap-1 rounded-full bg-surface-container p-1">
            {fases.map((f) => (
              <button
                key={f.fase}
                onClick={() => setFaseSeleccionada(f.fase)}
                className={`whitespace-nowrap rounded-full px-4 py-2 font-bold uppercase transition-all sm:px-8 ${
                  (faseSeleccionada ?? fases[Math.max(indiceActivo, 0)]?.fase) === f.fase
                    ? "bg-white text-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f.fase}
              </button>
            ))}
          </div>
        </div>

        {rutaCompleta && (
          <div className="atmospheric-shadow rounded-xl bg-tertiary-fixed p-6 text-center text-on-tertiary-fixed">
            <Icon name="emoji_events" filled className="text-4xl" />
            <p className="font-headline-md mt-2">¡Completaste toda tu ruta formativa!</p>
          </div>
        )}

        {/* Roadmap vertical */}
        <div className="relative mx-auto max-w-lg py-10">
          <div className="absolute bottom-0 left-1/2 top-0 w-1 -translate-x-1/2 rounded-full bg-surface-container-highest" />
          <div className="relative space-y-16">
            {fases.map((f, i) => {
              const estado = estadoDe(i);
              if (estado === "activo") {
                return (
                  <div key={f.fase} className="relative flex flex-col items-center">
                    <div className="glow-node relative z-10 flex h-16 w-16 animate-pulse-subtle items-center justify-center rounded-full border-4 border-white bg-secondary">
                      <Icon name={ICONO_NODO[estado]} className="text-3xl text-white" />
                    </div>
                    <div className="atmospheric-shadow mt-4 w-full max-w-xs rounded-xl border-2 border-secondary/20 bg-white p-6 text-center">
                      <h4 className="font-headline-md text-headline-md text-secondary">
                        Fase: {f.fase}
                      </h4>
                      <p className="my-2 text-on-surface-variant">{f.descripcion}</p>
                      <div className="mb-4 h-1.5 w-full rounded-full bg-surface-container-highest">
                        <div
                          className="h-full rounded-full bg-secondary"
                          style={{
                            width: progresoRutas[f.fase] === "en_progreso" ? "65%" : "25%",
                          }}
                        />
                      </div>
                      <button
                        onClick={() => router.push("/rutas/reto")}
                        className="w-full rounded-full bg-secondary py-3 font-bold text-on-secondary transition-shadow hover:shadow-lg"
                      >
                        VER RETOS
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={f.fase}
                  className={`relative flex items-center justify-center ${
                    estado === "bloqueado" ? "opacity-30" : estado === "proximo" ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-lg ${
                      estado === "completado" ? "bg-tertiary-container" : "bg-surface-container-highest"
                    }`}
                  >
                    <Icon
                      name={ICONO_NODO[estado]}
                      className={estado === "completado" ? "text-white" : "text-on-surface-variant"}
                    />
                  </div>
                  {estado === "completado" && (
                    <div className="absolute left-20 hidden w-48 rounded-xl border-l-4 border-tertiary-container bg-white p-4 shadow-md md:block">
                      <p className="text-body-sm font-bold">Fase: {f.fase}</p>
                      <span className="text-[12px] font-black text-tertiary-container">
                        COMPLETADO
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
