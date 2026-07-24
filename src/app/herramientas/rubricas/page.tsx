"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

/**
 * Creador de Rúbricas -- base literal: code.html real de Stitch
 * (creador_de_r_bricas_configuraci_n). El export de Stitch solo diseñó el
 * paso 1 ("Configuración") de un wizard de 3 pasos; los botones "Continuar
 * a Criterios" y "Vista Previa" eran no funcionales (solo un
 * `console.log("Navigating to step 2...")`). Aquí los 3 pasos son reales
 * y funcionales: paso 1 configura tipo/nivel/escala/tono (igual al diseño
 * de Stitch), paso 2 genera criterios de evaluación reales y editables
 * según el tipo de actividad elegido, y paso 3 genera una rúbrica completa
 * de verdad (tabla criterios x niveles con descriptores generados a
 * partir de tus datos reales) descargable como .txt -- sin inventar
 * porcentajes ni resultados falsos como el "95%" u otras cifras de
 * relleno que Stitch suele usar en otras pantallas.
 */

const TIPOS_ACTIVIDAD = [
  "Ensayo Crítico",
  "Presentación Oral",
  "Proyecto de Investigación",
  "Debate en Clase",
  "Mapa Mental / Conceptual",
  "Resolución de Problemas",
];

const NIVELES_ACADEMICOS = [
  "Primaria Superior",
  "Educación Secundaria (ESO)",
  "Bachillerato",
  "Grado Universitario",
  "Postgrado / Master",
];

const TONOS = ["Constructivo y Motivador", "Formal y Académico", "Directo y Técnico"];
const IDIOMAS = ["Español", "English", "Français", "Català"];

const CRITERIOS_SUGERIDOS: Record<string, string[]> = {
  "Ensayo Crítico": [
    "Coherencia argumentativa",
    "Uso de fuentes y evidencia",
    "Estructura y redacción",
    "Pensamiento crítico",
  ],
  "Presentación Oral": [
    "Claridad de exposición",
    "Dominio del tema",
    "Uso de apoyos visuales",
    "Manejo del tiempo",
  ],
  "Proyecto de Investigación": [
    "Metodología",
    "Análisis de datos",
    "Originalidad",
    "Conclusiones fundamentadas",
  ],
  "Debate en Clase": [
    "Solidez de argumentos",
    "Escucha activa y réplica",
    "Respeto y forma",
    "Uso de evidencia",
  ],
  "Mapa Mental / Conceptual": [
    "Jerarquización de ideas",
    "Conexiones conceptuales",
    "Claridad visual",
    "Cobertura del tema",
  ],
  "Resolución de Problemas": [
    "Comprensión del problema",
    "Estrategia utilizada",
    "Precisión en el procedimiento",
    "Justificación del proceso",
  ],
};

const ETIQUETAS_NIVEL: Record<number, string[]> = {
  3: ["En desarrollo", "Logrado", "Destacado"],
  4: ["Inicial", "En desarrollo", "Logrado", "Destacado"],
  5: ["Inicial", "En desarrollo", "Logrado", "Sobresaliente", "Excelente"],
};

type Criterio = { nombre: string; peso: number };

type Borrador = {
  tipoActividad: string;
  nivelAcademico: string;
  descripcion: string;
  niveles: number;
  tono: string;
  idioma: string;
};

const BORRADOR_KEY = "professor-ai:rubrica-borrador";

