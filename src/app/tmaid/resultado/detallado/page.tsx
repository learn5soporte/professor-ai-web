"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";
import type { Dimension } from "@/lib/tmaid/preguntas";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Análisis Detallado del Perfil IA -- base literal: code.html real de Stitch
 * (an_lisis_detallado_del_perfil_ia). A diferencia del Stitch original (que
 * inventaba un "95% de potencial" y un PDF descargable falso), aquí todo
 * numero sale de resultadoTmaid real, y la descarga genera un .txt real.
 *
 * Nota (jul 2026): masDebil usaba "<=" en el reduce, lo que con las 4
 * dimensiones empatadas colisionaba con masFuerte (misma clase de bug ya
 * corregida en scoring.ts -- ver ese archivo). Con "<" estricto, masFuerte
 * y masDebil recorren la lista en direcciones distintas y solo coinciden
 * si las 4 dimensiones son identicas.
 */

const ICONO_DIMENSION: Record<Dimension, string> = {
  conocimientoIA: "psychology",
  usoHerramientas: "handyman",
  integracionAula: "account_tree",
  actitudCambio: "rocket_launch",
};

export default function AnalisisDetalladoPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, progresoRutas, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const { dimensiones } = resultadoTmaid;
  const dims = Object.keys(dimensiones) as Dimension[];
  const masFuerte = dims.reduce((a, b) => (dimensiones[a] >= dimensiones[b] ? a : b));
  const masDebil = dims.reduce((a, b) => (dimensiones[a] < dimensiones[b] ? a : b));
  const afinidadIA = Math.round((resultadoTmaid.puntajePromedio / 5) * 100);

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

  function descargarResumen() {
    if (!resultadoTmaid) return;
    const lineas = [
      `Análisis detallado del perfil IA -- ${perfil?.nombre ?? ""}`,
      `Nivel: ${resultadoTmaid.nivelAsignado}`,
      "",
      resultadoTmaid.perfilPedagogicoIA,
      "",
      "Dimensiones:",
      ...dims.map(
        (d) => `- ${ETIQUETA_DIMENSION[d]}: ${Math.round((dimensiones[d] / 5) * 100)}%`
      ),
      "",
      "Diagnóstico por dimensión:",
      ...resultadoTmaid.mapaBrechas.map((b) => `- ${b}`),
      "",
      "Plan de acción:",
      ...resultadoTmaid.rutaPersonalizada.map(
        (f, i) => `${i + 1}. ${f.fase}: ${f.descripcion}`
      ),
    ];
    const blob = new Blob([lineas.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analisis-perfil-ia.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell titulo="Análisis Detallado">
      <div className="mx-auto max-w-5xl space-y-gap-xl">
        <Link
          href="/tmaid/resultado"
          className="text-body-sm inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> Volver a mi perfil
        </Link>

        <section>
          <span className="gold-chip inline-block rounded-full px-4 py-1 text-xs font-bold uppercase">
            Diagnóstico TMAID
          </span>
          <h1 className="font-headline-lg text-headline-lg mb-4 mt-4 text-primary">
            Análisis detallado
          </h1>
          <p className="text-body-lg max-w-2xl leading-relaxed text-on-surface-variant">
            {resultadoTmaid.perfilPedagogicoIA}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-gap-xl md:grid-cols-12">
          <div className="atmospheric-shadow relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 md:col-span-7 lg:col-span-8">
            <h3 className="font-headline-md text-headline-md mb-1 text-primary">
              Dimensiones IA
            </h3>
            <p className="text-body-sm mb-8 text-on-surface-variant">
              Análisis comparativo de tus competencias digitales
            </p>
            <div className="flex flex-col items-center gap-12 lg:flex-row">
              <div className="h-64 w-64 flex-shrink-0 md:h-80 md:w-80">
                <svg className="h-full w-full drop-shadow-xl" viewBox="0 0 200 200">
                  <polygon fill="none" points="100,20 180,100 100,180 20,100" stroke="#e1e3e4" strokeWidth="1" />
                  <polygon fill="none" points="100,40 160,100 100,160 40,100" stroke="#e1e3e4" strokeWidth="1" />
                  <polygon fill="none" points="100,60 140,100 100,140 60,100" stroke="#e1e3e4" strokeWidth="1" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="#e1e3e4" strokeWidth="1" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="#e1e3e4" strokeWidth="1" />
                  <polygon fill="rgba(37,82,202,0.2)" points={puntosRadar} stroke="#cba82f" strokeWidth="3" />
                </svg>
              </div>
              <div className="w-full flex-grow space-y-6">
                {dims.map((d) => {
                  const pct = Math.round((dimensiones[d] / 5) * 100);
                  return (
                    <div key={d} className="space-y-2">
                      <div className="text-label-lg flex justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name={ICONO_DIMENSION[d]} className="text-outline-variant" />
                          {ETIQUETA_DIMENSION[d]}
                        </span>
                        <span className="font-bold text-secondary">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-container-high">
                        <div
                          className="h-full rounded-full bg-secondary transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-gap-xl md:col-span-5 lg:col-span-4">
            <div className="atmospheric-shadow flex flex-1 flex-col justify-between rounded-xl bg-primary-container p-8 text-on-primary-container">
              <div>
                <Icon name="star" filled className="mb-4 text-4xl" />
                <h4 className="font-headline-md text-headline-md mb-2">Fortaleza principal</h4>
                <p className="text-body-md opacity-80">{ETIQUETA_DIMENSION[masFuerte]}</p>
              </div>
              <p className="text-body-sm mt-6 border-t border-white/10 pt-6 italic">
                Es tu dimensión más sólida hoy -- apóyate en ella al probar cosas nuevas.
              </p>
            </div>
            <div className="atmospheric-shadow flex flex-1 flex-col justify-between rounded-xl bg-secondary-container p-8 text-on-secondary-container">
              <div>
                <Icon name="psychology" className="mb-4 text-4xl" />
                <h4 className="font-headline-md text-headline-md mb-2">Área de crecimiento</h4>
                <p className="text-body-md opacity-80">{ETIQUETA_DIMENSION[masDebil]}</p>
              </div>
              <Link
                href="/rutas"
                className="text-label-lg mt-6 inline-flex items-center gap-2 font-bold hover:underline"
              >
                Ver ruta recomendada <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-12">
            <h3 className="font-headline-md text-headline-md mb-8 text-primary">
              Plan de acción recomendado
            </h3>
            <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-3">
              {resultadoTmaid.rutaPersonalizada.map((f, i) => {
                const estado = progresoRutas[f.fase] ?? "pendiente";
                const completado = estado === "completado";
                const colores = [
                  { borde: "border-secondary", icono: "auto_awesome", bg: "bg-secondary/10", texto: "text-secondary" },
                  { borde: "border-tertiary-container", icono: "data_object", bg: "bg-tertiary-container/10", texto: "text-tertiary" },
                  { borde: "border-primary", icono: "balance", bg: "bg-primary/10", texto: "text-primary" },
                ][i % 3];
                return (
                  <div
                    key={f.fase}
                    className={`atmospheric-shadow rounded-xl border-t-4 bg-surface-container-lowest p-8 ${colores.borde}`}
                  >
                    <div
                      className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${colores.bg} ${colores.texto}`}
                    >
                      <Icon name={completado ? "check" : colores.icono} />
                    </div>
                    <h5 className="font-headline-md mb-4 text-[20px] text-primary">
                      {f.fase}
                    </h5>
                    <p className="text-body-md mb-6 text-on-surface-variant">
                      {f.descripcion}
                    </p>
                    <Link
                      href={completado ? "/rutas" : "/rutas/reto"}
                      className="text-label-lg block w-full rounded-full bg-primary py-3 text-center font-bold text-on-primary transition-colors hover:bg-secondary"
                    >
                      {completado ? "Completado" : "Empezar ahora"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="atmospheric-shadow relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl bg-primary-container p-12 text-on-primary-container md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h3 className="mb-4 text-[28px] font-bold">Tu afinidad actual con IA</h3>
            <p className="text-body-lg mb-6 opacity-90">
              Hoy tu puntaje promedio equivale a un {afinidadIA}% de afinidad con el uso
              pedagógico de IA. Sigue tu ruta formativa para seguir subiéndolo.
            </p>
            <button
              onClick={descargarResumen}
              className="text-label-lg flex items-center gap-2 rounded-full bg-secondary-container px-8 py-3 font-bold text-on-secondary-container transition-all hover:opacity-90"
            >
              Descargar resumen (.txt) <Icon name="download" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
