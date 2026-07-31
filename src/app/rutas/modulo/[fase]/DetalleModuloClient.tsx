"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import { tpl } from "@/lib/i18n/traducciones";
import { etiquetaFase } from "@/lib/i18n/valores";
import { localizarResultadoTmaid } from "@/lib/tmaid/scoring";

/**
 * Detalle de Módulo -- base literal: code.html real de Stitch
 * (detalle_de_m_dulo_diferenciaci_n_pedag_gica). A diferencia del original
 * de Stitch (que mostraba 3 "retos" ficticios dentro de un mismo módulo,
 * con fechas inventadas como "Finalizado hace 2 días"), aquí el "módulo"
 * ES un modulo real de rutaPersonalizada y la "Lista de Retos" muestra los
 * modulos reales de la ruta (4-5 segun el nivel, ver MODULOS_POR_NIVEL en
 * scoring.ts) con su estado real (progresoRutas), sin datos de relleno ni
 * fechas falsas.
 *
 * Este es un componente cliente separado de page.tsx porque una página
 * "use client" no puede exportar generateStaticParams (requerido por
 * output: "export" para rutas dinámicas) -- ver page.tsx en esta carpeta.
 */

const BADGE_POR_FASE: Record<string, string> = {
  Fundamentos: "fase-fundamentos",
  Explorar: "fase-explorar",
  Aplicar: "fase-aplicar",
  Integrar: "fase-integrar",
  Evaluar: "fase-evaluar",
  Liderar: "fase-liderar",
  Innovar: "fase-innovar",
};

const ICONO_POR_FASE: Record<string, string> = {
  Fundamentos: "school",
  Explorar: "explore",
  Aplicar: "psychology",
  Integrar: "sync_alt",
  Evaluar: "fact_check",
  Liderar: "groups",
  Innovar: "rocket_launch",
};

