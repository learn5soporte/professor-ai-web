"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { generarFeedbackIA } from "@/lib/rutas/feedback";
import { Icon } from "@/components/Icon";
import { Confetti } from "@/components/Confetti";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import { tpl, type Idioma } from "@/lib/i18n/traducciones";
import { etiquetaFase, localizarValorPerfil } from "@/lib/i18n/valores";
import { localizarResultadoTmaid } from "@/lib/tmaid/scoring";

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
 * generarFeedbackIA() (src/lib/rutas/feedback.ts).
 */

/**
 * Ampliado (jul 2026): la ruta paso de tener siempre 3 fases fijas a 4-5
 * modulos segun el nivel real del docente (ver MODULOS_POR_NIVEL en
 * scoring.ts). Estos mapas cubren los 7 modulos posibles. Fase i18n: la
 * teoría/reflexión/ejemplos existen en ES y EN, indexados por el idioma
 * activo; las claves de fase siguen en español (canónicas).
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

const TEORIA_POR_FASE: Record<
  Idioma,
  Record<string, { titulo: string; parrafo: string; tips: string[] }>
> = {
  es: {
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
  },
  en: {
    Fundamentos: {
      titulo: "Essential theory: Before your first prompt",
      parrafo:
        "A language model doesn't \"know\" anything with certainty -- it predicts the most likely word given your instruction. That's why it can sound very confident and still be wrong (a \"hallucination\").",
      tips: [
        "Always ask it to be specific: the vaguer your request, the more generic (or made-up) the answer.",
        "Verify any fact, figure or quote before using it with your students.",
      ],
    },
    Explorar: {
      titulo: "Essential theory: First prompts",
      parrafo:
        "A good exploratory prompt clearly defines the AI's role, your classroom context and the result you expect.",
      tips: [
        'Define the role: "Act as a didactics specialist..."',
        "Give context: level, subject, group size.",
      ],
    },
    Aplicar: {
      titulo: "Essential theory: Personalization prompts",
      parrafo:
        "Effective personalization requires three elements: student context, learning objective and format constraints.",
      tips: [
        'Define the role: "Act as an educational psychologist..."',
        'Raise or lower the difficulty: "Adapt this text for a level..."',
      ],
    },
    Integrar: {
      titulo: "Essential theory: Prompts for your weekly routine",
      parrafo:
        "Truly integrating means reusing: instead of writing a different prompt each time, save and adjust the ones that already worked for planning, feedback or student communication.",
      tips: [
        "Save the prompts that worked -- reusing them saves more time than writing a new one each time.",
        "Set a fixed weekly task where you always use AI (for example, the draft of your lesson plan).",
      ],
    },
    Evaluar: {
      titulo: "Essential theory: Assessment prompts",
      parrafo:
        "To assess with AI, chain your instructions: first ask for criteria, then ask for specific feedback per student.",
      tips: [
        "Ask for a rubric before asking for the assessment itself.",
        "Always request actionable feedback, not just a grade.",
      ],
    },
    Liderar: {
      titulo: "Essential theory: Prompts for explaining to others",
      parrafo:
        "Teaching a colleague is different from using something yourself: you need to be able to explain the prompt step by step, not just the final result.",
      tips: [
        'Ask the AI to help you explain a prompt "as if you were teaching it to someone who has never used this".',
        "Document the exact prompt that worked, not just the general idea -- that way others can reuse it as is.",
      ],
    },
    Innovar: {
      titulo: "Essential theory: Prompts for uncommon cases",
      parrafo:
        "The most innovative AI uses (simulations, dynamic case generation, research assistance) require longer prompts with more explicit constraints than basic prompts.",
      tips: [
        "Split a complex task into several chained prompts instead of one giant prompt.",
        "Always ask for a justification of the answer, not just the result -- it helps you catch subtle errors.",
      ],
    },
  },
};

/**
 * Pregunta de reflexión corta por módulo -- actividad nueva (jul 2026).
 * A diferencia del reto, la reflexión no se "corrige": se guarda tal
 * cual el docente la escribió y se marca completa cuando decide que
 * terminó.
 */
