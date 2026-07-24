"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES, calcularNivel } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

const HERRAMIENTAS = [
  { nombre: "Generador de Planeaciones", href: "/herramientas/planeacion", disponible: true },
  { nombre: "Creador de Rubricas", href: "/herramientas/rubricas", disponible: true },
  { nombre: "Banco de Prompts Pedagogicos", href: "/herramientas/prompts", disponible: true },
];

export default function DashboardPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, progresoRutas, badges, puntos, cargando } =
    useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) {
      router.replace("/login");
    } else if (!perfilCompleto(perfil)) {
      router.replace("/onboarding");
    }
  }, [cargando, perfil, router]);

  if (cargando || !perfil || !perfilCompleto(perfil)) {
    return null;
  }

  // Estado inicial -- base literal: code.html real de Stitch
  // (estado_inicial_tu_primer_paso). Antes, un docente sin diagnóstico era
  // redirigido instantáneamente a /tmaid sin ninguna explicación; ahora ve
  // esta pantalla de bienvenida real con su propio CTA hacia el diagnóstico.
  if (!resultadoTmaid) {
    return (
      <AppShell titulo="Inicio">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-margin-mobile text-center">
          <div className="relative mb-gap-xl flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container-highest shadow-inner">
              <Icon
                name="rocket_launch"
                className="text-secondary"
                style={{ fontSize: "96px" }}
              />
            </div>
            <div className="absolute -right-4 -top-4 flex h-12 w-12 rotate-12 items-center justify-center rounded-xl bg-tertiary-container shadow-lg">
              <Icon name="star" filled className="text-on-tertiary-container" />
            </div>
            <div className="absolute -left-8 bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container opacity-80 shadow-lg">
              <Icon name="auto_awesome" className="text-on-secondary-container" />
            </div>
          </div>

          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 max-w-2xl text-primary">
            Todo empieza aquí
          </h1>
          <p className="text-body-lg mb-gap-xl max-w-lg text-on-surface-variant">
            Para comenzar tu viaje de transformación académica con IA, necesitamos
            entender tu punto de partida. Realiza tu primer diagnóstico y
            desbloquea tu ruta personalizada.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/tmaid"
              className="text-label-lg flex items-center gap-3 rounded-full bg-primary-container px-10 py-5 font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
            >
              Hacer mi diagnóstico <Icon name="rocket_launch" />
            </Link>
            <span className="text-body-sm flex items-center gap-2 text-outline">
              <Icon name="timer" className="text-[18px]" /> Toma unos 5 minutos
            </span>
          </div>

          <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-gap-md md:grid-cols-3">
            <div className="atmospheric-shadow flex items-start gap-4 rounded-xl bg-white p-6 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                <Icon name="psychology" className="text-secondary" />
              </div>
              <div>
                <h3 className="font-label-lg text-primary">Análisis IA</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Evaluamos tus competencias actuales.
                </p>
              </div>
            </div>
            <div className="atmospheric-shadow flex items-start gap-4 rounded-xl bg-white p-6 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                <Icon name="route" className="text-secondary" />
              </div>
              <div>
                <h3 className="font-label-lg text-primary">Ruta Única</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Contenido adaptado a tu especialidad.
                </p>
              </div>
            </div>
            <div className="atmospheric-shadow flex items-start gap-4 rounded-xl bg-white p-6 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                <Icon name="verified" className="text-secondary" />
              </div>
              <div>
                <h3 className="font-label-lg text-primary">Certificación</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Valida tus avances ante la facultad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const { nivel } = calcularNivel(puntos);
  const totalFases = resultadoTmaid.rutaPersonalizada.length;
  const completadas = resultadoTmaid.rutaPersonalizada.filter(
    (f) => progresoRutas[f.fase] === "completado"
  ).length;

  return (
    <AppShell titulo="Inicio">
      <div className="mx-auto max-w-3xl">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Hola, {perfil.nombre}
        </p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">
          {perfil.materia} · {perfil.nivelEducativo}
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat etiqueta="Nivel IA" valor={resultadoTmaid.nivelAsignado} />
          <MiniStat etiqueta="Nivel de juego" valor={`Nv. ${nivel}`} />
          <MiniStat etiqueta="Puntos" valor={`${puntos} pts`} />
          <MiniStat etiqueta="Badges" valor={`${badges.length}/${Object.keys(BADGES).length}`} />
        </div>

        <div className="dark-hero mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">
              Tu ruta de hoy
            </h2>
            <Link
              href="/rutas"
              className="text-sm font-semibold text-tertiary-fixed hover:underline"
            >
              Ver completa →
            </Link>
          </div>
          <p className="mt-1 text-2xl font-black text-white">
            {completadas} / {totalFases} fases
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-tertiary-fixed transition-all"
              style={{ width: `${(completadas / totalFases) * 100}%` }}
            />
          </div>
        </div>

        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant">
              Tus badges
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/insignias"
                className="text-sm font-semibold text-secondary hover:underline"
              >
                Ver todas →
              </Link>
              <Link
                href="/tmaid/resultado"
                className="text-sm font-semibold text-secondary hover:underline"
              >
                Ver mi perfil →
              </Link>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
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

        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
              Herramientas rapidas
            </h2>
            <div className="mb-4 flex items-center gap-3">
              <Link
                href="/herramientas"
                className="text-sm font-semibold text-secondary hover:underline"
              >
                Ver todas →
              </Link>
              <Link
                href="/progreso"
                className="text-sm font-semibold text-secondary hover:underline"
              >
                Mi progreso →
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {HERRAMIENTAS.map((h) =>
              h.disponible ? (
                <Link
                  key={h.nombre}
                  href={h.href}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  {h.nombre}
                  <span className="text-primary">→</span>
                </Link>
              ) : (
                <div
                  key={h.nombre}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant opacity-60"
                >
                  {h.nombre}
                  <span className="font-label text-xs uppercase">
                    Proximamente
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MiniStat({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-4 text-center shadow-atmospheric">
      <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {etiqueta}
      </p>
      <p className="mt-1 text-lg font-black text-on-surface">{valor}</p>
    </div>
  );
}