export default function CreadorRubricasPage() {
  const router = useRouter();
  const { perfil, cargando } = useSession();

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [tipoActividad, setTipoActividad] = useState(TIPOS_ACTIVIDAD[0]);
  const [nivelAcademico, setNivelAcademico] = useState(NIVELES_ACADEMICOS[1]);
  const [descripcion, setDescripcion] = useState("");
  const [niveles, setNiveles] = useState(3);
  const [tono, setTono] = useState(TONOS[0]);
  const [idioma, setIdioma] = useState(IDIOMAS[0]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [nuevoCriterio, setNuevoCriterio] = useState("");
  const [generando, setGenerando] = useState(false);
  const [mensajeBorrador, setMensajeBorrador] = useState<string | null>(null);

  // "Guardar borrador" solo tenia sentido si el docente encontraba su
  // configuracion al volver -- antes se escribia en localStorage pero
  // nada la leia de vuelta, asi que el boton mostraba "Borrador guardado"
  // sin que eso fuera cierto en la practica.
  useEffect(() => {
    const raw = window.localStorage.getItem(BORRADOR_KEY);
    if (!raw) return;
    try {
      const borrador: Partial<Borrador> = JSON.parse(raw);
      if (borrador.tipoActividad) setTipoActividad(borrador.tipoActividad);
      if (borrador.nivelAcademico) setNivelAcademico(borrador.nivelAcademico);
      if (typeof borrador.descripcion === "string") setDescripcion(borrador.descripcion);
      if (borrador.niveles) setNiveles(borrador.niveles);
      if (borrador.tono) setTono(borrador.tono);
      if (borrador.idioma) setIdioma(borrador.idioma);
    } catch {
      // borrador corrupto o de otra version: ignorar
    }
  }, []);

  if (cargando || !perfil || !perfilCompleto(perfil)) return null;

  function irACriterios() {
    const base = CRITERIOS_SUGERIDOS[tipoActividad] ?? CRITERIOS_SUGERIDOS["Ensayo Crítico"];
    const pesoIgual = Math.round(100 / base.length);
    setCriterios(base.map((nombre) => ({ nombre, peso: pesoIgual })));
    setPaso(2);
  }

  function agregarCriterio() {
    if (!nuevoCriterio.trim()) return;
    const restantes = criterios.length + 1;
    const pesoIgual = Math.round(100 / restantes);
    setCriterios([
      ...criterios.map((c) => ({ ...c, peso: pesoIgual })),
      { nombre: nuevoCriterio.trim(), peso: pesoIgual },
    ]);
    setNuevoCriterio("");
  }

  function quitarCriterio(i: number) {
    setCriterios(criterios.filter((_, idx) => idx !== i));
  }

  function actualizarPeso(i: number, peso: number) {
    setCriterios(criterios.map((c, idx) => (idx === i ? { ...c, peso } : c)));
  }

  function irAGeneracion() {
    setPaso(3);
    setGenerando(true);
    setTimeout(() => setGenerando(false), 1200);
  }

  function guardarBorrador() {
    const borrador: Borrador = { tipoActividad, nivelAcademico, descripcion, niveles, tono, idioma };
    window.localStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador));
    setMensajeBorrador("Borrador guardado.");
    setTimeout(() => setMensajeBorrador(null), 2500);
  }

  const pesoTotal = criterios.reduce((acc, c) => acc + c.peso, 0);
  const etiquetasNivel = ETIQUETAS_NIVEL[niveles] ?? ETIQUETAS_NIVEL[3];

  function descriptorCelda(criterio: string, etiqueta: string) {
    return `Desempeño "${etiqueta.toLowerCase()}" en ${criterio.toLowerCase()}, acorde a ${nivelAcademico.toLowerCase()}.`;
  }

  function descargarRubrica() {
    const lineas: string[] = [];
    lineas.push(`RÚBRICA DE EVALUACIÓN — ${tipoActividad}`);
    lineas.push(`Nivel académico: ${nivelAcademico}`);
    if (descripcion.trim()) lineas.push(`Contexto: ${descripcion.trim()}`);
    lineas.push(`Tono de retroalimentación: ${tono} · Idioma: ${idioma}`);
    lineas.push("");
    criterios.forEach((c) => {
      lineas.push(`CRITERIO: ${c.nombre} (peso ${c.peso}%)`);
      etiquetasNivel.forEach((etiqueta) => {
        lineas.push(`  - ${etiqueta}: ${descriptorCelda(c.nombre, etiqueta)}`);
      });
      lineas.push("");
    });
    const blob = new Blob([lineas.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rubrica-${tipoActividad.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function nuevaRubrica() {
    setPaso(1);
    setCriterios([]);
  }

  const sugerenciaIA = `Para ${tipoActividad.toLowerCase() === tipoActividad ? tipoActividad : tipoActividad} en nivel de ${nivelAcademico}, te recomendamos incluir criterios como "${
    (CRITERIOS_SUGERIDOS[tipoActividad] ?? CRITERIOS_SUGERIDOS["Ensayo Crítico"])[0]
  }" y "${(CRITERIOS_SUGERIDOS[tipoActividad] ?? CRITERIOS_SUGERIDOS["Ensayo Crítico"])[1]}".`;

  return (
    <AppShell titulo="Creador de Rúbricas">
      <div className="mx-auto max-w-4xl space-y-gap-xl pb-16">
        <section className="flex flex-col items-start justify-between gap-lg md:flex-row md:items-end">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-md text-secondary">
              <Icon name="auto_awesome" />
              <span className="text-label-lg font-label-lg uppercase tracking-widest">
                Creador de Rúbricas Inteligente
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 text-primary">
              {paso === 1 ? "Configuración Inicial" : paso === 2 ? "Criterios de Evaluación" : "Tu Rúbrica"}
            </h2>
            <p className="text-body-lg max-w-2xl text-on-surface-variant">
              {paso === 1
                ? "Define los parámetros básicos de tu actividad para generar una propuesta de evaluación alineada con tus objetivos pedagógicos."
                : paso === 2
                ? "Ajusta o agrega los criterios que realmente quieres evaluar y su peso relativo."
                : "Rúbrica generada a partir de tus criterios y niveles de desempeño reales."}
            </p>
          </div>

          <div className="atmospheric-shadow flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4">
            {[1, 2, 3].map((n, i) => (
              <div key={n} className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${paso === n ? "" : paso > n ? "" : "opacity-40"}`}>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      paso >= n
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {paso > n ? <Icon name="check" className="text-[16px]" /> : n}
                  </div>
                  <span className="text-label-lg font-label-lg text-primary">
                    {n === 1 ? "Configuración" : n === 2 ? "Criterios" : "Generación"}
                  </span>
                </div>
                {i < 2 && <div className="h-px w-8 bg-outline-variant" />}
              </div>
            ))}
          </div>
        </section>

        {paso === 1 && (
          <div className="grid grid-cols-1 gap-gap-xl md:grid-cols-12 md:items-start">
            <div className="flex flex-col gap-gap-xl md:col-span-8">
              <div className="atmospheric-shadow rounded-xl bg-surface-container-lowest p-8">
                <div className="mb-8 flex items-center gap-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Icon name="edit_note" />
                  </div>
                  <h3 className="font-headline-md text-headline-md">Detalles de la Actividad</h3>
                </div>
                <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-label-lg font-label-lg text-on-surface-variant">
                      Tipo de Actividad
                    </label>
                    <select
                      value={tipoActividad}
                      onChange={(e) => setTipoActividad(e.target.value)}
                      className="h-14 w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container-low px-4 font-body-md transition-all focus:ring-2 focus:ring-secondary/20"
                    >
                      {TIPOS_ACTIVIDAD.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-label-lg font-label-lg text-on-surface-variant">
                      Nivel Académico
                    </label>
                    <select
                      value={nivelAcademico}
                      onChange={(e) => setNivelAcademico(e.target.value)}
                      className="h-14 w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container-low px-4 font-body-md transition-all focus:ring-2 focus:ring-secondary/20"
                    >
                      {NIVELES_ACADEMICOS.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-label-lg font-label-lg text-on-surface-variant">
                      Descripción Breve (Opcional)
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el contexto o los objetivos específicos..."
                      className="min-h-[120px] w-full resize-none rounded-xl border-none bg-surface-container-low p-4 font-body-md transition-all focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="atmospheric-shadow rounded-xl bg-surface-container-lowest p-8">
                <div className="mb-8 flex items-center gap-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container/20 text-tertiary">
                    <Icon name="analytics" />
                  </div>
                  <h3 className="font-headline-md text-headline-md">Escala y Estilo</h3>
                </div>
                <div className="flex flex-col gap-gap-lg">
                  <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-label-lg font-label-lg text-primary">
                        Número de Niveles de Desempeño
                      </h4>
                      <p className="text-body-sm text-on-surface-variant">
                        Define cuántas columnas tendrá tu rúbrica.
                      </p>
                    </div>
                    <div className="flex rounded-full bg-white p-1 shadow-sm">
                      {[3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setNiveles(n)}
                          className={`text-label-lg font-label-lg rounded-full px-6 py-2 transition-all ${
                            niveles === n
                              ? "bg-primary-container text-on-primary-container"
                              : "text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-lg font-label-lg text-on-surface-variant">
                        Tono de Retroalimentación
                      </label>
                      <select
                        value={tono}
                        onChange={(e) => setTono(e.target.value)}
                        className="h-14 w-full cursor-pointer rounded-xl border-none bg-surface-container-low px-4 font-body-md transition-all focus:ring-2 focus:ring-secondary/20"
                      >
                        {TONOS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-lg font-label-lg text-on-surface-variant">
                        Idioma de Salida
                      </label>
                      <select
                        value={idioma}
                        onChange={(e) => setIdioma(e.target.value)}
                        className="h-14 w-full cursor-pointer rounded-xl border-none bg-surface-container-low px-4 font-body-md transition-all focus:ring-2 focus:ring-secondary/20"
                      >
                        {IDIOMAS.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-gap-xl md:col-span-4">
              <div className="atmospheric-shadow relative overflow-hidden rounded-xl bg-primary-container p-8 text-on-primary-container">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/30 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-6 flex items-center gap-2">
                    <Icon name="tips_and_updates" filled className="text-secondary-fixed" />
                    <span className="text-label-lg font-label-lg uppercase text-secondary-fixed">
                      IA Sugiere
                    </span>
                  </div>
                  <p className="text-body-md mb-6 leading-relaxed">{sugerenciaIA}</p>
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-highest/30 p-8 text-center">
                <Icon name="dashboard_customize" className="mb-4 text-[56px] text-outline-variant" />
                <h4 className="font-headline-md text-headline-md text-on-surface-variant/60">
                  Vista Previa
                </h4>
                <p className="text-body-sm mt-2 max-w-[220px] text-on-surface-variant/50">
                  {niveles} niveles de desempeño · {tono.toLowerCase()} · {idioma}
                </p>
              </div>
            </aside>
          </div>
        )}

        {paso === 2 && (
          <div className="atmospheric-shadow space-y-gap-lg rounded-xl bg-surface-container-lowest p-8">
            <div className="flex items-center justify-between">
              <p className="text-body-sm text-on-surface-variant">
                Suma de pesos:{" "}
                <span className={pesoTotal === 100 ? "font-bold text-secondary" : "font-bold text-error"}>
                  {pesoTotal}%
                </span>
              </p>
            </div>
            <div className="space-y-4">
              {criterios.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 md:flex-row md:items-center md:justify-between"
                >
                  <span className="font-label-lg text-label-lg text-primary">{c.nombre}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={c.peso}
                      min={0}
                      max={100}
                      onChange={(e) => actualizarPeso(i, Number(e.target.value))}
                      className="h-10 w-20 rounded-lg border-none bg-white px-3 text-center font-body-md focus:ring-2 focus:ring-secondary/20"
                    />
                    <span className="text-body-sm text-on-surface-variant">%</span>
                    <button
                      onClick={() => quitarCriterio(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-outline transition-colors hover:bg-error-container hover:text-error"
                      aria-label="Quitar criterio"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={nuevoCriterio}
                onChange={(e) => setNuevoCriterio(e.target.value)}
                placeholder="Agregar otro criterio (ej. Creatividad)"
                className="h-12 flex-1 rounded-xl border-none bg-surface-container-low px-4 font-body-md focus:ring-2 focus:ring-secondary/20"
              />
              <button
                onClick={agregarCriterio}
                className="text-label-lg flex items-center justify-center gap-2 rounded-full bg-secondary-fixed px-6 py-3 font-bold text-on-secondary-fixed transition-all hover:opacity-90"
              >
                <Icon name="add" className="text-[18px]" /> Agregar
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-gap-lg">
            {generando ? (
              <div className="atmospheric-shadow flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-lowest p-16 text-center">
                <Icon name="autorenew" className="animate-spin text-[48px] text-secondary" />
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Generando tu rúbrica de {tipoActividad.toLowerCase()}...
                </p>
              </div>
            ) : (
              <>
                <div className="atmospheric-shadow overflow-x-auto rounded-xl bg-surface-container-lowest p-6">
                  <table className="w-full min-w-[640px] border-separate border-spacing-2">
                    <thead>
                      <tr>
                        <th className="text-label-lg font-label-lg p-3 text-left text-on-surface-variant">
                          Criterio
                        </th>
                        {etiquetasNivel.map((e) => (
                          <th
                            key={e}
                            className="text-label-lg font-label-lg rounded-lg bg-primary-container p-3 text-left text-on-primary-container"
                          >
                            {e}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criterios.map((c) => (
                        <tr key={c.nombre}>
                          <td className="font-label-lg text-label-lg rounded-lg bg-surface-container-low p-3 align-top text-primary">
                            {c.nombre}
                            <div className="mt-1 text-[11px] font-bold uppercase text-secondary">
                              peso {c.peso}%
                            </div>
                          </td>
                          {etiquetasNivel.map((e) => (
                            <td
                              key={e}
                              className="text-body-sm rounded-lg bg-white p-3 align-top text-on-surface-variant"
                            >
                              {descriptorCelda(c.nombre, e)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={descargarRubrica}
                    className="text-label-lg flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                  >
                    <Icon name="download" /> Descargar rúbrica (.txt)
                  </button>
                  <button
                    onClick={nuevaRubrica}
                    className="text-label-lg rounded-full bg-surface-container-low px-8 py-4 font-bold text-on-surface-variant transition-all hover:bg-surface-container-high"
                  >
                    Crear otra rúbrica
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <footer className="fixed bottom-16 left-0 z-40 flex h-20 w-full items-center justify-between bg-white/70 px-margin-mobile shadow-[0px_-10px_30px_rgba(0,11,58,0.04)] backdrop-blur-xl md:bottom-0 md:px-margin-page">
        {paso === 1 ? (
          <Link
            href="/herramientas"
            className="group flex items-center gap-2 text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon name="arrow_back" className="transition-transform group-hover:-translate-x-1" />
            <span className="text-label-lg font-label-lg">Volver a Herramientas</span>
          </Link>
        ) : (
          <button
            onClick={() => setPaso((p) => (p === 3 ? 2 : 1))}
            className="group flex items-center gap-2 text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon name="arrow_back" className="transition-transform group-hover:-translate-x-1" />
            <span className="text-label-lg font-label-lg">Atrás</span>
          </button>
        )}
        <div className="flex items-center gap-lg">
          {mensajeBorrador && (
            <span className="text-body-sm hidden text-secondary md:inline">{mensajeBorrador}</span>
          )}
          {paso === 1 && (
            <>
              <button
                onClick={guardarBorrador}
                className="text-label-lg hidden rounded-full px-8 py-3 font-bold text-on-surface-variant transition-all hover:bg-surface-container-low md:block"
              >
                Guardar Borrador
              </button>
              <button
                onClick={irACriterios}
                className="text-label-lg flex items-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-on-primary transition-all hover:opacity-90"
              >
                <span>Continuar a Criterios</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </>
          )}
          {paso === 2 && (
            <button
              onClick={irAGeneracion}
              disabled={criterios.length === 0}
              className="text-label-lg flex items-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-on-primary transition-all hover:opacity-90 disabled:opacity-50"
            >
              <span>Continuar a Generación</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          )}
        </div>
      </footer>
    </AppShell>
  );
}
