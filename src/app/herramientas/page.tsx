"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Caja de Herramientas -- base literal: code.html real de Stitch
 * (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 23: ai-hub).
 * Estado de cada tarjeta refleja lo que REALMENTE existe hoy en la app
 * (no copiamos las etiquetas ficticias de Stitch tal cual): Planeacion Pro
 * y Banco de Prompts ya funcionan (aunque sea simulado en Fase 0); Rubricas
 * y Adaptador estan planificados para batches futuros.
 */

type Herramienta = {
  nombre: string;
  descripcion: string;
  icono: string;
  href: string;
  estado: "disponible" | "proximamente";
};

const HERRAMIENTAS: Herramienta[] = [
  {
    nombre: "Planeación Pro",
    descripcion: "Genera secuencias didácticas completas en segundos.",
    icono: "auto_awesome",
    href: "/herramientas/planeacion",
    estado: "disponible",
  },
  {
    nombre: "Banco de Prompts",
    descripcion: "Prompts pedagógicos listos para copiar y usar.",
    icono: "chat_bubble",
    href: "/herramientas/prompts",
    estado: "disponible",
  },
  {
    nombre: "Creador de Rúbricas",
    descripcion: "Crea criterios de evaluación alineados a competencias.",
    icono: "table_chart",
    href: "#",
    estado: "proximamente",
  },
  {
    nombre: "Adaptador de Contenido",
    descripcion: "Adapta contenidos para NEE o diferentes niveles.",
    icono: "translate",
    href: "#",
    estado: "proximamente",
  },
];

export default function HerramientasHubPage() {
  const router = useRouter();
  const { perfil, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
  }, [cargando, perfil, router]);

  if (cargando || !perfil) return null;

  return (
    <AppShell titulo="Herramientas">
      <div className="mx-auto max-w-3xl space-y-gap-lg">
        <div>
          <span className="font-label-lg text-label-lg uppercase tracking-widest text-secondary">
            Módulo de creación
          </span>
          <h1 className="font-headline-lg text-headline-lg-mobile text-on-primary-fixed md:text-headline-lg">
            Caja de Herramientas
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
                  <h4 className="font-headline-md text-[18px]">{h.nombre}</h4>
                  <p className="text-body-sm line-clamp-2 text-on-surface-variant">
                    {h.descripcion}
                  </p>
                </div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                    disponible
                      ? "bg-tertiary-fixed text-on-tertiary-fixed"
                      : "bg-surface-container-low text-outline"
                  }`}
                >
                  {disponible ? "Disponible" : "Próximamente"}
                </span>
              </div>
            );
            return disponible ? (
              <Link key={h.nombre} href={h.href}>
                {contenido}
              </Link>
            ) : (
              <div key={h.nombre}>{contenido}</div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