const REFLEXION_POR_FASE: Record<Idioma, Record<string, string>> = {
  es: {
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
  },
  en: {
    Fundamentos:
      "What surprised you the most about how AI works? Write it down in 2-3 lines.",
    Explorar:
      "After trying an AI tool, which specific task of your week would save you the most time if you used it there?",
    Aplicar:
      "Which part of your prompt did you have to adjust more than once? What did you learn from that?",
    Integrar:
      "Of the tasks where you tried AI this week, which one will you keep using and which not? Why?",
    Evaluar:
      "Was there anything in the AI-generated feedback or rubric you disagreed with? What would you change?",
    Liderar:
      "Which colleague would you show what you learned first, and why that person in particular?",
    Innovar:
      "Which AI use in your subject still feels risky or unproven to you? What would you need to see to trust it?",
  },
};

/**
 * Ejemplo de prompt concreto y listo para adaptar, por fase -- pedido
 * explícito del usuario (2026-07-28). Cada ejemplo usa la materia real del
 * docente y es específico del objetivo de esa fase, y se puede insertar
 * con un click ("Usar este ejemplo") en vez de forzar a escribir desde
 * cero.
 */
const EJEMPLO_PROMPT_POR_FASE: Record<
  Idioma,
  Record<string, (materia: string) => string>
> = {
  es: {
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
  },
  en: {
    Fundamentos: (materia) =>
      `Act as an educational assistant. Explain to me in simple language what a language model like you is, and give me an example of a mistake ("hallucination") you could make if I asked you something about ${materia}.`,
    Explorar: (materia) =>
      `Act as a ${materia} specialist. Give me 3 brief ideas to explain my next lesson's topic to my students, in a friendly tone and with an everyday example in each one.`,
    Aplicar: (materia) =>
      `Act as an educational psychologist specialized in ${materia}. Adapt the following text for a student with [describe the need -- e.g. reading difficulty]: "[paste your text here]". Use simple language and a short list format.`,
    Integrar: (materia) =>
      `Act as my weekly planning assistant for ${materia}. With these 3 topics for the week: [topic 1, topic 2, topic 3], give me a short activity draft for each one.`,
    Evaluar: (materia) =>
      `Act as an educational assessment specialist. First give me a 4-criteria rubric to grade a ${materia} assignment on [topic], and then use it to give feedback on this work: "[paste the work here]".`,
    Liderar: (materia) =>
      `Help me explain to a ${materia} colleague who has never used AI how to write their first prompt, step by step and with a simple example, without technical jargon.`,
    Innovar: (materia) =>
      `Act as an assessment designer for ${materia}. Generate an uncommon case or scenario (not a traditional exam) where a student has to apply what they learned, with 2 variants of the same case.`,
  },
};

/** XP que se otorga (una sola vez por actividad) al completar la reflexión o marcar un recurso como hecho. */
const XP_ACTIVIDAD_CHICA = 5;

const REFLEXION_STORAGE_PREFIX = "professor-ai:reflexion:";

