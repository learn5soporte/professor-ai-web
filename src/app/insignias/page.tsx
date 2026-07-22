"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Insignias -- base literal: code.html real de Stitch
 * (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 21: insignias-gallery
 * y Screen 22: insignia-detail). Fase 0: sin imagenes 3D generadas -- usamos el
 * emoji de cada badge + tratamiento de color por rareza, consistente con el
 * resto de la app.
 */

type Rareza = "Comun" | "Rara" | "Epica" | "Legendaria";

function rarezaDe(puntos: number): Rareza {
  if (puntos >= 40) return "Legendaria";
  if (puntos >= 25) return "Epica";
  if (puntos >= 15) return "Rara";
  return "Comun";
}

const ESTILO_RAREZA: Record<Rareza, { chip: string; circulo: string }> = {
  Legendaria: {
    chip: "bg-tertiary-container text-on-tertiary-container",
    circulo: "bg-tertiary-fixed glow-node",
  },
  Epica: {
    chip: "bg-secondary-container text-on-secondary-container",
    circulo: "bg-secondary-fixed",
  },
  Rara: {
    chip: "bg-tertiary-fixed text-on-tertiary-fixed",
    circulo: "bg-surface-container-high",
  },
  Comun: {
    chip: "bg-surface-container-highest text-on-surface-variant",
    circulo: "bg-surface-container",
  },
};

export default function InsigniasPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, badges, puntos, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const catalogo = Object.values(BADGES);
  const desbloqueadas = catalogo.filter((b) => badges.includes(b.id));
  const destacada = desbloqueadas.length
    ? [...desbloqueadas].sort((a, b) => b.puntos - a.puntos)[0]
    : null;
  const rarezaDestacada = destacada ? rarezaDe(destacada.puntos) : null;

  return (
    <AppShell titulo="Insignias">
      <div className="mx-auto max-w-3xl space-y-gap-xl">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-label-lg text-label-lg uppercase tracking-widest text-secondary">
              Reconocimiento
            </span>
            <h1 className="font-headline-lg text-headline-lg-mobile text-on-primary-fixed md:text-headline-lg">
              Tus Insignias
            </h1>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-tertiary-fixed px-4 py-2 text-on-tertiary-fixed">
            <Icon name="stars" filled className="text-[18px]" /> {puntos} XP
          </span>
        </div>

        <div className="grid grid-cols-3 gap-md md:gap-lg">
          {catalogo.map((badge) => {
            const desbloqueada = badges.includes(badge.id);
            const rareza = rarezaDe(badge.puntos);
            const estilo = ESTILO_RAREZA[rareza];
            return (
              <div key={badge.id} className="flex flex-col items-center space-y-3">
                <div
                  className={`atmospheric-shadow flex h-24 w-24 items-center justify-center rounded-full text-4xl transition-transform hover:scale-105 md:h-32 md:w-32 md:text-5xl ${
                    desbloqueada ? estilo.circulo : "bg-surface-container opacity-40 grayscale"
                  }`}
                >
                  {desbloqueada ? badge.emoji : <Icon name="lock" className="text-3xl" />}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    desbloqueada
                      ? estilo.chip
                      : "bg-outline-variant text-on-surface-variant opacity-60"
                  }`}
                >
                  {rareza}
                </span>
                <p className="text-body-sm text-center font-bold">{badge.nombre}</p>
              </div>
            );
          })}
        </div>

        {destacada ? (
          <div className="relative overflow-hidden rounded-[2rem] bg-on-secondary-fixed p-8 text-white md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-secondary/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-tertiary-container/10 blur-[80px]" />
            <div className="relative z-10 grid gap-xl md:grid-cols-2 md:items-center">
              <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-[120px] shadow-2xl backdrop-blur-md">
                {destacada.emoji}
              </div>
              <div className="space-y-gap-lg w-full">
                <div>
                  <span className="font-label-lg text-label-lg uppercase tracking-widest text-tertiary-fixed">
                    Insignia Destacada
                  </span>
                  <h3 className="font-headline-lg text-headline-lg mt-2">{destacada.nombre}</h3>
                  <p className="text-body-lg mt-4 text-white/80">{destacada.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 rounded-xl bg-white/5 p-6 backdrop-blur-md">
                    <span className="font-label-lg text-label-lg block text-white/50">
                      COLECCIÓN
                    </span>
                    <div className="flex items-end gap-2">
                      <span className="font-headline-md text-headline-md font-bold text-tertiary-fixed">
                        {desbloqueadas.length}/{catalogo.length}
                      </span>
                      <div className="mb-2 h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-tertiary-container"
                          style={{ width: `${(desbloqueadas.length / catalogo.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-6 backdrop-blur-md">
                    <span className="font-label-lg text-label-lg block text-white/50">
                      RAREZA
                    </span>
                    <span className="font-headline-md text-headline-md font-bold">
                      {rarezaDestacada}
                    </span>
                  </div>
                  <div className="col-span-2 rounded-xl bg-white/5 p-6 backdrop-blur-md">
                    <span className="font-label-lg text-label-lg block text-white/50">
                      VALOR
                    </span>
                    <span className="font-headline-md text-headline-md font-bold text-tertiary-fixed">
                      +{destacada.puntos} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="atmospheric-shadow rounded-3xl bg-white p-8 text-center">
            <Icon name="emoji_events" className="text-4xl text-outline-variant" />
            <p className="font-headline-md mt-2">Aún no tienes insignias desbloqueadas</p>
            <p className="text-body-sm mt-1 text-on-surface-variant">
              Completa retos en tu ruta formativa para ganar tu primera.
            </p>
            <Link
              href="/rutas"
              className="text-body-sm mt-4 inline-block font-bold text-secondary hover:underline"
            >
              Ir a mi ruta →
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
