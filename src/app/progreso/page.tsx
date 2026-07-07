"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Mi Progreso -- base literal: code.html real de Stitch
 * (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 27: mi-progreso).
 * Reusa el mismo radar SVG que /tmaid/resultado (mismas 4 dimensiones).
 * La "actividad mensual" es ilustrativa -- Fase 0 no tiene tracking real de
 * uso diario todavía; el "re-diagnostico" de Stitch (countdown falso) se
 * reemplaza por un CTA real, ya que /tmaid ya soporta repetirse.
 *
 * Nota (verificacion final): mismo ajuste de viewBox que /tmaid/resultado
 * ("-40 -10 280 220" en vez de "0 0 200 200") para que las etiquetas
 * "HERRAMIENTAS"/"ACTITUD" no se recorten contra el borde del SVG.
 */

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

export default function ProgresoPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, badges, puntos, racha, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !resultadoTmaid) return null;

  const { dimensiones } = resultadoTmaid;
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

  // Actividad ilustrativa: derivada de puntos/racha para que no sea siempre
  // igual entre docentes, pero claramente marcada como no-real todavía.
  const semilla = puntos + racha * 7;
  const barras = MESES.map((_, i) => 25 + ((semilla * (i + 3)) % 65));

  return (
    <AppShell titulo="Progreso">
      <div className="mx-auto max-w-4xl space-y-gap-xl">
        <div>
          <span className="font-label-lg text-label-lg uppercase tracking-widest text-secondary">
            Seguimiento
          </span>
          <h1 className="font-headline-lg text-headline-lg-mobile text-on-primary-fixed md:text-headline-lg">
            Mi Progreso
          </h1>
        </div>

        <div className="flex flex-col gap-xl md:flex-row md:items-stretch">
          <div className="atmospheric-shadow flex flex-1 flex-col items-center rounded-[2.5rem] bg-white p-8">
            <h3 className="font-headline-md text-headline-md mb-6 w-full">
              Perfil de Competencias
            </h3>
            <div className="w-full max-w-[300px]">
              <svg className="h-auto w-full drop-shadow-lg" viewBox="-40 -10 280 220">
                <polygon fill="none" points="100,20 180,100 100,180 20,100" stroke="#e1e3e4" strokeWidth="1" />
                <polygon fill="none" points="100,40 160,100 100,160 40,100" stroke="#e1e3e4" strokeWidth="1" />
                <polygon fill="none" points="100,60 140,100 100,140 60,100" stroke="#e1e3e4" strokeWidth="1" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#e1e3e4" strokeWidth="1" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#e1e3e4" strokeWidth="1" />
                <polygon fill="rgba(37, 82, 202, 0.2)" points={puntosRadar} stroke="#2552ca" strokeWidth="2" />
                <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="middle" x="100" y="15">
                  CONOCIMIENTO
                </text>
                <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="start" x="185" y="103">
                  HERRAMIENTAS
                </text>
                <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="middle" x="100" y="193">
                  INTEGRACIÓN
                </text>
                <text className="fill-on-surface-variant font-label-lg" style={{ fontSize: "8px" }} textAnchor="end" x="15" y="103">
                  ACTITUD
                </text>
              </svg>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-gap-md">
            <div className="grid grid-cols-3 gap-4">
              <StatCard valor={String(racha)} etiqueta="Racha" color="text-secondary" />
              <StatCard valor={String(badges.length)} etiqueta="Insignias" color="text-tertiary-container" />
              <StatCard valor={`${puntos}`} etiqueta="XP" color="text-on-primary-fixed" />
            </div>

            <Link
              href="/insignias"
              className="text-body-sm self-end font-bold text-secondary hover:underline"
            >
              Ver todas mis insignias →
            </Link>

            <div className="atmospheric-shadow space-y-4 rounded-[2rem] bg-white p-6">
              <h4 className="font-label-lg text-label-lg uppercase tracking-widest text-on-surface-variant">
                Actividad Mensual
              </h4>
              <div className="flex h-32 items-end justify-between gap-2 pt-4">
                {barras.map((alto, i) => (
                  <div
                    key={MESES[i]}
                    className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-secondary-fixed-dim"
                    style={{ height: `${alto}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-label-lg text-outline">
                {MESES.map((m) => (
                  <span key={m}>{m.toUpperCase()}</span>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Actividad ilustrativa — pronto reflejará tu uso real de la plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-on-primary-fixed to-[#003baf] p-8 text-white md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-headline-md text-headline-md">¿Listo para el siguiente nivel?</h3>
            <p className="text-body-md text-white/80">
              Puedes repetir tu diagnóstico TMAID cuando quieras para actualizar tu perfil de IA.
            </p>
          </div>
          <Link
            href="/tmaid"
            className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-tertiary-container/90 px-8 py-4 font-bold text-on-tertiary-container transition-transform hover:scale-105"
          >
            Repetir diagnóstico <Icon name="autorenew" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  valor,
  etiqueta,
  color,
}: {
  valor: string;
  etiqueta: string;
  color: string;
}) {
  return (
    <div className="atmospheric-shadow rounded-2xl bg-white p-4 text-center">
      <span className={`font-headline-md text-headline-md block font-bold ${color}`}>{valor}</span>
      <span className="text-body-sm font-label-lg text-on-surface-variant">{etiqueta}</span>
    </div>
  );
}