export function DetalleModuloClient({ nombreFase }: { nombreFase: string | null }) {
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
  if (!perfil || !perfilCompleto(perfil) || !resultadoTmaid || !nombreFase) return null;

  const resultado = localizarResultadoTmaid(resultadoTmaid, perfil, idioma);
  const fases = resultado.rutaPersonalizada;
  const fase = fases.find((f) => f.fase === nombreFase);
  if (!fase) return null;

  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const completado = progresoRutas[nombreFase] === "completado";
  const badgeInfo = BADGES[BADGE_POR_FASE[nombreFase]];

  // Ampliado (jul 2026): cada modulo ya no tiene 1 sola actividad (el
  // reto) -- tambien hay una reflexion (todos los modulos la tienen, ver
  // REFLEXION_POR_FASE en reto/page.tsx) y N recursos marcables. Mismas
  // claves compuestas que usa reto/page.tsx (`${fase}::reflexion`,
  // `${fase}::recurso-{i}`) sobre el mismo progresoRutas generico -- sin
  // necesidad de una migracion nueva.
  const recursosDelModulo = fase.recursos ?? [];
  const actividadesTotal = 1 + 1 + recursosDelModulo.length;
  const reflexionHecha = progresoRutas[`${nombreFase}::reflexion`] === "completado";
  const recursosHechos = recursosDelModulo.filter(
    (_, i) => progresoRutas[`${nombreFase}::recurso-${i}`] === "completado"
  ).length;
  const actividadesHechas = (completado ? 1 : 0) + (reflexionHecha ? 1 : 0) + recursosHechos;
  const porcentajeModulo =
    actividadesTotal > 0 ? Math.round((actividadesHechas / actividadesTotal) * 100) : 0;

  function estadoDe(i: number): "completado" | "activo" | "proximo" | "bloqueado" {
    if (progresoRutas[fases[i].fase] === "completado") return "completado";
    if (i === indiceActivo) return "activo";
    if (i === indiceActivo + 1) return "proximo";
    return "bloqueado";
  }

  return (
    <AppShell titulo={t.rutas.detalleModuloTitulo}>
      <div className="mx-auto max-w-5xl space-y-gap-xl">
        <Link
          href="/rutas"
          className="text-sm inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> {t.rutas.volverRuta}
        </Link>

        <div className="grid grid-cols-1 gap-gap-xl lg:grid-cols-12 lg:items-start">
          <div className="space-y-gap-lg lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1 text-on-tertiary-fixed">
              <Icon name={ICONO_POR_FASE[nombreFase]} className="text-[18px]" />
              <span className="font-label text-xs font-bold">
                {t.rutas.moduloChip} · {etiquetaFase(nombreFase, idioma).toUpperCase()}
              </span>
            </div>
            <h1 className="font-headline text-3xl font-black sm:text-4xl max-w-2xl text-primary">
              {t.rutas.faseLabel} {etiquetaFase(nombreFase, idioma)}
            </h1>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              {fase.descripcion}
            </p>
            <div className="flex flex-wrap gap-gap-md pt-4">
              <div className="atmospheric-shadow flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-3">
                <Icon name="schedule" className="text-secondary" />
                <div className="flex flex-col">
                  <span className="font-label text-xs font-bold text-primary">
                    {t.rutas.tiempoEstimado}
                  </span>
                  <span className="text-sm text-on-surface-variant">~30 min</span>
                </div>
              </div>
              <div className="atmospheric-shadow flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-3">
                <Icon name="military_tech" className="text-tertiary" />
                <div className="flex flex-col">
                  <span className="font-label text-xs font-bold text-primary">
                    {t.rutas.recompensa}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {tpl(t.rutas.xpDisponiblesCorto, { xp: badgeInfo?.puntos ?? 0 })}
                  </span>
                </div>
              </div>
            </div>

            {fase.recursos && fase.recursos.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-label text-xs font-bold text-primary">
                  {t.rutas.paraComplementar}
                </span>
                <ul className="space-y-2">
                  {fase.recursos.map((r, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-on-surface-variant">
                      <Icon name="lightbulb" className="mt-0.5 text-[16px] text-secondary" />
                      <span>{r.sugerencia}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="atmospheric-shadow rounded-3xl bg-surface-container-lowest p-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-label text-xs font-bold text-primary">
                  {t.rutas.progresoModulo}
                </span>
                <span className="text-sm font-bold text-secondary">
                  {porcentajeModulo}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-1000"
                  style={{ width: `${porcentajeModulo}%` }}
                />
              </div>
              <p className="text-sm mt-2 text-on-surface-variant">
                {tpl(t.rutas.actividadesCompletadas, {
                  hechas: actividadesHechas,
                  total: actividadesTotal,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-headline text-xl font-bold mb-8 text-primary">
            {t.rutas.tuRutaCompleta}
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
                      <span className="font-label text-xs font-bold rounded-full bg-surface-container-high px-3 py-1 text-on-surface-variant">
                        {t.rutas.completadoMayus}
                      </span>
                    </div>
                    <h4 className="font-headline text-xl font-bold mb-3 text-primary">
                      {etiquetaFase(f.fase, idioma)}
                    </h4>
                    <p className="text-base text-on-surface-variant">{f.descripcion}</p>
                  </div>
                );
              }
              if (estado === "activo") {
                return (
                  <div
                    key={f.fase}
                    className="atmospheric-shadow relative rounded-3xl border-2 border-secondary bg-surface-container-lowest p-8 ring-8 ring-secondary/5"
                  >
                    <div className="font-label text-xs font-bold absolute -top-4 left-8 rounded-full bg-secondary px-4 py-1 text-on-secondary shadow-lg">
                      {t.rutas.siguientePaso}
                    </div>
                    <div className="mb-6 flex items-start justify-between">
                      <div className="glow-node flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-on-secondary">
                        <Icon name={ICONO_POR_FASE[f.fase] ?? "psychology"} />
                      </div>
                      <span className="font-label text-xs font-bold rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container">
                        {t.rutas.activoMayus}
                      </span>
                    </div>
                    <h4 className="font-headline text-xl font-bold mb-3 text-primary">
                      {etiquetaFase(f.fase, idioma)}
                    </h4>
                    <p className="text-base mb-8 text-on-surface-variant">{f.descripcion}</p>
                    <Link
                      href="/rutas/reto"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                    >
                      {t.rutas.empezarReto} <Icon name="play_arrow" className="text-[18px]" />
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
                    <span className="font-label text-xs font-bold rounded-full bg-surface-container-highest px-3 py-1 text-on-surface-variant">
                      {t.rutas.bloqueadoMayus}
                    </span>
                  </div>
                  <h4 className="font-headline text-xl font-bold mb-3 text-primary">
                    {etiquetaFase(f.fase, idioma)}
                  </h4>
                  <p className="text-base mb-6 text-on-surface-variant">{f.descripcion}</p>
                  <div className="flex items-center gap-2 text-outline">
                    <Icon name="info" className="text-[18px]" />
                    <span className="font-label text-xs font-bold">
                      {t.rutas.requiereAnterior}
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
