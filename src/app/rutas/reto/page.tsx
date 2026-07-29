"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { generarFeedbackIA } from "@/lib/rutas/feedback";
import { Icon } from "@/components/Icon";
import { Confetti } from "@/components/Confetti";
import { CargandoPantalla } from "@/components/CargandoPantalla";

/**
 * Espacio del Reto + Revisión/Autoevaluación + Celebración -- base literal:
 * code.html real de Stitch (bloque_4_y_5_dashboard_y_ruta_formativa,
 * Section 17: screen-challenge; Section 19: screen-celebration; y
 * revisi_n_del_reto_y_autoevaluaci_n: screen-review). Fase 0: no hay
 * GPT-4o real todavia, el "preview de output IA" es una simulacion.
 *
 * A diferencia del Stitch original de revisión (que comparaba una
 * propuesta ficticia sobre la Revolución Industrial contra sugerencias de
 * IA inventadas y regalaba "+500 XP" fijos), aquí la tarjeta "Tu
 * Propuesta" muestra el prompt REAL que el docente escribió, "Optimización
 * IA" reutiliza el mismo feedback simulado ya generado en el área de
 * trabajo, y el XP mostrado es el valor REAL del badge de la fase
 * (BADGES[...].puntos). Además, otorgar el badge y marcar la fase como
 * completada ahora depende de que el docente complete su autoevaluación
 * real (calificación de 1-5 estrellas + checkbox), no de un timeout
 * automático.
 *
 * Bug real encontrado por el usuario (2026-07-23): "feedbackIA" era un
 * string fijo ("Excelente enfoque...") sin importar lo que se escribiera
 * -- probó con texto sin sentido ("xczvgzdfsbgzdfgdf") y la
 * retroalimentación seguía elogiándolo. Reemplazado por
 * generarFeedbackIA() (src/lib/rutas/feedback.ts), que aplica una
 * heurística simple (sin NLP real, pero honesta al respecto en sus
 * comentarios) para distinguir texto que no parece un prompt, uno muy
 * corto, uno largo sin los elementos clave de la fase, y uno que sí los
 * tiene.
 */

/**
 * Ampliado (jul 2026): la ruta paso de tener siempre 3 fases fijas a 4-5
 * modulos segun el nivel real del docente (ver MODULOS_POR_NIVEL en
 * scoring.ts). Estos 2 mapas ahora cubren los 7 modulos posibles, no solo
 * los 3 originales -- si un modulo nuevo llegara sin entrada aqui, el
 * fallback a TEORIA_POR_FASE.Explorar de mas abajo evitaria un crash, pero
 * mostraria contenido equivocado, asi que se completaron todos.
 */
const BADGE_POR_FASE: Record<string, string> = {
  Fundamentos: "fase-fundamentos",
  Explorar: "fase-explorar",
  Aplicar: "fase-aplicar",
  Integrar: "fase-integrar",
  Evaluar: "fase-evaluar",
  Liderar: "fase-liderar",
  Innovar: "fase-innovar",
};

