"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { etiquetaDimension } from "@/lib/tmaid/scoring";
import type { Dimension } from "@/lib/tmaid/preguntas";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import { tpl, type Traducciones } from "@/lib/i18n/traducciones";

/**
 * Mi Progreso -- base literal: code.html real de Stitch
 * (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 27: mi-progreso).
 * Reusa el mismo radar SVG que /tmaid/resultado (mismas 4 dimensiones).
 * La "actividad mensual" es ilustrativa -- Fase 0 no tiene tracking real de
 * uso diario todavía; el "re-diagnostico" de Stitch (countdown falso) se
 * reemplaza por un CTA real, ya que /tmaid ya soporta repetirse.
 *
 * Nota (verificacion final): mismo ajuste de viewBox que /tmaid/resultado
 * ("-40 -10 280 220" en vez de "0 0 200 200") para que las etiquetas
 * "HERRAMIENTAS"/"ACTITUD" no se recorten contra el borde del SVG.
 */

function nivelTmaidLabel(t: Traducciones, nivel: string): string {
  const mapa: Record<string, string> = {
    Iniciante: t.tmaid.nivelIniciante,
    "En desarrollo": t.tmaid.nivelEnDesarrollo,
    Avanzado: t.tmaid.nivelAvanzado,
    Experto: t.tmaid.nivelExperto,
  };
  return mapa[nivel] ?? nivel;
}

