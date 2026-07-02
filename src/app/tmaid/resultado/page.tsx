"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";
import { BADGES, calcularNivel } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";

export default function ResultadoTmaidPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, badges, puntos, cargando } = useSession();

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

  const dimensionesEntries = Object.entries(resultadoTmaid.dimensiones) as [
    keyof typeof resultadoTmaid.dimensiones,
    number
  ][];
  const { nivel, siguienteEn } = calcularNivel(puntos);

  return (
    <AppShell titulo="Perfil">
      <div className="mx-auto max-w-2xl">
        <span className="gold-chip">Diagnostico TMAID</span>
        <h1 className="mt-3 text-4xl font-black text-on-surface">
          Nivel: {resultadoTmaid.nivelAsignado}
        </h1>

        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant">
                Nivel de juego {nivel}
              </h2>
              <p className="text-2xl font-black text-primary">{puntos} pts</p>
            </div>
            {siguienteEn && (
              <p className="text-xs text-on-surface-variant">
                {siguienteEn - puntos} pts para nivel {nivel + 1}
              </p>
            )}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-secondary-container"
              style={{
                width: siguienteEn
                  ? `${Math.min(100, (puntos / siguienteEn) * 100)}%`
                  : "100%",
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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
          <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Perfil pedagogico-IA
          </h2>
          <p className="mt-2 text-lg text-on-surface">
            {resultadoTmaid.perfilPedagogicoIA}
          </p>
        </div>

        <div className="card mt-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Tus 4 dimensiones
          </h2>
          <div className="flex flex-col gap-3">
            {dimensionesEntries.map(([dim, valor]) => (
              <div key={dim}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-on-surface">
                    {ETIQUETA_DIMENSION[dim]}
                  </span>
                  <span className="text-on-surface-variant">
                    {valor.toFixed(1)} / 5
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(valor / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Mapa de brechas
          </h2>
          <ul className="list-inside list-disc text-on-surface">
            {resultadoTmaid.mapaBrechas.map((brecha) => (
              <li key={brecha}>{brecha}</li>
            ))}
          </ul>
        </div>

        <Link href="/rutas" className="btn-primary mt-6 block text-center">
          Ver mi ruta interactiva →
        </Link>
      </div>
    </AppShell>
  );
}
