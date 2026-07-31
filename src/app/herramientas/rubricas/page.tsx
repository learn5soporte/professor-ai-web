"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import { tpl, type Idioma } from "@/lib/i18n/traducciones";

/**
 * Creador de Rúbricas -- base literal: code.html real de Stitch
 * (creador_de_r_bricas_configuraci_n). El export de Stitch solo diseñó el
 * paso 1 ("Configuración") de un wizard de 3 pasos; aquí los 3 pasos son
 * reales y funcionales, con la rúbrica final descargable como .txt.
 *
 * Fase i18n: los valores de los selects (tipo de actividad, nivel
 * académico, tono) se mantienen en español como clave canónica (también
 * la del borrador guardado en localStorage); las etiquetas visibles, los
 * criterios sugeridos y los descriptores generados salen del idioma
 * activo. "Idioma de Salida" (Español/English/...) se muestra tal cual:
 * son autónimos de idioma, no texto de UI.
 */

const TIPOS_ACTIVIDAD = [
  "Ensayo Crítico",
  "Presentación Oral",
  "Proyecto de Investigación",
  "Debate en Clase",
  "Mapa Mental / Conceptual",
  "Resolución de Problemas",
];

const TIPO_LABEL_EN: Record<string, string> = {
  "Ensayo Crítico": "Critical Essay",
  "Presentación Oral": "Oral Presentation",
  "Proyecto de Investigación": "Research Project",
  "Debate en Clase": "Class Debate",
  "Mapa Mental / Conceptual": "Mind / Concept Map",
  "Resolución de Problemas": "Problem Solving",
};

const NIVELES_ACADEMICOS = [
  "Primaria Superior",
  "Educación Secundaria (ESO)",
  "Bachillerato",
  "Grado Universitario",
  "Postgrado / Master",
];

const NIVEL_LABEL_EN: Record<string, string> = {
  "Primaria Superior": "Upper Primary",
  "Educación Secundaria (ESO)": "Secondary Education",
  Bachillerato: "High School",
  "Grado Universitario": "Undergraduate",
  "Postgrado / Master": "Postgraduate / Master's",
};

const TONOS = ["Constructivo y Motivador", "Formal y Académico", "Directo y Técnico"];

const TONO_LABEL_EN: Record<string, string> = {
  "Constructivo y Motivador": "Constructive & Motivating",
  "Formal y Académico": "Formal & Academic",
  "Directo y Técnico": "Direct & Technical",
};

const IDIOMAS = ["Español", "English", "Français", "Català"];

const CRITERIOS_SUGERIDOS: Record<Idioma, Record<string, string[]>> = {
  es: {
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
  },
  en: {
    "Ensayo Crítico": [
      "Argumentative coherence",
      "Use of sources and evidence",
      "Structure and writing",
      "Critical thinking",
    ],
    "Presentación Oral": [
      "Clarity of delivery",
      "Command of the topic",
      "Use of visual aids",
      "Time management",
    ],
    "Proyecto de Investigación": [
      "Methodology",
      "Data analysis",
      "Originality",
      "Well-founded conclusions",
    ],
    "Debate en Clase": [
      "Strength of arguments",
      "Active listening and rebuttal",
      "Respect and form",
      "Use of evidence",
    ],
    "Mapa Mental / Conceptual": [
      "Hierarchy of ideas",
      "Conceptual connections",
      "Visual clarity",
      "Topic coverage",
    ],
    "Resolución de Problemas": [
      "Understanding of the problem",
      "Strategy used",
      "Accuracy of the procedure",
      "Justification of the process",
    ],
  },
};

