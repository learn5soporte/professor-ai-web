"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import type { Idioma } from "@/lib/i18n/traducciones";

/**
 * Generador de Clases (Planeación Pro) -- base literal: code.html real de
 * Stitch (bloque_6_a_8_insignias_herramientas_y_progreso, Screen 24:
 * class-generator). Fase 0: no hay GPT-4o real todavia -- la "planeacion"
 * es una plantilla simulada que SI usa el tema/nivel/duracion/enfoque que
 * el docente escribe, y copiar/descargar funcionan de verdad.
 *
 * Fase i18n: los valores de los selects (nivel/enfoque) se mantienen en
 * español como clave canónica del formulario; solo la etiqueta visible y
 * el contenido generado cambian con el idioma activo.
 */

type Fase = { etiqueta: string; minutos: number; texto: string };

const NIVELES = ["Secundaria", "Bachillerato", "Universidad"];
const ENFOQUES = [
  "Activo / Gamificación",
  "Teórico / Tradicional",
  "Práctico / Laboratorio",
];

const NIVEL_LABEL_EN: Record<string, string> = {
  Secundaria: "Secondary",
  Bachillerato: "High School",
  Universidad: "University",
};

const ENFOQUE_LABEL_EN: Record<string, string> = {
  "Activo / Gamificación": "Active / Gamification",
  "Teórico / Tradicional": "Theoretical / Traditional",
  "Práctico / Laboratorio": "Hands-on / Lab",
};

const ETIQUETAS_FASE: Record<Idioma, [string, string, string]> = {
  es: ["INICIO", "DESARROLLO", "CIERRE"],
  en: ["OPENING", "DEVELOPMENT", "CLOSURE"],
};

const TEMA_FALLBACK: Record<Idioma, string> = {
  es: "el tema de la clase",
  en: "the lesson topic",
};

const COPY_POR_ENFOQUE: Record<
  Idioma,
  Record<string, { inicio: (t: string) => string; desarrollo: (t: string) => string; cierre: (t: string) => string }>
> = {
  es: {
    "Activo / Gamificación": {
      inicio: (t) =>
        `Dinámica de "lluvia de ideas" digital para identificar conocimientos previos sobre ${t}.`,
      desarrollo: (t) =>
        `Reto gamificado en equipos: los estudiantes exploran ${t} a través de un juego con puntos y niveles.`,
      cierre: (t) => `Mini-quiz gamificado de 5 preguntas para validar comprensión de ${t}.`,
    },
    "Teórico / Tradicional": {
      inicio: (t) => `Preguntas exploratorias para activar los conocimientos previos sobre ${t}.`,
      desarrollo: (t) => `Exposición guiada de ${t} apoyada en ejemplos y preguntas de comprensión.`,
      cierre: (t) => `Síntesis grupal de las ideas clave de ${t} y resolución de dudas.`,
    },
    "Práctico / Laboratorio": {
      inicio: (t) =>
        `Presentación del problema práctico relacionado con ${t} que resolverán en la sesión.`,
      desarrollo: (t) => `Trabajo práctico/experimental en parejas o grupos aplicando ${t}.`,
      cierre: (t) => `Puesta en común de resultados y conclusiones sobre ${t}.`,
    },
  },
  en: {
    "Activo / Gamificación": {
      inicio: (t) =>
        `Digital "brainstorming" activity to identify prior knowledge about ${t}.`,
      desarrollo: (t) =>
        `Gamified team challenge: students explore ${t} through a game with points and levels.`,
      cierre: (t) => `Gamified 5-question mini-quiz to check understanding of ${t}.`,
    },
    "Teórico / Tradicional": {
      inicio: (t) => `Exploratory questions to activate prior knowledge about ${t}.`,
      desarrollo: (t) => `Guided presentation of ${t} supported by examples and comprehension questions.`,
      cierre: (t) => `Group synthesis of the key ideas of ${t} and Q&A.`,
    },
    "Práctico / Laboratorio": {
      inicio: (t) =>
        `Presentation of the practical problem related to ${t} that students will solve in the session.`,
      desarrollo: (t) => `Practical/experimental work in pairs or groups applying ${t}.`,
      cierre: (t) => `Sharing of results and conclusions about ${t}.`,
    },
  },
};

