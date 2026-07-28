"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";
import type { Dimension } from "@/lib/tmaid/preguntas";
import { BADGES, calcularNivel } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";

/**
 * Mi Informe -- pantalla nueva (jul 2026), pedida por el usuario: "un
 * pequeño generador de informes... reportes privados" antes de sacar la
 * app a la luz. Alcance confirmado via AskUserQuestion: SOLO el informe
 * privado del propio docente (no un panel admin -- eso requeriría un rol
 * nuevo + políticas RLS adicionales, fuera de alcance por ahora), con
 * pantalla + descarga PDF.
 *
 * La "descarga PDF" usa window.print() + clases print: de Tailwind (core,
 * sin tocar tailwind.config.ts) en vez de una librería nueva como jsPDF --
 * evita sumar una dependencia npm nueva que nunca se probó contra el build
 * real de GitHub Actions, y le da al docente el flujo nativo del navegador
 * ("Guardar como PDF") que ya conoce. AppShell.tsx gana `print:hidden` en
 * el header/nav fijos para que al imprimir solo se vea el contenido del
 * informe, no la barra de navegación de la app.
 *
 * Todo el contenido sale de datos reales de la sesión (resultadoTmaid,
 * baselineTmaid, progresoRutas, badges, puntos, racha) -- mismo principio
 * de honestidad del resto de la app, sin cifras inventadas.
 */

const ICONO_DIMENSION: Record<Dimension, string> = {
  conocimientoIA: "psychology",
  usoHerramientas: "handyman",
  integracionAula: "account_tree",
  actitudCambio: "rocket_launch",
};

