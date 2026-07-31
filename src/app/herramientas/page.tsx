"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import type { Traducciones } from "@/lib/i18n/traducciones";

/**
 * Caja de Herramientas -- base literal: code.html real de Stitch
 * (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 23: ai-hub).
 * Estado de cada tarjeta refleja lo que REALMENTE existe hoy en la app
 * (no copiamos las etiquetas ficticias de Stitch tal cual): las 4
 * herramientas ya funcionan (aunque sea simulado en Fase 0) -- el
 * Adaptador de Contenido (jul 2026) fue la ultima en pasar de
 * "Proximamente" a real.
 */

type Herramienta = {
  nombreKey: keyof Traducciones["herramientas"];
  descKey: keyof Traducciones["herramientas"];
  icono: string;
  href: string;
  estado: "disponible" | "proximamente";
};

const HERRAMIENTAS: Herramienta[] = [
  {
    nombreKey: "planeacionNombre",
    descKey: "planeacionDesc",
    icono: "auto_awesome",
    href: "/herramientas/planeacion",
    estado: "disponible",
  },
  {
    nombreKey: "promptsNombre",
    descKey: "promptsDesc",
    icono: "chat_bubble",
    href: "/herramientas/prompts",
    estado: "disponible",
  },
  {
    nombreKey: "rubricasNombre",
    descKey: "rubricasDesc",
    icono: "table_chart",
    href: "/herramientas/rubricas",
    estado: "disponible",
  },
  {
    nombreKey: "adaptadorNombre",
    descKey: "adaptadorDesc",
    icono: "translate",
    href: "/herramientas/adaptador",
    estado: "disponible",
  },
];

export default function HerramientasHubPage() {
  const router = useRouter();
  const { perfil, cargando } = useSession();
  const { t } = useIdioma();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil)) return null;

  return (
    <AppShell titulo={t.comun.herramientas}>
      <div className="mx-auto max-w-3xl space-y-gap-lg">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
            {t.herramientas.moduloCreacion}
          </span>
          <h1 className="font-headline text-3xl text-on-primary-fixed sm:text-4xl">
            {t.herramientas.cajaHerramientas}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-md md:grid-cols-3 md:gap-lg">
          {HERRAMIENTAS.map((h) => {
            const disponible = h.estado === "disponible";
            const contenido = (
              <div
                className={`atmospheric-shadow h-full space-y-4 rounded-3xl bg-white p-6 transition-transform ${
                  disponible ? "cursor-pointer hover:scale-[1.02]" : "opacity-75"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    disponible
                      ? "bg-secondary-fixed/30 text-secondary"
                      : "bg-outline-variant/20 text-outline"
                  }`}
                >
                  <Icon name={h.icono} className="text-3xl" />
                </div>
                <div>
                  <h4 className="font-headline text-lg font-bold text-[18px]">
                    {t.herramientas[h.nombreKey]}
                  </h4>
                  <p className="text-sm line-clamp-2 text-on-surface-variant">
                    {t.herramientas[h.descKey]}
                  </p>
                </div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                    disponible
                      ? "bg-tertiary-fixed text-on-tertiary-fixed"
                      : "bg-surface-container-low text-outline"
                  }`}
                >
                  {disponible ? t.comun.disponible : t.comun.proximamente}
                </span>
              </div>
            );
            return disponible ? (
              <Link key={h.nombreKey} href={h.href}>
                {contenido}
              </Link>
            ) : (
              <div key={h.nombreKey}>{contenido}</div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