const TEORIA_POR_FASE: Record<string, { titulo: string; parrafo: string; tips: string[] }> = {
  Fundamentos: {
    titulo: "Teoría esencial: Antes de tu primer prompt",
    parrafo:
      "Un modelo de lenguaje no \"sabe\" nada con certeza -- predice la palabra más probable dada tu instrucción. Por eso puede sonar muy segura y aun así estar equivocada (una \"alucinación\").",
    tips: [
      "Pídele siempre que sea concreta: mientras más vago tu pedido, más genérica (o inventada) la respuesta.",
      "Verifica cualquier dato, cifra o cita antes de usarla con tus estudiantes.",
    ],
  },
  Explorar: {
    titulo: "Teoría esencial: Primeros prompts",
    parrafo:
      "Un buen prompt exploratorio define claramente el rol de la IA, el contexto de tu aula y el resultado que esperas.",
    tips: [
      'Define el rol: "Actúa como un especialista en didáctica..."',
      "Da contexto: nivel, materia, tamaño del grupo.",
    ],
  },
  Aplicar: {
    titulo: "Teoría esencial: Prompts de personalización",
    parrafo:
      "La personalización efectiva requiere tres elementos: contexto del estudiante, objetivo de aprendizaje y restricciones de formato.",
    tips: [
      'Define el rol: "Actúa como un psicopedagogo..."',
      'Sube o baja la dificultad: "Adapta este texto para un nivel..."',
    ],
  },
  Integrar: {
    titulo: "Teoría esencial: Prompts para tu rutina semanal",
    parrafo:
      "Integrar de verdad significa reutilizar: en vez de escribir un prompt distinto cada vez, guarda y ajusta los que ya te funcionaron para planeación, retroalimentación o comunicación con estudiantes.",
    tips: [
      "Guarda tus prompts que sí funcionaron -- reutilizarlos ahorra más tiempo que escribir uno nuevo cada vez.",
      "Fíjate una tarea semanal fija donde siempre uses IA (por ejemplo, el borrador de tu planeación).",
    ],
  },
  Evaluar: {
    titulo: "Teoría esencial: Prompts de evaluación",
    parrafo:
      "Para evaluar con IA, encadena instrucciones: primero pide criterios, luego pide retroalimentación específica por estudiante.",
    tips: [
      "Pide una rúbrica antes de pedir la evaluación en sí.",
      "Solicita siempre retroalimentación accionable, no solo una nota.",
    ],
  },
  Liderar: {
    titulo: "Teoría esencial: Prompts para explicarle a otros",
    parrafo:
      "Enseñar a un/a colega es distinto a usar algo tú mismo/a: necesitas poder explicar el prompt paso a paso, no solo el resultado final.",
    tips: [
      'Pide a la IA que te ayude a explicar un prompt "como si se lo enseñaras a alguien que nunca usó esto".',
      "Documenta el prompt exacto que funcionó, no solo la idea general -- así otros pueden reutilizarlo tal cual.",
    ],
  },
  Innovar: {
    titulo: "Teoría esencial: Prompts para casos poco comunes",
    parrafo:
      "Los usos más innovadores de IA (simulaciones, generación dinámica de casos, asistencia de investigación) requieren prompts más largos y con más restricciones explícitas que los prompts básicos.",
    tips: [
      "Divide una tarea compleja en varios prompts encadenados en vez de uno solo gigante.",
      "Pide siempre una justificación de la respuesta, no solo el resultado -- te ayuda a detectar errores sutiles.",
    ],
  },
};

/**
 * Pregunta de reflexión corta por módulo -- actividad nueva (jul 2026,
 * pedido explícito del usuario: "necesitamos mas consistencia... mas
 * carne para el docente"). A diferencia del reto (que evalúa un prompt
 * escrito con una heurística), la reflexión no se "corrige": es un
 * espacio real para que el docente piense por escrito, se guarda tal
 * cual la escribió (ver REFLEXION_KEY más abajo) y se marca completa
 * cuando el docente decide que ya terminó de escribirla.
 */
const REFLEXION_POR_FASE: Record<string, string> = {
  Fundamentos:
    "¿Qué fue lo que más te sorprendió sobre cómo funciona la IA? Escríbelo en 2-3 líneas.",
  Explorar:
    "Después de probar una herramienta de IA, ¿qué tarea concreta de tu semana te ahorraría más tiempo si la usaras ahí?",
  Aplicar:
    "¿Qué parte de tu prompt tuviste que ajustar más de una vez? ¿Qué aprendiste de eso?",
  Integrar:
    "De las tareas donde probaste IA esta semana, ¿cuál vas a seguir usando y cuál no? ¿Por qué?",
  Evaluar:
    "¿Hubo algo en la retroalimentación o rúbrica generada con IA con lo que no estuviste de acuerdo? ¿Qué cambiarías?",
  Liderar:
    "¿A qué colega le mostrarías primero lo que aprendiste, y por qué a esa persona en particular?",
  Innovar:
    "¿Qué uso de IA en tu materia todavía te parece arriesgado o poco probado? ¿Qué necesitarías ver para confiar en él?",
};