export default function ProgresoPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, baselineTmaid, badges, puntos, racha, cargando } = useSession();
  const { t } = useIdioma();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const meses = t.progreso.meses.split(",");

  const { dimensiones } = resultadoTmaid;
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

  // Actividad ilustrativa: derivada de puntos/racha para que no sea siempre
  // igual entre docentes, pero claramente marcada como no-real todavía.
  const semilla = puntos + racha * 7;
  const barras = meses.map((_, i) => 25 + ((semilla * (i + 3)) % 65));

  return (
    <AppShell titulo={t.shell.progreso}>
      <div className="mx-auto max-w-4xl space-y-gap-xl">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
            {t.progreso.seguimiento}
          </span>
          <h1 className="font-headline text-3xl font-black tracking-tight text-on-primary-fixed sm:text-4xl md:text-5xl">
            {t.progreso.miProgreso}
          </h1>
        </div>

        <div className="flex flex-col gap-xl md:flex-row md:items-stretch">
          <div className="atmospheric-shadow flex flex-1 flex-col items-center rounded-[2.5rem] bg-white p-8">
            <h3 className="font-headline mb-6 w-full text-xl font-bold">
              {t.progreso.perfilCompetencias}
            </h3>
            <div className="w-full max-w-[300px]">
              <svg className="h-auto w-full drop-shadow-lg" viewBox="-40 -10 280 220">
                <polygon fill="none" points="100,20 180,100 100,180 20,100" stroke="#e1e3e4" strokeWidth="1" />
                <polygon fill="none" points="100,40 160,100 100,160 40,100" stroke="#e1e3e4" strokeWidth="1" />
                <polygon fill="none" points="100,60 140,100 100,140 60,100" stroke="#e1e3e4" strokeWidth="1" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#e1e3e4" strokeWidth="1" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#e1e3e4" strokeWidth="1" />
                <polygon fill="rgba(37, 82, 202, 0.2)" points={puntosRadar} stroke="#2552ca" strokeWidth="2" />
                <text className="fill-on-surface-variant font-label font-bold" style={{ fontSize: "8px" }} textAnchor="middle" x="100" y="15">
                  {t.tmaid.radarConocimiento}
                </text>
                <text className="fill-on-surface-variant font-label font-bold" style={{ fontSize: "8px" }} textAnchor="start" x="185" y="103">
                  {t.tmaid.radarHerramientas}
                </text>
                <text className="fill-on-surface-variant font-label font-bold" style={{ fontSize: "8px" }} textAnchor="middle" x="100" y="193">
                  {t.tmaid.radarIntegracion}
                </text>
                <text className="fill-on-surface-variant font-label font-bold" style={{ fontSize: "8px" }} textAnchor="end" x="15" y="103">
                  {t.tmaid.radarActitud}
                </text>
              </svg>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-gap-md">
            <div className="grid grid-cols-3 gap-4">
              <StatCard valor={String(racha)} etiqueta={t.progreso.racha} color="text-secondary" />
              <StatCard valor={String(badges.length)} etiqueta={t.progreso.insignias} color="text-tertiary-container" />
              <StatCard valor={`${puntos}`} etiqueta={t.progreso.xp} color="text-on-primary-fixed" />
            </div>

            <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 self-end">
              <Link
                href="/informes"
                className="text-sm font-bold text-secondary hover:underline"
              >
                {t.progreso.generarInforme}
              </Link>
              <Link
                href="/insignias"
                className="text-sm font-bold text-secondary hover:underline"
              >
                {t.progreso.verInsignias}
              </Link>
            </div>

            <div className="atmospheric-shadow space-y-4 rounded-[2rem] bg-white p-6">
              <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t.progreso.actividadMensual}
              </h4>
              <div className="flex h-32 items-end justify-between gap-2 pt-4">
                {barras.map((alto, i) => (
                  <div
                    key={meses[i]}
                    className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-secondary-fixed-dim"
                    style={{ height: `${alto}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-label font-bold text-outline">
                {meses.map((m) => (
                  <span key={m}>{m.toUpperCase()}</span>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {t.progreso.actividadIlustrativa}
              </p>
            </div>
          </div>
        </div>

        <EvolucionTmaid resultadoTmaid={resultadoTmaid} baselineTmaid={baselineTmaid} />

        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-on-primary-fixed to-[#003baf] p-8 text-white md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-headline text-xl font-bold">{t.progreso.listoSiguiente}</h3>
            <p className="text-base text-white/80">{t.progreso.repetirTexto}</p>
          </div>
          <Link
            href="/tmaid"
            className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-tertiary-container/90 px-8 py-4 font-bold text-on-tertiary-container transition-transform hover:scale-105"
          >
            {t.progreso.repetirDiagnostico} <Icon name="autorenew" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  valor,
  etiqueta,
  color,
}: {
  valor: string;
  etiqueta: string;
  color: string;
}) {
  return (
    <div className="atmospheric-shadow rounded-2xl bg-white p-4 text-center">
      <span className={`font-headline block text-xl font-bold ${color}`}>{valor}</span>
      <span className="font-label text-xs text-on-surface-variant">{etiqueta}</span>
    </div>
  );
}


/**
 * "Tu evolucion" -- linea base de progreso pedida por un docente probando
 * el prototipo ("asi comenzaste, en esto mejoraste", feedback 2026-07-23).
 * baselineTmaid viene de la migracion 0003_tmaid_baseline.sql (columna
 * primer_resultado, congelada por un trigger en el servidor la primera
 * vez que el docente completa el TMAID -- nunca se pisa aunque lo repita
 * despues). Si esa migracion todavia no corrio en el proyecto de Supabase
 * del usuario, baselineTmaid es simplemente null (ver datos.ts) y esta
 * seccion muestra el aviso "aun no hay datos" en vez de romper nada o
 * inventar una comparacion falsa.
 */
function EvolucionTmaid({
  resultadoTmaid,
  baselineTmaid,
}: {
  resultadoTmaid: NonNullable<ReturnType<typeof useSession>["resultadoTmaid"]>;
  baselineTmaid: ReturnType<typeof useSession>["baselineTmaid"];
}) {
  const { idioma, t } = useIdioma();

  if (!baselineTmaid) {
    return (
      <div className="atmospheric-shadow rounded-[2rem] bg-white p-6">
        <h4 className="font-label text-xs font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
          {t.progreso.tuEvolucion}
        </h4>
        <p className="text-sm text-on-surface-variant">{t.progreso.sinDatos}</p>
      </div>
    );
  }

  const dimensionesIguales =
    (Object.keys(resultadoTmaid.dimensiones) as (keyof typeof resultadoTmaid.dimensiones)[]).every(
      (d) => resultadoTmaid.dimensiones[d] === baselineTmaid.dimensiones[d]
    );
  const esUnicoDiagnostico =
    dimensionesIguales && resultadoTmaid.puntajePromedio === baselineTmaid.puntajePromedio;

  if (esUnicoDiagnostico) {
    return (
      <div className="atmospheric-shadow rounded-[2rem] bg-white p-6">
        <h4 className="font-label text-xs font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
          {t.progreso.tuEvolucion}
        </h4>
        <p className="text-sm text-on-surface-variant">
          {tpl(t.progreso.unicoDiagnostico, {
            nivel: nivelTmaidLabel(t, resultadoTmaid.nivelAsignado),
            puntaje: resultadoTmaid.puntajePromedio.toFixed(1),
          })}
        </p>
      </div>
    );
  }

  const deltaPromedio = Number(
    (resultadoTmaid.puntajePromedio - baselineTmaid.puntajePromedio).toFixed(1)
  );

  return (
    <div className="atmospheric-shadow rounded-[2rem] bg-white p-6">
      <h4 className="font-label text-xs font-bold mb-4 uppercase tracking-widest text-on-surface-variant">
        {t.progreso.tuEvolucion}
      </h4>
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-outline">
            {t.progreso.puntoPartida}
          </p>
          <p className="font-headline text-xl font-bold text-on-surface-variant">
            {nivelTmaidLabel(t, baselineTmaid.nivelAsignado)}
          </p>
          <p className="text-sm text-outline">{baselineTmaid.puntajePromedio.toFixed(1)}/5</p>
        </div>
        <Icon name="trending_flat" className="text-2xl text-outline" />
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-outline">
            {t.progreso.ahora}
          </p>
          <p className="font-headline text-xl font-bold text-secondary">
            {nivelTmaidLabel(t, resultadoTmaid.nivelAsignado)}
          </p>
          <p className="text-sm text-outline">{resultadoTmaid.puntajePromedio.toFixed(1)}/5</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
            deltaPromedio >= 0
              ? "bg-tertiary-fixed text-on-tertiary-fixed"
              : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          {deltaPromedio >= 0 ? "+" : ""}
          {deltaPromedio}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(Object.keys(resultadoTmaid.dimensiones) as (keyof typeof resultadoTmaid.dimensiones)[]).map(
          (d) => {
            const delta = Number(
              (resultadoTmaid.dimensiones[d] - baselineTmaid.dimensiones[d]).toFixed(1)
            );
            return (
              <div
                key={d}
                className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2 text-xs"
              >
                <span className="text-on-surface-variant">
                  {etiquetaDimension(d as Dimension, idioma)}
                </span>
                <span
                  className={
                    delta > 0
                      ? "font-bold text-secondary"
                      : delta < 0
                      ? "font-bold text-error"
                      : "text-on-surface-variant"
                  }
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
