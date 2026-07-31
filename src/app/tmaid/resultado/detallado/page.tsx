"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { etiquetaDimension, localizarResultadoTmaid } from "@/lib/tmaid/scoring";
import type { Dimension } from "@/lib/tmaid/preguntas";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import { tpl } from "@/lib/i18n/traducciones";
import { etiquetaFase } from "@/lib/i18n/valores";

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
  const { idioma, t } = useIdioma();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const resultado = localizarResultadoTmaid(resultadoTmaid, perfil, idioma);

  const nivelLabel: Record<string, string> = {
    Iniciante: t.tmaid.nivelIniciante,
    "En desarrollo": t.tmaid.nivelEnDesarrollo,
    Avanzado: t.tmaid.nivelAvanzado,
    Experto: t.tmaid.nivelExperto,
  };

  const { dimensiones } = resultado;
  const dims = Object.keys(dimensiones) as Dimension[];
  const masFuerte = dims.reduce((a, b) => (dimensiones[a] >= dimensiones[b] ? a : b));
  const masDebil = dims.reduce((a, b) => (dimensiones[a] < dimensiones[b] ? a : b));
  const afinidadIA = Math.round((resultado.puntajePromedio / 5) * 100);

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
    const lineas = [
      `${t.tmaid.txtTitulo} -- ${perfil?.nombre ?? ""}`,
      `${t.tmaid.nivelLabel}: ${nivelLabel[resultado.nivelAsignado] ?? resultado.nivelAsignado}`,
      "",
      resultado.perfilPedagogicoIA,
      "",
      t.tmaid.dimensionesLabel,
      ...dims.map(
        (d) =>
          `- ${etiquetaDimension(d, idioma)}: ${Math.round((dimensiones[d] / 5) * 100)}%`
      ),
      "",
      `${t.tmaid.diagnosticoPorDimension}:`,
      ...resultado.mapaBrechas.map((b) => `- ${b}`),
      "",
      t.tmaid.planAccionLabel,
      ...resultado.rutaPersonalizada.map(
        (f, i) => `${i + 1}. ${etiquetaFase(f.fase, idioma)}: ${f.descripcion}`
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
    <AppShell titulo={t.tmaid.analisisDetallado}>
      <div className="mx-auto max-w-5xl space-y-gap-xl">
        <Link
          href="/tmaid/resultado"
          className="text-sm inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> {t.tmaid.volverPerfil}
        </Link>

        <section>
          <span className="gold-chip inline-block rounded-full px-4 py-1 text-xs font-bold uppercase">
            {t.tmaid.diagnosticoTmaid}
          </span>
          <h1 className="font-headline mb-4 mt-4 text-3xl font-black text-primary sm:text-4xl">
            {t.tmaid.analisisDetallado}
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed text-on-surface-variant">
            {resultado.perfilPedagogicoIA}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-gap-xl md:grid-cols-12">
          <div className="atmospheric-shadow relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 md:col-span-7 lg:col-span-8">
            <h3 className="font-headline text-xl font-bold mb-1 text-primary">
              {t.tmaid.dimensionesIA}
            </h3>
            <p className="text-sm mb-8 text-on-surface-variant">
              {t.tmaid.comparativo}
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
                      <div className="font-label flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icon name={ICONO_DIMENSION[d]} className="text-outline-variant" />
                          {etiquetaDimension(d, idioma)}
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
                <h4 className="font-headline text-xl font-bold mb-2">{t.tmaid.fortaleza}</h4>
                <p className="text-base opacity-80">{etiquetaDimension(masFuerte, idioma)}</p>
              </div>
              <p className="text-sm mt-6 border-t border-white/10 pt-6 italic">
                {t.tmaid.fortalezaNota}
              </p>
            </div>
            <div className="atmospheric-shadow flex flex-1 flex-col justify-between rounded-xl bg-secondary-container p-8 text-on-secondary-container">
              <div>
                <Icon name="psychology" className="mb-4 text-4xl" />
                <h4 className="font-headline text-xl font-bold mb-2">{t.tmaid.areaCrecimiento}</h4>
                <p className="text-base opacity-80">{etiquetaDimension(masDebil, idioma)}</p>
              </div>
              <Link
                href="/rutas"
                className="font-label mt-6 inline-flex items-center gap-2 text-sm font-bold hover:underline"
              >
                {t.tmaid.verRutaRecomendada} <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-12">
            <h3 className="font-headline text-xl font-bold mb-8 text-primary">
              {t.tmaid.planAccion}
            </h3>
            <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-3">
              {resultado.rutaPersonalizada.map((f, i) => {
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
                    <h5 className="font-headline mb-4 text-[20px] text-primary">
                      {etiquetaFase(f.fase, idioma)}
                    </h5>
                    <p className="text-base mb-6 text-on-surface-variant">
                      {f.descripcion}
                    </p>
                    <Link
                      href={completado ? "/rutas" : "/rutas/reto"}
                      className="font-label block w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-on-primary transition-colors hover:bg-secondary"
                    >
                      {completado ? t.comun.completado : t.tmaid.empezarAhora}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="atmospheric-shadow relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl bg-primary-container p-12 text-on-primary-container md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h3 className="mb-4 text-[28px] font-bold">{t.tmaid.afinidadTitulo}</h3>
            <p className="text-lg mb-6 opacity-90">
              {tpl(t.tmaid.afinidadTexto, { pct: afinidadIA })}
            </p>
            <button
              onClick={descargarResumen}
              className="font-label flex items-center gap-2 rounded-full bg-secondary-container px-8 py-3 text-sm font-bold text-on-secondary-container transition-all hover:opacity-90"
            >
              {t.tmaid.descargarResumen} <Icon name="download" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