/**
 * Ejemplo de prompt concreto y listo para adaptar, por fase -- pedido
 * explícito del usuario (2026-07-28): "crea un prompt y no sé" -- sin un
 * punto de partida concreto, el área de trabajo era una caja en blanco
 * con el mismo placeholder genérico ("Escribe tu prompt aquí...") en
 * cualquier fase, lo que hacía que la actividad se sintiera igual módulo
 * tras módulo aunque la teoría/reflexión/recursos sí variaran. Cada
 * ejemplo usa la materia real del docente y es específico del objetivo
 * de esa fase (no intercambiable con otra), y se puede insertar con un
 * click ("Usar este ejemplo") en vez de forzar a escribir desde cero.
 */
const EJEMPLO_PROMPT_POR_FASE: Record<string, (materia: string) => string> = {
  Fundamentos: (materia) =>
    `Actúa como un asistente educativo. Explícame en lenguaje simple qué es un modelo de lenguaje como tú, y dame un ejemplo de un error ("alucinación") que podrías cometer si te pregunto algo sobre ${materia}.`,
  Explorar: (materia) =>
    `Actúa como un especialista en ${materia}. Dame 3 ideas breves para explicar el tema de mi próxima clase a mis estudiantes, en un tono cercano y con un ejemplo cotidiano en cada una.`,
  Aplicar: (materia) =>
    `Actúa como un psicopedagogo especializado en ${materia}. Adapta el siguiente texto para un estudiante con [describe la necesidad -- ej. dificultad de lectura]: "[pega aquí tu texto]". Usa lenguaje simple y formato de lista corta.`,
  Integrar: (materia) =>
    `Actúa como mi asistente de planeación semanal para ${materia}. Con estos 3 temas de la semana: [tema 1, tema 2, tema 3], dame un borrador corto de actividad para cada uno.`,
  Evaluar: (materia) =>
    `Actúa como un especialista en evaluación educativa. Dame primero una rúbrica de 4 criterios para calificar un trabajo de ${materia} sobre [tema], y en un segundo momento úsala para dar retroalimentación a este trabajo: "[pega aquí el trabajo]".`,
  Liderar: (materia) =>
    `Ayúdame a explicarle a un/a colega de ${materia} que nunca usó IA cómo escribir su primer prompt, paso a paso y con un ejemplo simple, sin jerga técnica.`,
  Innovar: (materia) =>
    `Actúa como diseñador de evaluaciones para ${materia}. Genera un caso o escenario poco común (no un examen tradicional) donde un estudiante tenga que aplicar lo aprendido, con 2 variantes del mismo caso.`,
};

/** XP que se otorga (una sola vez por actividad) al completar la reflexión o marcar un recurso como hecho. */
const XP_ACTIVIDAD_CHICA = 5;

const REFLEXION_STORAGE_PREFIX = "professor-ai:reflexion:";

/** Icono + etiqueta por tipo de recurso sugerido (ver RecursoSugerido en session.tsx). */
const ICONO_POR_TIPO_RECURSO: Record<string, string> = {
  video: "play_circle",
  lectura: "article",
  libro: "menu_book",
  consulta: "forum",
};

const ETIQUETA_TIPO_RECURSO: Record<string, string> = {
  video: "Video",
  lectura: "Lectura",
  libro: "Libro",
  consulta: "Consulta",
};

