"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Detalle de Módulo -- base literal: code.html real de Stitch
 * (detalle_de_m_dulo_diferenciaci_n_pedag_gica). A diferencia del original
 * de Stitch (que mostraba 3 "retos" ficticios dentro de un mismo módulo,
 * con fechas inventadas como "Finalizado hace 2 días"), aquí el "módulo"
 * ES una fase real de rutaPersonalizada y la "Lista de Retos" muestra las
 * 3 fases reales de la ruta (Explorar/Aplicar/Dominar) con su estado real
 * (progresoRutas), sin datos de relleno ni fechas falsas.
 *
 * Este es un componente cliente separado de page.tsx porque una página
 * "use client" no puede exportar generateStaticParams (requerido por
 * output: "export" para rutas dinámicas) -- ver page.tsx en esta carpeta.
 */

const BADGE_POR_FASE: Record<string, string> = {
  Explorar: "fase-explorar",
  Aplicar: "fase-aplicar",
  Dominar: "fase-dominar",
};

const ICONO_POR_FASE: Record<string, string> = {
  Explorar: "explore",
  Aplicar: "psychology",
  Dominar: "military_tech",
};

export function DetalleModuloClient({ nombreFase }: { nombreFase: string | null }) {
  const router = useRouter();
  const { perfil, resultadoTmaid, progresoRutas, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !perfilCompleto(perfil) || !resultadoTmaid || !nombreFase) return null;

  const fases = resultadoTmaid.rutaPersonalizada;
  const fase = fases.find((f) => f.fase === nombreFase);
  if (!fase) return null;

  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const completado = progresoRutas[nombreFase] === "completado";
  const badgeInfo = BADGES[BADGE_POR_FASE[nombreFase]];

  function estadoDe(i: number): "completado" | "activo" | "proximo" | "bloqueado" {
    if (progresoRutas[fases[i].fase] === "completado") return "completado";
    if (i === indiceActivo) return "activo";
    if (i === indiceActivo + 1) return "proximo";
    return "bloqueado";
  }

  return (
    <AppShell titulo="Detalle de Módulo">
      <div className="mx-auto max-w-5xl space-y-gap-xl">
        <Link
          href="/rutas"
          className="text-body-sm inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> Volver a mi ruta
        </Link>

        <div className="grid grid-cols-1 gap-gap-xl lg:grid-cols-12 lg:items-start">
          <div className="space-y-gap-lg lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1 text-on-tertiary-fixed">
              <Icon name={ICONO_POR_FASE[nombreFase]} className="text-[18px]" />
              <span className="text-label-lg font-label-lg">
                MÓDULO · {nombreFase.toUpperCase()}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg max-w-2xl text-primary">
              Fase: {nombreFase}
            </h1>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              {fase.descripcion}
            </p>
            <div className="flex flex-wrap gap-gap-md pt-4">
              <div className="atmospheric-shadow flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-3">
                <Icon name="schedule" className="text-secondary" />
                <div className="flex flex-col">
                  <span className="text-label-lg font-label-lg text-primary">
                    TIEMPO ESTIMADO
                  </span>
                  <span className="text-body-sm text-on-surface-variant">~30 min</span>
                </div>
              </div>
              <div className="atmospheric-shadow flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-3">
                <Icon name="military_tech" className="text-tertiary" />
                <div className="flex flex-col">
                  <span className="text-label-lg font-label-lg text-primary">RECOMPENSA</span>
                  <span className="text-body-sm text-on-surface-variant">
                    {badgeInfo?.puntos ?? 0} XP disponibles
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="atmospheric-shadow rounded-3xl bg-surface-container-lowest p-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-label-lg font-label-lg text-primary">
                  PROGRESO DEL MÓDULO
                </span>
                <span className="text-body-sm font-bold text-secondary">
                  {completado ? "100%" : "0%"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-1000"
                  style={{ width: completado ? "100%" : "0%" }}
                />
              </div>
              <p className="text-body-sm mt-2 text-on-surface-variant">
                {completado ? "1 de 1 reto completado" : "0 de 1 reto completado"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-headline-md text-headline-md mb-8 text-primary">
            Tu ruta completa
          </h3>
          <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-3">
            {fases.map((f, i) => {
              const estado = estadoDe(i);
              if (estado === "completado") {
                return (
                  <div
                    key={f.fase}
                    className="atmospheric-shadow rounded-3xl border-2 border-transparent bg-surface-container-lowest p-8"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container/10 text-secondary">
                        <Icon name="check_circle" filled />
                      </div>
                      <span className="text-label-lg font-label-lg rounded-full bg-surface-container-high px-3 py-1 text-on-surface-variant">
                        COMPLETADO
                      </span>
                    </div>
                    <h4 className="font-headline-md text-headline-md mb-3 text-primary">
                      {f.fase}
                    </h4>
                    <p className="text-body-md text-on-surface-variant">{f.descripcion}</p>
                  </div>
                );
              }
              if (estado === "activo") {
                return (
                  <div
                    key={f.fase}
                    className="atmospheric-shadow relative rounded-3xl border-2 border-secondary bg-surface-container-lowest p-8 ring-8 ring-secondary/5"
                  >
                    <div className="text-label-lg font-label-lg absolute -top-4 left-8 rounded-full bg-secondary px-4 py-1 text-on-secondary shadow-lg">
                      SIGUIENTE PASO
                    </div>
                    <div className="mb-6 flex items-start justify-between">
                      <div className="glow-node flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-on-secondary">
                        <Icon name={ICONO_POR_FASE[f.fase] ?? "psychology"} />
                      </div>
                      <span className="text-label-lg font-label-lg rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container">
                        ACTIVO
                      </span>
                    </div>
                    <h4 className="font-headline-md text-headline-md mb-3 text-primary">
                      {f.fase}
                    </h4>
                    <p className="text-body-md mb-8 text-on-surface-variant">{f.descripcion}</p>
                    <Link
                      href="/rutas/reto"
                      className="text-label-lg flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                    >
                      EMPEZAR RETO <Icon name="play_arrow" className="text-[18px]" />
                    </Link>
                  </div>
                );
              }
              return (
                <div
                  key={f.fase}
                  className="rounded-3xl border-2 border-dashed border-outline-variant bg-surface-container/50 p-8 opacity-70 grayscale"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-highest text-outline">
                      <Icon name="lock" />
                    </div>
                    <span className="text-label-lg font-label-lg rounded-full bg-surface-container-highest px-3 py-1 text-on-surface-variant">
                      BLOQUEADO
                    </span>
                  </div>
                  <h4 className="font-headline-md text-headline-md mb-3 text-primary">
                    {f.fase}
                  </h4>
                  <p className="text-body-md mb-6 text-on-surface-variant">{f.descripcion}</p>
                  <div className="flex items-center gap-2 text-outline">
                    <Icon name="info" className="text-[18px]" />
                    <span className="text-label-lg font-label-lg">
                      Requiere completar la fase anterior
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