export default function InformesPage() {
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    baselineTmaid,
    progresoRutas,
    badges,
    puntos,
    racha,
    cargando,
  } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const { dimensiones } = resultadoTmaid;
  const dims = Object.keys(dimensiones) as Dimension[];
  const { nivel: nivelGamificacion } = calcularNivel(puntos);

  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fases = resultadoTmaid.rutaPersonalizada;
  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const modulos = fases.map((f, i) => {
    const retoHecho = progresoRutas[f.fase] === "completado";
    const reflexionHecha = progresoRutas[`${f.fase}::reflexion`] === "completado";
    const recursos = f.recursos ?? [];
    const recursosHechos = recursos.filter(
      (_, ri) => progresoRutas[`${f.fase}::recurso-${ri}`] === "completado"
    ).length;
    const total = 1 + 1 + recursos.length;
    const hechas = (retoHecho ? 1 : 0) + (reflexionHecha ? 1 : 0) + recursosHechos;
    const estado = retoHecho ? "Completado" : i === indiceActivo ? "En curso" : "Pendiente";
    return { fase: f.fase, estado, hechas, total };
  });
  const modulosCompletados = modulos.filter((m) => m.estado === "Completado").length;
  const actividadesTotal = modulos.reduce((a, m) => a + m.total, 0);
  const actividadesHechas = modulos.reduce((a, m) => a + m.hechas, 0);

  const badgesObtenidos = badges
    .map((id) => BADGES[id])
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  function imprimir() {
    window.print();
  }

  return (
    <AppShell titulo="Mi Informe">
      <div className="mx-auto max-w-4xl space-y-gap-xl print:max-w-none print:space-y-6">
        <div className="hidden print:mb-4 print:block">
          <p className="text-xl font-black text-primary">Professor AI · Learn5</p>
          <p className="text-sm text-on-surface-variant">Informe generado el {fechaGeneracion}</p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
              Reportes
            </span>
            <h1 className="font-headline text-3xl font-black text-on-primary-fixed sm:text-4xl">
              Mi Informe
            </h1>
            <p className="text-sm mt-1 text-on-surface-variant">
              Generado el {fechaGeneracion} · datos reales de tu cuenta
            </p>
          </div>
          <button
            onClick={imprimir}
            className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-primary-container px-6 py-3 font-bold text-white transition-transform hover:scale-105"
          >
            <Icon name="picture_as_pdf" className="text-[18px]" /> Descargar PDF
          </button>
        </div>

        <section className="atmospheric-shadow space-y-3 rounded-[2rem] bg-white p-6 print:rounded-none print:border print:border-outline-variant print:shadow-none">
          <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Docente
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Dato etiqueta="Nombre" valor={perfil.nombre || "—"} />
            <Dato etiqueta="Materia" valor={perfil.materia || "—"} />
            <Dato etiqueta="Nivel educativo" valor={perfil.nivelEducativo || "—"} />
            <Dato etiqueta="País" valor={perfil.pais || "—"} />
          </div>
        </section>

        <section className="atmospheric-shadow space-y-4 rounded-[2rem] bg-white p-6 print:rounded-none print:border print:border-outline-variant print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Diagnóstico TMAID
            </h3>
            <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-black uppercase text-on-tertiary-fixed">
              Nivel {resultadoTmaid.nivelAsignado}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Puntaje promedio: <strong>{resultadoTmaid.puntajePromedio.toFixed(1)}/5</strong>
          </p>
          <div className="space-y-2">
            {dims.map((d) => (
              <div key={d} className="flex items-center gap-3">
                <Icon name={ICONO_DIMENSION[d]} className="w-6 text-[18px] text-secondary" />
                <span className="w-40 shrink-0 text-sm text-on-surface-variant">
                  {ETIQUETA_DIMENSION[d]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-highest print:border print:border-outline-variant">
                  <div
                    className="h-full rounded-full bg-secondary print:bg-on-surface-variant"
                    style={{ width: `${Math.round((dimensiones[d] / 5) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-on-surface">
                  {Math.round((dimensiones[d] / 5) * 100)}%
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-outline">
              Diagnóstico por dimensión
            </h4>
            <ul className="space-y-1">
              {resultadoTmaid.mapaBrechas.map((b, i) => (
                <li key={i} className="text-sm flex items-start gap-2 text-on-surface-variant">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <EvolucionResumen resultadoTmaid={resultadoTmaid} baselineTmaid={baselineTmaid} />

        <section className="atmospheric-shadow space-y-4 rounded-[2rem] bg-white p-6 print:break-inside-avoid print:rounded-none print:border print:border-outline-variant print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Ruta formativa
            </h3>
            <span className="text-sm text-on-surface-variant">
              {modulosCompletados}/{fases.length} módulos · {actividadesHechas}/{actividadesTotal}{" "}
              actividades
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-outline-variant/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-4 py-2">Módulo</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Actividades</th>
                </tr>
              </thead>
              <tbody>
                {modulos.map((m) => (
                  <tr key={m.fase} className="border-t border-outline-variant/30">
                    <td className="px-4 py-2 font-semibold text-on-surface">{m.fase}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          m.estado === "Completado"
                            ? "bg-tertiary-fixed text-on-tertiary-fixed"
                            : m.estado === "En curso"
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        {m.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-on-surface-variant">
                      {m.hechas}/{m.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="atmospheric-shadow space-y-4 rounded-[2rem] bg-white p-6 print:break-inside-avoid print:rounded-none print:border print:border-outline-variant print:shadow-none">
          <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Gamificación
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Dato etiqueta="Nivel" valor={`Nv.${nivelGamificacion}`} />
            <Dato etiqueta="Puntos (XP)" valor={String(puntos)} />
            <Dato etiqueta="Racha" valor={`${racha} día${racha === 1 ? "" : "s"}`} />
          </div>
          <div className="space-y-1 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-outline">
              Insignias obtenidas ({badgesObtenidos.length})
            </h4>
            {badgesObtenidos.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Todavía no has desbloqueado ninguna insignia.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {badgesObtenidos.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm"
                  >
                    <span aria-hidden>{b.emoji}</span>
                    <span className="text-on-surface">{b.nombre}</span>
                    <span className="ml-auto text-xs font-bold text-secondary">+{b.puntos}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="text-xs text-outline print:mt-6">
          Este informe se genera automáticamente a partir de tu actividad real registrada en
          Professor AI (Learn5). No incluye evaluaciones de terceros ni datos de otros docentes.
        </p>
      </div>
    </AppShell>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-outline">{etiqueta}</p>
      <p className="text-sm font-semibold text-on-surface">{valor}</p>
    </div>
  );
}

/**
 * Version compacta de "Tu evolución" (misma logica que EvolucionTmaid en
 * progreso/page.tsx) pensada para el informe: si no hay baseline o es el
 * unico diagnostico, un aviso corto en vez de una comparacion inventada.
 */
function EvolucionResumen({
  resultadoTmaid,
  baselineTmaid,
}: {
  resultadoTmaid: NonNullable<ReturnType<typeof useSession>["resultadoTmaid"]>;
  baselineTmaid: ReturnType<typeof useSession>["baselineTmaid"];
}) {
  const dims = Object.keys(resultadoTmaid.dimensiones) as Dimension[];

  if (!baselineTmaid) {
    return (
      <section className="atmospheric-shadow space-y-2 rounded-[2rem] bg-white p-6 print:rounded-none print:border print:border-outline-variant print:shadow-none">
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Evolución
        </h3>
        <p className="text-sm text-on-surface-variant">
          Todavía no hay suficientes datos para comparar. Esto se activa automáticamente después
          del primer diagnóstico TMAID registrado.
        </p>
      </section>
    );
  }

  const esUnico =
    dims.every((d) => resultadoTmaid.dimensiones[d] === baselineTmaid.dimensiones[d]) &&
    resultadoTmaid.puntajePromedio === baselineTmaid.puntajePromedio;

  if (esUnico) {
    return (
      <section className="atmospheric-shadow space-y-2 rounded-[2rem] bg-white p-6 print:rounded-none print:border print:border-outline-variant print:shadow-none">
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Evolución
        </h3>
        <p className="text-sm text-on-surface-variant">
          Único diagnóstico hasta ahora ({resultadoTmaid.nivelAsignado},{" "}
          {resultadoTmaid.puntajePromedio.toFixed(1)}/5). Repite el TMAID desde /progreso para
          poder comparar más adelante.
        </p>
      </section>
    );
  }

  const deltaPromedio = Number(
    (resultadoTmaid.puntajePromedio - baselineTmaid.puntajePromedio).toFixed(1)
  );

  return (
    <section className="atmospheric-shadow space-y-3 rounded-[2rem] bg-white p-6 print:break-inside-avoid print:rounded-none print:border print:border-outline-variant print:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Evolución
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            deltaPromedio >= 0
              ? "bg-tertiary-fixed text-on-tertiary-fixed"
              : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          {baselineTmaid.nivelAsignado} → {resultadoTmaid.nivelAsignado} ({deltaPromedio >= 0 ? "+" : ""}
          {deltaPromedio})
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {dims.map((d) => {
          const delta = Number(
            (resultadoTmaid.dimensiones[d] - baselineTmaid.dimensiones[d]).toFixed(1)
          );
          return (
            <div
              key={d}
              className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2 text-xs"
            >
              <span className="text-on-surface-variant">{ETIQUETA_DIMENSION[d]}</span>
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
        })}
      </div>
    </section>
  );
}