export default function RetoPage() {
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    progresoRutas,
    actualizarProgresoFase,
    otorgarBadge,
    sumarPuntos,
    cargando,
  } = useSession();
  const [prompt, setPrompt] = useState("");
  const [estado, setEstado] = useState<"editando" | "procesando" | "revision">("editando");
  const [calificacion, setCalificacion] = useState(0);
  const [marcadoCompleto, setMarcadoCompleto] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [celebracion, setCelebracion] = useState(false);
  const [puntosGanados, setPuntosGanados] = useState(0);
  // Reflexion (actividad nueva, jul 2026): texto libre por modulo,
  // guardado en localStorage (no en Supabase -- es una libreta personal,
  // no un dato que otras pantallas necesiten leer). Se hidrata en un
  // useEffect para evitar leer localStorage durante el render inicial.
  const [reflexionTexto, setReflexionTexto] = useState("");
  const [reflexionHidratada, setReflexionHidratada] = useState(false);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  const faseActualId = resultadoTmaid?.rutaPersonalizada.find(
    (f) => progresoRutas[f.fase] !== "completado"
  )?.fase;

  useEffect(() => {
    if (!faseActualId) return;
    const guardada = window.localStorage.getItem(`${REFLEXION_STORAGE_PREFIX}${faseActualId}`);
    setReflexionTexto(guardada ?? "");
    setReflexionHidratada(true);
  }, [faseActualId]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const fases = resultadoTmaid.rutaPersonalizada;
  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const faseActual = fases[indiceActivo] ?? fases[fases.length - 1];
  const teoria = TEORIA_POR_FASE[faseActual.fase] ?? TEORIA_POR_FASE.Explorar;
  const hayMasFases = indiceActivo >= 0 && indiceActivo < fases.length - 1;
  const badgeId = BADGE_POR_FASE[faseActual.fase];
  const badge = badgeId ? BADGES[badgeId] : null;
  const xpDisponible = badge?.puntos ?? 10;
  const feedbackIA = generarFeedbackIA(prompt, faseActual.fase, teoria.tips);
  const promptEjemplo = (
    EJEMPLO_PROMPT_POR_FASE[faseActual.fase] ?? EJEMPLO_PROMPT_POR_FASE.Explorar
  )(perfil.materia);

  const preguntaReflexion = REFLEXION_POR_FASE[faseActual.fase];
  const claveReflexion = `${faseActual.fase}::reflexion`;
  const reflexionCompleta = progresoRutas[claveReflexion] === "completado";
  const recursos = faseActual.recursos ?? [];
  const claveRecurso = (i: number) => `${faseActual.fase}::recurso-${i}`;
  const recursoCompleto = (i: number) => progresoRutas[claveRecurso(i)] === "completado";
  const actividadesTotal = 1 + (preguntaReflexion ? 1 : 0) + recursos.length;
  const actividadesHechas =
    (progresoRutas[faseActual.fase] === "completado" ? 1 : 0) +
    (reflexionCompleta ? 1 : 0) +
    recursos.filter((_, i) => recursoCompleto(i)).length;

  function guardarReflexion() {
    if (!reflexionTexto.trim()) return;
    window.localStorage.setItem(`${REFLEXION_STORAGE_PREFIX}${faseActual.fase}`, reflexionTexto);
    if (!reflexionCompleta) {
      actualizarProgresoFase(claveReflexion, "completado");
      sumarPuntos(XP_ACTIVIDAD_CHICA);
    }
  }

  function alternarRecurso(i: number) {
    const yaCompleto = recursoCompleto(i);
    actualizarProgresoFase(claveRecurso(i), yaCompleto ? "pendiente" : "completado");
    if (!yaCompleto) sumarPuntos(XP_ACTIVIDAD_CHICA);
  }

  function enviar() {
    if (!prompt.trim() || estado !== "editando") return;
    setEstado("procesando");
    // Bug real encontrado en auditoria (2026-07-23): "en_progreso" existe
    // como estado de EstadoFase y /rutas/page.tsx ya tenia logica para
    // mostrar una barra al 65% cuando una fase esta "en_progreso" (vs 25%
    // si no) -- pero ningun lugar del codigo llamaba nunca
    // actualizarProgresoFase(fase, "en_progreso"), asi que esa rama nunca
    // se activaba y la barra de la fase activa mostraba siempre el mismo
    // 25%, sin importar cuanto hubiera avanzado el docente. Marcar
    // "en_progreso" aqui (cuando el docente ya envio una propuesta real,
    // no solo abrio la pantalla) hace que ese indicador refleje avance de
    // verdad.
    actualizarProgresoFase(faseActual.fase, "en_progreso");
    setTimeout(() => {
      setEstado("revision");
    }, 1500);
  }

  function confirmar() {
    if (calificacion === 0) {
      setErrorValidacion("Selecciona una calificación antes de continuar.");
      return;
    }
    if (!marcadoCompleto) {
      setErrorValidacion("Marca el reto como completado para ganar los puntos XP.");
      return;
    }
    setErrorValidacion(null);
    actualizarProgresoFase(faseActual.fase, "completado");
    const gano = badgeId ? otorgarBadge(badgeId) : false;
    setPuntosGanados(gano && badge ? badge.puntos : xpDisponible);
    setCelebracion(true);
  }

  if (celebracion) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-on-secondary-fixed px-6 text-center">
        <Confetti />
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-tertiary-container opacity-40 blur-[80px]" />
          <Icon
            name="emoji_events"
            filled
            className="relative z-10 text-[160px] text-tertiary-fixed-dim"
          />
        </div>
        <h2 className="font-headline text-4xl font-black mb-2 text-white">¡EXCELENTE TRABAJO!</h2>
        <p className="font-headline text-xl font-bold mb-8 text-tertiary-fixed-dim">
          +{puntosGanados} XP GANADOS
        </p>
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => router.push(hayMasFases ? "/rutas" : "/dashboard")}
            className="w-full rounded-full bg-tertiary-container py-4 text-base font-bold text-on-tertiary-fixed transition-transform hover:scale-105"
          >
            {hayMasFases ? "PRÓXIMO RETO" : "IR AL INICIO"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full font-bold text-white/60 transition-colors hover:text-white"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (estado === "revision") {
    return (
      <div className="min-h-screen bg-surface pb-32 pt-8">
        <div className="mx-auto max-w-5xl space-y-gap-xl px-margin-mobile">
          <div>
            <div className="mb-4 flex items-center gap-md">
              <span className="text-[12px] font-bold uppercase text-on-tertiary-fixed rounded-full bg-tertiary-fixed px-3 py-1">
                Reto {indiceActivo + 1} de {fases.length}
              </span>
              <span className="text-sm text-on-surface-variant">
                Fase: {faseActual.fase}
              </span>
            </div>
            <h2 className="font-headline text-3xl font-black sm:text-4xl mb-2 text-primary">
              Revisión del Reto
            </h2>
            <p className="text-lg max-w-2xl text-on-surface-variant">
              Compara tu propuesta con la retroalimentación de la IA y evalúa tu experiencia
              para avanzar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-gap-xl md:grid-cols-2">
            <div className="atmospheric-shadow rounded-xl bg-surface-container-lowest p-8">
              <div className="mb-6 flex items-center gap-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <Icon name="edit_note" />
                </div>
                <h3 className="font-headline text-xl font-bold">Tu Propuesta</h3>
              </div>
              <p className="text-base whitespace-pre-wrap leading-relaxed text-on-surface-variant">
                {prompt}
              </p>
            </div>

            <div className="atmospheric-shadow rounded-xl bg-primary-container p-8 text-on-primary-container">
              <div className="mb-6 flex items-center gap-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                  <Icon name="auto_awesome" filled />
                </div>
                <h3 className="font-headline text-xl font-bold text-white">
                  Retroalimentación IA
                </h3>
              </div>
              <p className="text-base leading-relaxed text-blue-100">{feedbackIA}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gap-xl lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl bg-surface-container-high p-8">
              <h4 className="font-headline text-xl font-bold mb-6">Autoevaluación</h4>
              <div className="flex flex-col justify-between gap-lg md:flex-row md:items-center">
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">
                    ¿Qué tan útil te ha parecido la retroalimentación de la IA para tu
                    práctica docente?
                  </p>
                  <div className="flex gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setCalificacion(n);
                          setErrorValidacion(null);
                        }}
                        className="transition-transform hover:scale-110"
                        aria-label={`Calificar con ${n} estrella(s)`}
                      >
                        <Icon
                          name="star"
                          filled={n <= calificacion}
                          className={`text-[40px] ${
                            n <= calificacion ? "text-tertiary-container" : "text-outline"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-md rounded-xl bg-white p-4 shadow-sm">
                  <input
                    type="checkbox"
                    checked={marcadoCompleto}
                    onChange={(e) => {
                      setMarcadoCompleto(e.target.checked);
                      setErrorValidacion(null);
                    }}
                    className="h-6 w-6 cursor-pointer rounded border-outline-variant text-secondary focus:ring-secondary"
                  />
                  <span className="font-label text-xs font-bold cursor-pointer">
                    Marcar como completado
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-md">
              <button
                onClick={confirmar}
                className="font-headline text-lg font-bold group relative overflow-hidden rounded-full bg-primary px-10 py-6 text-on-primary transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Confirmar y ganar XP
                  <Icon
                    name="rocket_launch"
                    className="transition-transform group-hover:translate-x-2"
                  />
                </span>
              </button>
              <p className="text-center text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                +{xpDisponible} XP disponibles
              </p>
              {errorValidacion && (
                <p className="text-center text-sm font-semibold text-error">
                  {errorValidacion}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16 pt-8">
      <div className="mx-auto max-w-4xl space-y-gap-xl px-margin-mobile">
        <div className="flex items-center justify-between rounded-xl bg-tertiary-container/10 p-4">
          <button
            onClick={() => router.push("/rutas")}
            className="flex items-center gap-2 font-bold text-on-primary-fixed"
          >
            <Icon name="arrow_back" /> Atrás
          </button>
          <span className="font-bold uppercase tracking-widest text-tertiary-container">
            Módulo {indiceActivo + 1} de {fases.length}
          </span>
          <div className="w-10" />
        </div>

        {/* Resumen de actividades del modulo -- ampliado (jul 2026): antes
            cada modulo tenia una sola actividad (el reto); ahora hay hasta
            4 (reto + reflexion + recursos marcables), asi que este chip le
            deja claro al docente cuanto hay por hacer aqui, no solo el
            reto. */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-secondary transition-all"
              style={{
                width: `${actividadesTotal > 0 ? (actividadesHechas / actividadesTotal) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            {actividadesHechas}/{actividadesTotal} actividades de este módulo
          </span>
        </div>

        <details className="group overflow-hidden rounded-xl bg-surface-container-low">
          <summary className="flex list-none cursor-pointer items-center justify-between p-6 font-bold text-on-primary-fixed">
            <span>📚 {teoria.titulo}</span>
            <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 px-6 pb-6 text-on-surface-variant">
            <p>{teoria.parrafo}</p>
            <ul className="list-disc space-y-2 pl-5">
              {teoria.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </details>

        <div className="atmospheric-shadow rounded-xl bg-tertiary-fixed p-6 text-on-tertiary-fixed">
          <h3 className="font-headline text-xl font-bold mb-2">TU DESAFÍO</h3>
          <p className="text-lg">{faseActual.descripcion}</p>
        </div>

        <div className="grid h-auto grid-cols-1 gap-lg lg:h-[500px] lg:grid-cols-2">
          <div className="atmospheric-shadow flex flex-col gap-md rounded-xl bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-secondary">Actividad 1 · Área de Trabajo</span>
            </div>
            {estado === "editando" && !prompt.trim() && (
              <div className="rounded-xl bg-tertiary-fixed/40 p-4">
                <p className="text-xs mb-2 font-bold uppercase tracking-widest text-on-tertiary-fixed">
                  💡 ¿No sabes por dónde empezar? Un ejemplo para esta fase:
                </p>
                <p className="text-sm mb-3 italic text-on-tertiary-fixed">{promptEjemplo}</p>
                <button
                  type="button"
                  onClick={() => setPrompt(promptEjemplo)}
                  className="text-xs font-bold uppercase tracking-widest text-secondary underline"
                >
                  Usar este ejemplo
                </button>
              </div>
            )}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={estado !== "editando"}
              placeholder="Escribe tu prompt aquí..."
              className="text-sm flex-grow rounded-xl border-none bg-surface-container-lowest p-4 font-mono focus:ring-2 focus:ring-secondary/20"
            />
            <button
              onClick={enviar}
              disabled={!prompt.trim() || estado !== "editando"}
              className="animate-pulse-subtle flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:animate-none disabled:opacity-50"
            >
              {estado === "procesando" ? (
                <>
                  <Icon name="autorenew" className="animate-spin" /> PROCESANDO...
                </>
              ) : (
                <>
                  ENVIAR Y COMPLETAR RETO <Icon name="send" />
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-md overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-on-secondary-fixed/5 p-6">
            <span className="flex items-center gap-2 font-bold text-on-surface-variant">
              <Icon name="preview" /> Preview de Output IA
            </span>
            <div className="flex-grow space-y-4 overflow-y-auto">
              {estado === "editando" && (
                <div className="flex h-full items-center justify-center italic text-on-surface-variant opacity-30">
                  Esperando tu prompt para generar el resultado...
                </div>
              )}
              {estado === "procesando" && (
                <>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-surface-container-highest" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actividad 2: Reflexion -- nueva (jul 2026). A diferencia del
            reto, esto no se evalua con ninguna heuristica: es un espacio
            para que el docente escriba y piense, se guarda tal cual en
            localStorage y se marca completa cuando el/ella decide que ya
            terminó. */}
        {preguntaReflexion && (
          <div className="atmospheric-shadow rounded-xl bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-bold text-primary">
                <Icon name="self_improvement" className="text-[18px]" /> Actividad 2 · Reflexión
              </h4>
              {reflexionCompleta && (
                <span className="flex items-center gap-1 text-[11px] font-black uppercase text-secondary">
                  <Icon name="check_circle" filled className="text-[16px]" /> Hecha
                </span>
              )}
            </div>
            <p className="text-sm mb-3 text-on-surface-variant">{preguntaReflexion}</p>
            <textarea
              value={reflexionTexto}
              onChange={(e) => setReflexionTexto(e.target.value)}
              disabled={!reflexionHidratada}
              placeholder="Escribe tu reflexión aquí..."
              rows={3}
              className="text-sm mb-3 w-full rounded-xl border-none bg-surface-container-lowest p-4 focus:ring-2 focus:ring-secondary/20"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={guardarReflexion}
                disabled={!reflexionTexto.trim() || !reflexionHidratada}
                className="rounded-full bg-secondary px-6 py-2 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {reflexionCompleta ? "Actualizar reflexión" : "Guardar reflexión"}
              </button>
              {!reflexionCompleta && (
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  +{XP_ACTIVIDAD_CHICA} XP
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actividades 3+: recursos marcables -- antes eran solo texto
            decorativo ("para complementar"); ahora cada uno es un check
            real que suma XP la primera vez, para que se sientan parte de
            las actividades del modulo y no un anexo. */}
        {recursos.length > 0 && (
          <div className="atmospheric-shadow rounded-xl bg-white p-6">
            <h4 className="mb-1 flex items-center gap-2 font-bold text-primary">
              <Icon name="explore" className="text-[18px]" /> Actividades 3-{2 + recursos.length}{" "}
              · Para complementar este módulo
            </h4>
            <p className="text-sm mb-4 text-on-surface-variant">
              Sugerencias de tema, no un link específico -- tú eliges qué video, artículo o
              persona concreta te sirve más. Márcalo cuando lo hagas.
            </p>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
              {recursos.map((r, i) => {
                const hecho = recursoCompleto(i);
                return (
                  <button
                    key={i}
                    onClick={() => alternarRecurso(i)}
                    className={`flex items-start gap-3 rounded-xl p-4 text-left transition-colors ${
                      hecho ? "bg-secondary-container/30" : "bg-surface-container-low hover:bg-surface-container"
                    }`}
                  >
                    <Icon
                      name={hecho ? "check_circle" : ICONO_POR_TIPO_RECURSO[r.tipo] ?? "lightbulb"}
                      filled={hecho}
                      className={`mt-0.5 text-[20px] ${hecho ? "text-secondary" : "text-secondary/70"}`}
                    />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-secondary">
                        {ETIQUETA_TIPO_RECURSO[r.tipo] ?? r.tipo}
                        {!hecho && ` · +${XP_ACTIVIDAD_CHICA} XP`}
                      </span>
                      <p className="text-sm mt-1 text-on-surface-variant">{r.sugerencia}</p>
                      <span className="mt-1 block text-[11px] font-bold text-secondary">
                        {hecho ? "Marcado como hecho" : "Marcar como hecho"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
