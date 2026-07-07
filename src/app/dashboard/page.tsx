"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { BADGES, calcularNivel } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";

const HERRAMIENTAS = [
  { nombre: "Generador de Planeaciones", href: "#", disponible: false },
  { nombre: "Creador de Rubricas", href: "#", disponible: false },
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
    } else if (!resultadoTmaid) {
      router.replace("/tmaid");
    }
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !resultadoTmaid) {
    return null;
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
            <Link
              href="/progreso"
              className="mb-4 text-sm font-semibold text-secondary hover:underline"
            >
              Mi progreso →
            </Link>
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
