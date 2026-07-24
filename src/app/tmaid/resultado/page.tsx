"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";
import { BADGES, calcularNivel } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * SCREEN 13: RESULTADO -- base literal: code.html real de Stitch
 * (bloque_3_diagn_stico_tmaid), incluido el radar SVG de competencias,
 * la grilla de metricas, brechas y acciones prioritarias.
 *
 * Nota (verificacion final): el viewBox del radar se amplio de "0 0 200
 * 200" a "-40 -10 280 220" -- las etiquetas laterales "HERRAMIENTAS" y
 * "ACTITUD" (ancladas a los bordes, no centradas) se recortaban contra el
 * borde del viewBox original. El mismo ajuste se aplico en /progreso, que
 * reutiliza este radar.
 *
 * Nota (feedback docente, jul 2026): mapaBrechas ahora siempre trae las 4
 * dimensiones (no solo las debiles) con un consejo especifico cada una --
 * el titulo de esta seccion paso de "Brechas Identificadas" a "Diagnostico
 * por Dimension" porque ya no todas son "brechas" en sentido estricto.
 */

const PERSONA_POR_NIVEL: Record<string, string> = {
  Iniciante: "Docente Explorador",
  "En desarrollo": "Docente Curioso",
  Avanzado: "Docente Aplicador",
  Experto: "Docente Referente",
};

const METRICA_ICONO: Record<string, string> = {
  conocimientoIA: "psychology",
  usoHerramientas: "handyman",
  integracionAula: "account_tree",
  actitudCambio: "rocket_launch",
};

const METRICA_LABEL: Record<string, string> = {
  conocimientoIA: "Teoría",
  usoHerramientas: "Uso",
  integracionAula: "Aulas",
  actitudCambio: "Mentalidad",
};

