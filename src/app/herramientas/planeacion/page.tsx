"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Generador de Clases (Planeación Pro) -- base literal: code.html real de
 * Stitch (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 24:
 * class-generator). Fase 0: no hay GPT-4o real todavia -- la "planeacion"
 * es una plantilla simulada que SI usa el tema/nivel/duracion/enfoque que
 * el docente escribe, y copiar/descargar funcionan de verdad.
 */

type Fase = { etiqueta: string; minutos: number; texto: string };

function generarFases(tema: string, duracion: number, enfoque: string): Fase[] {
  const t = tema.trim() || "el tema de la clase";
  const inicio = Math.round(duracion * 0.25);
  const desarrollo = Math.round(duracion * 0.55);
  const cierre = duracion - inicio - desarrollo;

  const porEnfoque: Record<string, { inicio: string; desarrollo: string; cierre: string }> = {
    "Activo / Gamificación": {
      inicio: `Dinámica de "lluvia de ideas" digital para identificar conocimientos previos sobre ${t}.`,
      desarrollo: `Reto gamificado en equipos: los estudiantes exploran ${t} a través de un juego con puntos y niveles.`,
      cierre: `Mini-quiz gamificado de 5 preguntas para validar comprensión de ${t}.`,
    },
    "Teórico / Tradicional": {
      inicio: `Preguntas exploratorias para activar los conocimientos previos sobre ${t}.`,
      desarrollo: `Exposición guiada de ${t} apoyada en ejemplos y preguntas de comprensión.`,
      cierre: `Síntesis grupal de las ideas clave de ${t} y resolución de dudas.`,
    },
    "Práctico / Laboratorio": {
      inicio: `Presentación del problema práctico relacionado con ${t} que resolverán en la sesión.`,
      desarrollo: `Trabajo práctico/experimental en parejas o grupos aplicando ${t}.`,
      cierre: `Puesta en común de resultados y conclusiones sobre ${t}.`,
    },
  };

  const copy = porEnfoque[enfoque] ?? porEnfoque["Activo / Gamificación"];

  return [
    { etiqueta: `INICIO (${inicio} min)`, minutos: inicio, texto: copy.inicio },
    { etiqueta: `DESARROLLO (${desarrollo} min)`, minutos: desarrollo, texto: copy.desarrollo },
    { etiqueta: `CIERRE (${cierre} min)`, minutos: cierre, texto: copy.cierre },
  ];
}

export default function PlaneacionProPage() {
  const router = useRouter();
  const { perfil, cargando } = useSession();

  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState("Secundaria");
  const [duracion, setDuracion] = useState(60);
  const [enfoque, setEnfoque] = useState("Activo / Gamificación");
  const [estado, setEstado] = useState<"editando" | "generando" | "listo">("editando");
  const [copiado, setCopiado] = useState(false);
  const [fases, setFases] = useState<Fase[]>([]);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
  }, [cargando, perfil, router]);

  if (cargando || !perfil) return null;

  function generar() {
    setEstado("generando");
    setTimeout(() => {
      setFases(generarFases(tema, duracion, enfoque));
      setEstado("listo");
    }, 1200);
  }

  function textoPlano() {
    return [
      `Planeación: ${tema || "Sin título"}`,
      `Nivel: ${nivel} · Duración: ${duracion} min · Enfoque: ${enfoque}`,
      "",
      ...fases.map((f) => `${f.etiqueta}\n${f.texto}`),
    ].join("\n\n");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoPlano());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Si el navegador bloquea el portapapeles, no rompemos la UI.
    }
  }

  function descargar() {
    const blob = new Blob([textoPlano()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planeacion-${(tema || "clase").toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell titulo="Planeación Pro">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/herramientas"
          className="text-body-sm mb-4 inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> Herramientas
        </Link>

        <div className="rounded-[2.5rem] bg-surface-container-low p-8 md:p-12">
          <div className="space-y-gap-lg mx-auto max-w-2xl">
            <div className="text-center">
              <h1 className="font-headline-lg text-headline-lg">Generador de Clases</h1>
              <p className="text-body-lg mt-2 text-on-surface-variant">
                Personaliza tu secuencia didáctica con el poder de la IA.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-label-lg ml-2 uppercase text-on-surface-variant">
                    Tema de la clase
                  </label>
                  <input
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ej. Fotosíntesis"
                    type="text"
                    className="h-14 w-full rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg ml-2 uppercase text-on-surface-variant">
                    Nivel
                  </label>
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value)}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    <option>Secundaria</option>
                    <option>Bachillerato</option>
                    <option>Universidad</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg ml-2 uppercase text-on-surface-variant">
                    Duración
                  </label>
                  <select
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg ml-2 uppercase text-on-surface-variant">
                    Enfoque
                  </label>
                  <select
                    value={enfoque}
                    onChange={(e) => setEnfoque(e.target.value)}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    <option>Activo / Gamificación</option>
                    <option>Teórico / Tradicional</option>
                    <option>Práctico / Laboratorio</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={generar}
                disabled={estado === "generando"}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-on-secondary-fixed text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {estado === "generando" ? (
                  <>
                    <Icon name="autorenew" className="animate-spin" /> Generando...
                  </>
                ) : (
                  <>
                    <Icon name="auto_awesome" /> Generar Planeación
                  </>
                )}
              </button>
            </div>

            {estado === "listo" && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h4 className="font-headline-md">Vista Previa</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={descargar}
                      title="Descargar como .txt"
                      className="rounded-full bg-white p-3 text-secondary"
                    >
                      <Icon name="file_download" />
                    </button>
                    <button
                      onClick={copiar}
                      title="Copiar al portapapeles"
                      className="rounded-full bg-white p-3 text-secondary"
                    >
                      <Icon name={copiado ? "check" : "content_copy"} />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {fases.map((f, i) => (
                    <div
                      key={f.etiqueta}
                      className={`rounded-r-2xl border-l-4 p-6 ${
                        i === 0
                          ? "border-secondary bg-secondary-fixed/20"
                          : i === 1
                            ? "border-tertiary bg-tertiary-fixed/20"
                            : "border-on-primary-fixed-variant bg-on-primary-fixed-variant/10"
                      }`}
                    >
                      <span
                        className={`text-label-lg font-black ${
                          i === 0
                            ? "text-secondary"
                            : i === 1
                              ? "text-tertiary"
                              : "text-on-primary-fixed-variant"
                        }`}
                      >
                        {f.etiqueta}
                      </span>
                      <p className="text-body-md mt-2">{f.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