/** Icono por tipo de recurso sugerido (ver RecursoSugerido en session.tsx). */
const ICONO_POR_TIPO_RECURSO: Record<string, string> = {
  video: "play_circle",
  lectura: "article",
  libro: "menu_book",
  consulta: "forum",
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
  const { idioma, t } = useIdioma();
  const [prompt, setPrompt] = useState("");
  const [estado, setEstado] = useState<"editando" | "procesando" | "revision">("editando");
  const [calificacion, setCalificacion] = useState(0);
  const [marcadoCompleto, setMarcadoCompleto] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<null | "calificacion" | "marcar">(null);
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

  const resultado = localizarResultadoTmaid(resultadoTmaid, perfil, idioma);
  const fases = resultado.rutaPersonalizada;
  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const faseActual = fases[indiceActivo] ?? fases[fases.length - 1];
  const teoria = TEORIA_POR_FASE[idioma][faseActual.fase] ?? TEORIA_POR_FASE[idioma].Explorar;
  const hayMasFases = indiceActivo >= 0 && indiceActivo < fases.length - 1;
  const badgeId = BADGE_POR_FASE[faseActual.fase];
  const badge = badgeId ? BADGES[badgeId] : null;
  const xpDisponible = badge?.puntos ?? 10;
  const feedbackIA = generarFeedbackIA(prompt, faseActual.fase, teoria.tips, idioma);
  const materiaVisible = localizarValorPerfil(perfil.materia, idioma);
  const promptEjemplo = (
    EJEMPLO_PROMPT_POR_FASE[idioma][faseActual.fase] ?? EJEMPLO_PROMPT_POR_FASE[idioma].Explorar
  )(materiaVisible);

  const etiquetaTipoRecurso: Record<string, string> = {
    video: t.rutas.tipoVideo,
    lectura: t.rutas.tipoLectura,
    libro: t.rutas.tipoLibro,
    consulta: t.rutas.tipoConsulta,
  };

  const preguntaReflexion = REFLEXION_POR_FASE[idioma][faseActual.fase];
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
    // se activaba. Marcar "en_progreso" aqui (cuando el docente ya envio
    // una propuesta real) hace que ese indicador refleje avance de verdad.
    actualizarProgresoFase(faseActual.fase, "en_progreso");
    setTimeout(() => {
      setEstado("revision");
    }, 1500);
  }

  function confirmar() {
    if (calificacion === 0) {
      setErrorValidacion("calificacion");
      return;
    }
    if (!marcadoCompleto) {
      setErrorValidacion("marcar");
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
        <h2 className="font-headline text-4xl font-black mb-2 text-white">{t.rutas.excelente}</h2>
        <p className="font-headline text-xl font-bold mb-8 text-tertiary-fixed-dim">
          {tpl(t.rutas.xpGanados, { xp: puntosGanados })}
        </p>
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => router.push(hayMasFases ? "/rutas" : "/dashboard")}
            className="w-full rounded-full bg-tertiary-container py-4 text-base font-bold text-on-tertiary-fixed transition-transform hover:scale-105"
          >
            {hayMasFases ? t.rutas.proximoReto : t.rutas.irInicio}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full font-bold text-white/60 transition-colors hover:text-white"
          >
            {t.rutas.volverInicio}
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
                {tpl(t.rutas.retoDe, { n: indiceActivo + 1, total: fases.length })}
              </span>
              <span className="text-sm text-on-surface-variant">
                {t.rutas.faseLabel} {etiquetaFase(faseActual.fase, idioma)}
              </span>
            </div>
            <h2 className="font-headline text-3xl font-black sm:text-4xl mb-2 text-primary">
              {t.rutas.revisionTitulo}
            </h2>
            <p className="text-lg max-w-2xl text-on-surface-variant">
              {t.rutas.revisionTexto}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-gap-xl md:grid-cols-2">
            <div className="atmospheric-shadow rounded-xl bg-surface-container-lowest p-8">
              <div className="mb-6 flex items-center gap-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <Icon name="edit_note" />
                </div>
                <h3 className="font-headline text-xl font-bold">{t.rutas.tuPropuesta}</h3>
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
                  {t.rutas.retroIA}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-blue-100">{feedbackIA}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gap-xl lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl bg-surface-container-high p-8">
              <h4 className="font-headline text-xl font-bold mb-6">{t.rutas.autoevaluacion}</h4>
              <div className="flex flex-col justify-between gap-lg md:flex-row md:items-center">
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">
                    {t.rutas.utilPregunta}
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
                        aria-label={tpl(t.rutas.calificarAria, { n })}
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
                    {t.rutas.marcarCompletado}
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
                  {t.rutas.confirmarXP}
                  <Icon
                    name="rocket_launch"
                    className="transition-transform group-hover:translate-x-2"
                  />
                </span>
              </button>
              <p className="text-center text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                {tpl(t.rutas.xpDisponibles, { xp: xpDisponible })}
              </p>
              {errorValidacion && (
                <p className="text-center text-sm font-semibold text-error">
                  {errorValidacion === "calificacion"
                    ? t.rutas.errorCalificacion
                    : t.rutas.errorMarcar}
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
            <Icon name="arrow_back" /> {t.comun.atras}
          </button>
          <span className="font-bold uppercase tracking-widest text-tertiary-container">
            {tpl(t.rutas.moduloDe, { n: indiceActivo + 1, total: fases.length })}
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
            {tpl(t.rutas.actividadesModulo, {
              hechas: actividadesHechas,
              total: actividadesTotal,
            })}
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
          <h3 className="font-headline text-xl font-bold mb-2">{t.rutas.tuDesafio}</h3>
          <p className="text-lg">{faseActual.descripcion}</p>
        </div>

        <div className="grid h-auto grid-cols-1 gap-lg lg:h-[500px] lg:grid-cols-2">
          <div className="atmospheric-shadow flex flex-col gap-md rounded-xl bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-secondary">{t.rutas.areaTrabajo}</span>
            </div>
            {estado === "editando" && !prompt.trim() && (
              <div className="rounded-xl bg-tertiary-fixed/40 p-4">
                <p className="text-xs mb-2 font-bold uppercase tracking-widest text-on-tertiary-fixed">
                  {t.rutas.ejemploFase}
                </p>
                <p className="text-sm mb-3 italic text-on-tertiary-fixed">{promptEjemplo}</p>
                <button
                  type="button"
                  onClick={() => setPrompt(promptEjemplo)}
                  className="text-xs font-bold uppercase tracking-widest text-secondary underline"
                >
                  {t.rutas.usarEjemplo}
                </button>
              </div>
            )}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={estado !== "editando"}
              placeholder={t.rutas.escribePrompt}
              className="text-sm flex-grow rounded-xl border-none bg-surface-container-lowest p-4 font-mono focus:ring-2 focus:ring-secondary/20"
            />
            <button
              onClick={enviar}
              disabled={!prompt.trim() || estado !== "editando"}
              className="animate-pulse-subtle flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:animate-none disabled:opacity-50"
            >
              {estado === "procesando" ? (
                <>
                  <Icon name="autorenew" className="animate-spin" /> {t.rutas.procesandoMayus}
                </>
              ) : (
                <>
                  {t.rutas.enviarReto} <Icon name="send" />
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-md overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-on-secondary-fixed/5 p-6">
            <span className="flex items-center gap-2 font-bold text-on-surface-variant">
              <Icon name="preview" /> {t.rutas.previewOutput}
            </span>
            <div className="flex-grow space-y-4 overflow-y-auto">
              {estado === "editando" && (
                <div className="flex h-full items-center justify-center italic text-on-surface-variant opacity-30">
                  {t.rutas.esperandoPrompt}
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
                <Icon name="self_improvement" className="text-[18px]" /> {t.rutas.reflexionTitulo}
              </h4>
              {reflexionCompleta && (
                <span className="flex items-center gap-1 text-[11px] font-black uppercase text-secondary">
                  <Icon name="check_circle" filled className="text-[16px]" /> {t.rutas.hecha}
                </span>
              )}
            </div>
            <p className="text-sm mb-3 text-on-surface-variant">{preguntaReflexion}</p>
            <textarea
              value={reflexionTexto}
              onChange={(e) => setReflexionTexto(e.target.value)}
              disabled={!reflexionHidratada}
              placeholder={t.rutas.escribeReflexion}
              rows={3}
              className="text-sm mb-3 w-full rounded-xl border-none bg-surface-container-lowest p-4 focus:ring-2 focus:ring-secondary/20"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={guardarReflexion}
                disabled={!reflexionTexto.trim() || !reflexionHidratada}
                className="rounded-full bg-secondary px-6 py-2 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {reflexionCompleta ? t.rutas.actualizarReflexion : t.rutas.guardarReflexion}
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
              <Icon name="explore" className="text-[18px]" />{" "}
              {tpl(t.rutas.actividadesComplementar, { n: 2 + recursos.length })}
            </h4>
            <p className="text-sm mb-4 text-on-surface-variant">
              {t.rutas.sugerenciasNota}
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
                        {etiquetaTipoRecurso[r.tipo] ?? r.tipo}
                        {!hecho && ` · +${XP_ACTIVIDAD_CHICA} XP`}
                      </span>
                      <p className="text-sm mt-1 text-on-surface-variant">{r.sugerencia}</p>
                      <span className="mt-1 block text-[11px] font-bold text-secondary">
                        {hecho ? t.rutas.marcadoHecho : t.rutas.marcarHecho}
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