const ETIQUETAS_NIVEL: Record<Idioma, Record<number, string[]>> = {
  es: {
    3: ["En desarrollo", "Logrado", "Destacado"],
    4: ["Inicial", "En desarrollo", "Logrado", "Destacado"],
    5: ["Inicial", "En desarrollo", "Logrado", "Sobresaliente", "Excelente"],
  },
  en: {
    3: ["Developing", "Achieved", "Outstanding"],
    4: ["Beginning", "Developing", "Achieved", "Outstanding"],
    5: ["Beginning", "Developing", "Achieved", "Exceeding", "Excellent"],
  },
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
  const { idioma, t } = useIdioma();

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
  const [idiomaSalida, setIdiomaSalida] = useState(IDIOMAS[0]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [nuevoCriterio, setNuevoCriterio] = useState("");
  const [generando, setGenerando] = useState(false);
  const [mensajeBorrador, setMensajeBorrador] = useState(false);

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
      if (borrador.idioma) setIdiomaSalida(borrador.idioma);
    } catch {
      // borrador corrupto o de otra version: ignorar
    }
  }, []);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil)) return null;

  const tipoLabel = (x: string) => (idioma === "en" ? TIPO_LABEL_EN[x] ?? x : x);
  const nivelLabel = (x: string) => (idioma === "en" ? NIVEL_LABEL_EN[x] ?? x : x);
  const tonoLabel = (x: string) => (idioma === "en" ? TONO_LABEL_EN[x] ?? x : x);

  function irACriterios() {
    const base =
      CRITERIOS_SUGERIDOS[idioma][tipoActividad] ??
      CRITERIOS_SUGERIDOS[idioma]["Ensayo Crítico"];
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
    const borrador: Borrador = {
      tipoActividad,
      nivelAcademico,
      descripcion,
      niveles,
      tono,
      idioma: idiomaSalida,
    };
    window.localStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador));
    setMensajeBorrador(true);
    setTimeout(() => setMensajeBorrador(false), 2500);
  }

  const pesoTotal = criterios.reduce((acc, c) => acc + c.peso, 0);
  const etiquetasNivel = ETIQUETAS_NIVEL[idioma][niveles] ?? ETIQUETAS_NIVEL[idioma][3];

  function descriptorCelda(criterio: string, etiqueta: string) {
    return idioma === "en"
      ? `"${etiqueta}" performance in ${criterio.toLowerCase()}, appropriate for ${nivelLabel(nivelAcademico).toLowerCase()}.`
      : `Desempeño "${etiqueta.toLowerCase()}" en ${criterio.toLowerCase()}, acorde a ${nivelAcademico.toLowerCase()}.`;
  }

  function descargarRubrica() {
    const lineas: string[] = [];
    lineas.push(`${t.herramientas.rubricaTxtTitulo} — ${tipoLabel(tipoActividad)}`);
    lineas.push(`${t.herramientas.rubricaTxtNivel}: ${nivelLabel(nivelAcademico)}`);
    if (descripcion.trim()) {
      lineas.push(`${t.herramientas.rubricaTxtContexto}: ${descripcion.trim()}`);
    }
    lineas.push(
      `${t.herramientas.rubricaTxtTono}: ${tonoLabel(tono)} · ${t.herramientas.rubricaTxtIdioma}: ${idiomaSalida}`
    );
    lineas.push("");
    criterios.forEach((c) => {
      lineas.push(
        `${t.herramientas.rubricaTxtCriterio}: ${c.nombre} (${t.herramientas.rubricaTxtPeso} ${c.peso}%)`
      );
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

  const criteriosBase =
    CRITERIOS_SUGERIDOS[idioma][tipoActividad] ??
    CRITERIOS_SUGERIDOS[idioma]["Ensayo Crítico"];
  const sugerenciaIA = tpl(t.herramientas.iaSugerencia, {
    tipo: tipoLabel(tipoActividad),
    nivel: nivelLabel(nivelAcademico),
    c1: criteriosBase[0],
    c2: criteriosBase[1],
  });

  return (
    <AppShell titulo={t.herramientas.rubricasNombre}>
      <div className="mx-auto max-w-4xl space-y-gap-xl pb-16">
        <section className="flex flex-col items-start justify-between gap-lg md:flex-row md:items-end">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-md text-secondary">
              <Icon name="auto_awesome" />
              <span className="font-label text-xs font-bold uppercase tracking-widest">
                {t.herramientas.creadorInteligente}
              </span>
            </div>
            <h2 className="font-headline text-3xl sm:text-4xl mb-2 text-primary">
              {paso === 1
                ? t.herramientas.configuracionInicial
                : paso === 2
                ? t.herramientas.criteriosEvaluacion
                : t.herramientas.tuRubrica}
            </h2>
            <p className="text-lg max-w-2xl text-on-surface-variant">
              {paso === 1
                ? t.herramientas.paso1Desc
                : paso === 2
                ? t.herramientas.paso2Desc
                : t.herramientas.paso3Desc}
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
                  <span className="font-label text-xs font-bold text-primary">
                    {n === 1
                      ? t.herramientas.pasoConfiguracion
                      : n === 2
                      ? t.herramientas.pasoCriterios
                      : t.herramientas.pasoGeneracion}
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
                  <h3 className="font-headline text-xl font-bold">
                    {t.herramientas.detallesActividad}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs font-bold text-on-surface-variant">
                      {t.herramientas.tipoActividad}
                    </label>
                    <select
                      value={tipoActividad}
                      onChange={(e) => setTipoActividad(e.target.value)}
                      className="h-14 w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container-low px-4 text-sm transition-all focus:ring-2 focus:ring-secondary/20"
                    >
                      {TIPOS_ACTIVIDAD.map((x) => (
                        <option key={x} value={x}>
                          {tipoLabel(x)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs font-bold text-on-surface-variant">
                      {t.herramientas.nivelAcademico}
                    </label>
                    <select
                      value={nivelAcademico}
                      onChange={(e) => setNivelAcademico(e.target.value)}
                      className="h-14 w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container-low px-4 text-sm transition-all focus:ring-2 focus:ring-secondary/20"
                    >
                      {NIVELES_ACADEMICOS.map((n) => (
                        <option key={n} value={n}>
                          {nivelLabel(n)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-label text-xs font-bold text-on-surface-variant">
                      {t.herramientas.descripcionBreve}
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder={t.herramientas.descPlaceholder}
                      className="min-h-[120px] w-full resize-none rounded-xl border-none bg-surface-container-low p-4 text-sm transition-all focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="atmospheric-shadow rounded-xl bg-surface-container-lowest p-8">
                <div className="mb-8 flex items-center gap-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container/20 text-tertiary">
                    <Icon name="analytics" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">
                    {t.herramientas.escalaEstilo}
                  </h3>
                </div>
                <div className="flex flex-col gap-gap-lg">
                  <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="font-label text-xs font-bold text-primary">
                        {t.herramientas.numNiveles}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {t.herramientas.numNivelesDesc}
                      </p>
                    </div>
                    <div className="flex rounded-full bg-white p-1 shadow-sm">
                      {[3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setNiveles(n)}
                          className={`font-label text-xs font-bold rounded-full px-6 py-2 transition-all ${
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
                      <label className="font-label text-xs font-bold text-on-surface-variant">
                        {t.herramientas.tonoRetro}
                      </label>
                      <select
                        value={tono}
                        onChange={(e) => setTono(e.target.value)}
                        className="h-14 w-full cursor-pointer rounded-xl border-none bg-surface-container-low px-4 text-sm transition-all focus:ring-2 focus:ring-secondary/20"
                      >
                        {TONOS.map((x) => (
                          <option key={x} value={x}>
                            {tonoLabel(x)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label text-xs font-bold text-on-surface-variant">
                        {t.herramientas.idiomaSalida}
                      </label>
                      <select
                        value={idiomaSalida}
                        onChange={(e) => setIdiomaSalida(e.target.value)}
                        className="h-14 w-full cursor-pointer rounded-xl border-none bg-surface-container-low px-4 text-sm transition-all focus:ring-2 focus:ring-secondary/20"
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
                    <span className="font-label text-xs font-bold uppercase text-secondary-fixed">
                      {t.herramientas.iaSugiere}
                    </span>
                  </div>
                  <p className="text-base mb-6 leading-relaxed">{sugerenciaIA}</p>
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-highest/30 p-8 text-center">
                <Icon name="dashboard_customize" className="mb-4 text-[56px] text-outline-variant" />
                <h4 className="font-headline text-xl font-bold text-on-surface-variant/60">
                  {t.herramientas.vistaPrevia}
                </h4>
                <p className="text-sm mt-2 max-w-[220px] text-on-surface-variant/50">
                  {tpl(t.herramientas.vistaPreviaDesc, {
                    n: niveles,
                    tono: tonoLabel(tono).toLowerCase(),
                    idioma: idiomaSalida,
                  })}
                </p>
              </div>
            </aside>
          </div>
        )}

        {paso === 2 && (
          <div className="atmospheric-shadow space-y-gap-lg rounded-xl bg-surface-container-lowest p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-on-surface-variant">
                {t.herramientas.sumaPesos}{" "}
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
                  <span className="font-label text-xs font-bold text-primary">{c.nombre}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={c.peso}
                      min={0}
                      max={100}
                      onChange={(e) => actualizarPeso(i, Number(e.target.value))}
                      className="h-10 w-20 rounded-lg border-none bg-white px-3 text-center text-sm focus:ring-2 focus:ring-secondary/20"
                    />
                    <span className="text-sm text-on-surface-variant">%</span>
                    <button
                      onClick={() => quitarCriterio(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-outline transition-colors hover:bg-error-container hover:text-error"
                      aria-label={t.herramientas.quitarCriterio}
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
                placeholder={t.herramientas.agregarPlaceholder}
                className="h-12 flex-1 rounded-xl border-none bg-surface-container-low px-4 text-sm focus:ring-2 focus:ring-secondary/20"
              />
              <button
                onClick={agregarCriterio}
                className="flex items-center justify-center gap-2 rounded-full bg-secondary-fixed px-6 py-3 text-sm font-bold text-on-secondary-fixed transition-all hover:opacity-90"
              >
                <Icon name="add" className="text-[18px]" /> {t.herramientas.agregar}
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-gap-lg">
            {generando ? (
              <div className="atmospheric-shadow flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-lowest p-16 text-center">
                <Icon name="autorenew" className="animate-spin text-[48px] text-secondary" />
                <p className="text-lg text-on-surface-variant">
                  {tpl(t.herramientas.generandoRubrica, {
                    tipo: tipoLabel(tipoActividad).toLowerCase(),
                  })}
                </p>
              </div>
            ) : (
              <>
                {/* Feedback real (docente probando el prototipo, 2026-07-23,
                    via WhatsApp): "en movil algunos cuadros no se ven
                    completos, hay que hacer scroll". Este aviso solo aparece
                    por debajo de md (en desktop la tabla ya entra
                    completa). */}
                <p className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-on-surface-variant md:hidden">
                  <Icon name="swipe" className="text-[16px]" />
                  {t.herramientas.deslizaNiveles}
                </p>
                <div className="atmospheric-shadow overflow-x-auto rounded-xl bg-surface-container-lowest p-6">
                  <table className="w-full min-w-[640px] border-separate border-spacing-2">
                    <thead>
                      <tr>
                        <th className="font-label text-xs font-bold p-3 text-left text-on-surface-variant">
                          {t.herramientas.criterioCol}
                        </th>
                        {etiquetasNivel.map((e) => (
                          <th
                            key={e}
                            className="font-label text-xs font-bold rounded-lg bg-primary-container p-3 text-left text-on-primary-container"
                          >
                            {e}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criterios.map((c) => (
                        <tr key={c.nombre}>
                          <td className="font-label text-xs font-bold rounded-lg bg-surface-container-low p-3 align-top text-primary">
                            {c.nombre}
                            <div className="mt-1 text-[11px] font-bold uppercase text-secondary">
                              {tpl(t.herramientas.pesoLabel, { n: c.peso })}
                            </div>
                          </td>
                          {etiquetasNivel.map((e) => (
                            <td
                              key={e}
                              className="text-sm rounded-lg bg-white p-3 align-top text-on-surface-variant"
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
                    className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                  >
                    <Icon name="download" /> {t.herramientas.descargarRubrica}
                  </button>
                  <button
                    onClick={nuevaRubrica}
                    className="rounded-full bg-surface-container-low px-8 py-4 text-base font-bold text-on-surface-variant transition-all hover:bg-surface-container-high"
                  >
                    {t.herramientas.crearOtra}
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
            <span className="font-label text-xs font-bold">
              {t.herramientas.volverHerramientas}
            </span>
          </Link>
        ) : (
          <button
            onClick={() => setPaso((p) => (p === 3 ? 2 : 1))}
            className="group flex items-center gap-2 text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon name="arrow_back" className="transition-transform group-hover:-translate-x-1" />
            <span className="font-label text-xs font-bold">{t.comun.atras}</span>
          </button>
        )}
        <div className="flex items-center gap-lg">
          {mensajeBorrador && (
            <span className="text-sm hidden text-secondary md:inline">
              {t.herramientas.borradorGuardado}
            </span>
          )}
          {paso === 1 && (
            <>
              <button
                onClick={guardarBorrador}
                className="hidden rounded-full px-8 py-3 text-sm font-bold text-on-surface-variant transition-all hover:bg-surface-container-low md:block"
              >
                {t.herramientas.guardarBorrador}
              </button>
              <button
                onClick={irACriterios}
                className="flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-bold text-on-primary transition-all hover:opacity-90"
              >
                <span>{t.herramientas.continuarCriterios}</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </>
          )}
          {paso === 2 && (
            <button
              onClick={irAGeneracion}
              disabled={criterios.length === 0}
              className="flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-bold text-on-primary transition-all hover:opacity-90 disabled:opacity-50"
            >
              <span>{t.herramientas.continuarGeneracion}</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          )}
        </div>
      </footer>
    </AppShell>
  );
}