export default function ResultadoTmaidPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, badges, puntos, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) {
      router.replace("/login");
    } else if (!perfilCompleto(perfil)) {
      router.replace("/onboarding");
    } else if (!resultadoTmaid) {
      router.replace("/tmaid");
    }
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !perfilCompleto(perfil) || !resultadoTmaid) {
    return null;
  }

  const { dimensiones } = resultadoTmaid;
  const { nivel } = calcularNivel(puntos);

  // Radar: N=conocimiento, E=herramientas, S=integracion, W=actitud.
  // Centro (100,100), radio maximo 80, cada dimension en escala 1-5 -> 0..1.
  const frac = {
    n: dimensiones.conocimientoIA / 5,
    e: dimensiones.usoHerramientas / 5,
    s: dimensiones.integracionAula / 5,
    w: dimensiones.actitudCambio / 5,
  };
  const puntosRadar = [
    `100,${100 - 80 * frac.n}`,
    `${100 + 80 * frac.e},100`,
    `100,${100 + 80 * frac.s}`,
    `${100 - 80 * frac.w},100`,
  ].join(" ");

  return (
    <AppShell titulo="Perfil">
      <div className="-mx-6 -mt-20 mb-8 overflow-hidden bg-white px-6 pb-8 pt-24 text-center md:px-margin-page">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-secondary-container blur-[80px]" />
        </div>
        <div className="relative z-10">
          <span className="font-label-lg mb-4 inline-block rounded-full bg-secondary-fixed px-4 py-1 text-secondary">
            TU PERFIL IA
          </span>
          <h1 className="font-display-lg text-headline-lg-mobile text-primary md:text-display-lg">
            {PERSONA_POR_NIVEL[resultadoTmaid.nivelAsignado] ?? resultadoTmaid.nivelAsignado}
          </h1>
          <p className="text-body-lg mx-auto mt-2 max-w-xl text-on-surface-variant">
            {resultadoTmaid.perfilPedagogicoIA}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-xl lg:grid-cols-2">
        <div className="atmospheric-shadow flex flex-col items-center rounded-3xl bg-white p-8">
          <h3 className="font-headline-md mb-8 self-start">Mapa de Competencias</h3>
          <div className="w-full max-w-[400px]">
            <svg className="h-auto w-full drop-shadow-xl" viewBox="-40 -10 280 220">
              <polygon fill="none" points="100,20 180,100 100,180 20,100" stroke="#e1e3e4" strokeWidth="1" />
              <polygon fill="none" points="100,40 160,100 100,160 40,100" stroke="#e1e3e4" strokeWidth="1" />
              <polygon fill="none" points="100,60 140,100 100,140 60,100" stroke="#e1e3e4" strokeWidth="1" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="#e1e3e4" strokeWidth="1" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="#e1e3e4" strokeWidth="1" />
              <polygon fill="rgba(37, 82, 202, 0.4)" points={puntosRadar} stroke="#cba82f" strokeWidth="3" />
              <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="middle" x="100" y="15">
                CONOCIMIENTO
              </text>
              <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="start" x="185" y="103">
                HERRAMIENTAS
              </text>
              <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="middle" x="100" y="193">
                INTEGRACIÓN
              </text>
              <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="end" x="15" y="103">
                ACTITUD
              </text>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(dimensiones) as (keyof typeof dimensiones)[]).map((dim) => {
            const pct = Math.round((dimensiones[dim] / 5) * 100);
            return (
              <div key={dim} className="atmospheric-shadow rounded-2xl bg-white p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-label-lg text-tertiary-container">{pct}%</span>
                  <Icon name={METRICA_ICONO[dim]} className="text-outline-variant" />
                </div>
                <p className="font-headline-md mb-2">{METRICA_LABEL[dim]}</p>
                <div className="h-1 w-full rounded-full bg-surface-container-highest">
                  <div className="h-full rounded-full bg-secondary-container" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}

          <div className="col-span-2 mt-4">
            <div className="atmospheric-shadow rounded-3xl bg-white/50 p-8">
              <h4 className="font-headline-md mb-6">Diagnóstico por Dimensión</h4>
              <ul className="space-y-4">
                {resultadoTmaid.mapaBrechas.map((brecha) => (
                  <li key={brecha} className="flex items-center gap-4 text-on-surface-variant">
                    <Icon name="warning" filled className="text-tertiary-container" />
                    {brecha}
                  </li>
                ))}
              </ul>

              <h4 className="font-headline-md mb-6 mt-12">Acciones Prioritarias</h4>
              <div className="space-y-4">
                {resultadoTmaid.rutaPersonalizada.map((fase, i) => (
                  <div key={fase.fase} className="group flex items-start gap-4">
                    <span className="text-headline-md text-tertiary-container/30 transition-colors group-hover:text-tertiary-container">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-body-md flex-grow border-b border-surface-container-highest py-1">
                      {fase.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="atmospheric-shadow rounded-3xl bg-white p-8">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-headline-md">Tus badges</h4>
                <span className="text-sm text-on-surface-variant">
                  Nv.{nivel} · {puntos} pts
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(BADGES).map((badge) => {
                  const desbloqueado = badges.includes(badge.id);
                  return (
                    <span
                      key={badge.id}
                      title={`${badge.nombre}: ${badge.descripcion}`}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                        desbloqueado
                          ? "bg-tertiary-container text-on-tertiary-container"
                          : "bg-surface-container-low text-on-surface-variant opacity-40"
                      }`}
                    >
                      {badge.emoji} {badge.nombre}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl space-y-3">
        <Link
          href="/rutas"
          className="font-headline-md group flex w-full items-center justify-between rounded-full bg-on-secondary-fixed px-10 py-5 text-on-secondary shadow-xl transition-all hover:bg-secondary active:scale-95"
        >
          Ver Mi Plan de Ruta Personalizado
          <Icon name="trending_flat" className="transition-transform group-hover:translate-x-2" />
        </Link>
        <Link
          href="/tmaid/resultado/detallado"
          className="flex w-full items-center justify-between rounded-full border border-outline-variant px-10 py-4 text-on-surface transition-all hover:bg-surface-container-low active:scale-95"
        >
          Ver análisis detallado de mi perfil IA
          <Icon name="arrow_forward" />
        </Link>
      </div>
    </AppShell>
  );
}