function generarFases(
  tema: string,
  duracion: number,
  enfoque: string,
  idioma: Idioma
): Fase[] {
  const t = tema.trim() || TEMA_FALLBACK[idioma];
  const inicio = Math.round(duracion * 0.25);
  const desarrollo = Math.round(duracion * 0.55);
  const cierre = duracion - inicio - desarrollo;

  const copy =
    COPY_POR_ENFOQUE[idioma][enfoque] ?? COPY_POR_ENFOQUE[idioma]["Activo / Gamificación"];
  const [etIni, etDes, etCie] = ETIQUETAS_FASE[idioma];

  return [
    { etiqueta: `${etIni} (${inicio} min)`, minutos: inicio, texto: copy.inicio(t) },
    { etiqueta: `${etDes} (${desarrollo} min)`, minutos: desarrollo, texto: copy.desarrollo(t) },
    { etiqueta: `${etCie} (${cierre} min)`, minutos: cierre, texto: copy.cierre(t) },
  ];
}

export default function PlaneacionProPage() {
  const router = useRouter();
  const { perfil, cargando } = useSession();
  const { idioma, t } = useIdioma();

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
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil)) return null;

  const nivelLabel = (n: string) => (idioma === "en" ? NIVEL_LABEL_EN[n] ?? n : n);
  const enfoqueLabel = (e: string) => (idioma === "en" ? ENFOQUE_LABEL_EN[e] ?? e : e);

  function generar() {
    setEstado("generando");
    setTimeout(() => {
      setFases(generarFases(tema, duracion, enfoque, idioma));
      setEstado("listo");
    }, 1200);
  }

  function textoPlano() {
    return [
      `${t.herramientas.planeacionTxt}: ${tema || t.herramientas.sinTitulo}`,
      `${t.herramientas.nivel}: ${nivelLabel(nivel)} · ${t.herramientas.duracion}: ${duracion} min · ${t.herramientas.enfoque}: ${enfoqueLabel(enfoque)}`,
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
    <AppShell titulo={t.herramientas.planeacionNombre}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/herramientas"
          className="text-sm mb-4 inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> {t.comun.herramientas}
        </Link>

        <div className="rounded-[2.5rem] bg-surface-container-low p-8 md:p-12">
          <div className="space-y-gap-lg mx-auto max-w-2xl">
            <div className="text-center">
              <h1 className="font-headline text-3xl font-black">
                {t.herramientas.generadorClases}
              </h1>
              <p className="text-lg mt-2 text-on-surface-variant">
                {t.herramientas.personalizaSecuencia}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                    {t.herramientas.temaClase}
                  </label>
                  <input
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder={t.herramientas.temaPlaceholder}
                    type="text"
                    className="h-14 w-full rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                    {t.herramientas.nivel}
                  </label>
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value)}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    {NIVELES.map((n) => (
                      <option key={n} value={n}>
                        {nivelLabel(n)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                    {t.herramientas.duracion}
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
                  <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                    {t.herramientas.enfoque}
                  </label>
                  <select
                    value={enfoque}
                    onChange={(e) => setEnfoque(e.target.value)}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    {ENFOQUES.map((e) => (
                      <option key={e} value={e}>
                        {enfoqueLabel(e)}
                      </option>
                    ))}
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
                    <Icon name="autorenew" className="animate-spin" /> {t.herramientas.generando}
                  </>
                ) : (
                  <>
                    <Icon name="auto_awesome" /> {t.herramientas.generarPlaneacion}
                  </>
                )}
              </button>
            </div>

            {estado === "listo" && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h4 className="font-headline text-lg font-bold">
                    {t.herramientas.vistaPrevia}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={descargar}
                      title={t.comun.descargarTxt}
                      className="rounded-full bg-white p-3 text-secondary"
                    >
                      <Icon name="file_download" />
                    </button>
                    <button
                      onClick={copiar}
                      title={t.comun.copiarPortapapeles}
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
                        className={`text-xs font-black ${
                          i === 0
                            ? "text-secondary"
                            : i === 1
                              ? "text-tertiary"
                              : "text-on-primary-fixed-variant"
                        }`}
                      >
                        {f.etiqueta}
                      </span>
                      <p className="text-base mt-2">{f.texto}</p>
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
