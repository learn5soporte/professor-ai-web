import type { PerfilDocente, ResultadoTmaid } from "@/lib/store/session";
import { PREGUNTAS_LIKERT, type Dimension } from "./preguntas";
import type { Idioma } from "@/lib/i18n/traducciones";
import { localizarValorPerfil } from "@/lib/i18n/valores";

/**
 * Scoring TMAID — Fase 0/1: reglas simples client-side.
 * Fase 2 (según roadmap): este cálculo se conecta a un prompt estructurado
 * a GPT-4o para generar el perfil pedagógico-IA y la ruta con lenguaje
 * natural más rico; la lógica de dimensiones/nivel se mantiene igual.
 *
 * Fase i18n (jul 2026): todos los textos generados (perfilPedagogicoIA,
 * mapaBrechas, descripciones y recursos de la ruta) existen ahora en ES y
 * EN. La lógica numérica no cambia. El resultado se genera en el idioma
 * activo al momento del diagnóstico, y `localizarResultadoTmaid()` permite
 * regenerar los textos en el otro idioma a partir de los datos numéricos
 * guardados (las fases/ids/nivel se conservan en español como claves
 * canónicas -- ver src/lib/i18n/valores.ts).
 */

type Nivel = ResultadoTmaid["nivelAsignado"];

const DIMENSIONES: Dimension[] = [
  "conocimientoIA",
  "usoHerramientas",
  "integracionAula",
  "actitudCambio",
];

/**
 * Nombres de dimensiones actualizados (jul 2026), a partir del rediseño
 * visual del diagnostico en Claude Design. Este es el marco propio de
 * Learn5 (no un framework externo tipo DigCompEdu/SAMR/TPACK).
 */
const ETIQUETA_DIMENSION_I18N: Record<Idioma, Record<Dimension, string>> = {
  es: {
    conocimientoIA: "Conocimiento IA",
    usoHerramientas: "Dominio Práctico",
    integracionAula: "Integración Pedagógica",
    actitudCambio: "Apertura al Cambio",
  },
  en: {
    conocimientoIA: "AI Knowledge",
    usoHerramientas: "Practical Mastery",
    integracionAula: "Pedagogical Integration",
    actitudCambio: "Openness to Change",
  },
};

/** Compatibilidad: etiquetas en español (fuente de verdad original). */
const ETIQUETA_DIMENSION = ETIQUETA_DIMENSION_I18N.es;

export function etiquetaDimension(dim: Dimension, idioma: Idioma): string {
  return ETIQUETA_DIMENSION_I18N[idioma][dim];
}

/**
 * Consejo concreto por dimensión -- siempre se listan las 4, de la más
 * débil a la más fuerte (ver mapaBrechas).
 */
const DIMENSION_TIP: Record<Idioma, Record<Dimension, string>> = {
  es: {
    conocimientoIA:
      "aprende términos clave como \"prompt\", \"alucinación\" y \"temperatura\": te ayudan a saber cuándo confiar en una respuesta de IA y cuándo conviene verificarla.",
    usoHerramientas:
      "acota tus prompts con contexto (tema, nivel del curso, cantidad, formato) en vez de pedir algo genérico -- así obtienes resultados usables a la primera.",
    integracionAula:
      "empieza con una sola actividad piloto (por ejemplo, dar retroalimentación a un ensayo) antes de llevar IA a toda la materia.",
    actitudCambio:
      "dale 2-3 vueltas al mismo prompt antes de descartarlo -- la primera respuesta de la IA casi nunca es la definitiva.",
  },
  en: {
    conocimientoIA:
      "learn key terms like \"prompt\", \"hallucination\" and \"temperature\": they help you know when to trust an AI answer and when it's worth verifying it.",
    usoHerramientas:
      "narrow your prompts with context (topic, course level, quantity, format) instead of asking for something generic -- that way you get usable results on the first try.",
    integracionAula:
      "start with a single pilot activity (for example, giving feedback on an essay) before bringing AI into the whole subject.",
    actitudCambio:
      "give the same prompt 2-3 more tries before discarding it -- the AI's first answer is almost never the final one.",
  },
};

/**
 * Ejemplo concreto en cifras por dimensión, usado en la fase "Aplicar".
 */
const EJEMPLO_DIMENSION: Record<Idioma, Record<Dimension, string>> = {
  es: {
    conocimientoIA:
      "revisar 30 respuestas de un examen a mano puede tomarte 45 minutos; usando IA como primer filtro (y revisando tú después), baja a unos 15.",
    usoHerramientas:
      "armar una rúbrica desde cero puede tomarte 30 minutos; con el Banco de Prompts y el Creador de Rúbricas de Professor AI, ese mismo trabajo baja a 5-10 minutos.",
    integracionAula:
      "diseñar una actividad nueva con IA para tu clase puede tomarte 1 hora la primera vez; repitiéndola 2-3 veces con ajustes, baja a 15-20 minutos.",
    actitudCambio:
      "ajustar y volver a pedirle algo a la IA toma 2-3 minutos extra, pero te puede ahorrar hasta 20 minutos de trabajo manual después.",
  },
  en: {
    conocimientoIA:
      "grading 30 exam answers by hand can take you 45 minutes; using AI as a first filter (with you reviewing afterwards), it drops to about 15.",
    usoHerramientas:
      "building a rubric from scratch can take you 30 minutes; with Professor AI's Prompt Bank and Rubric Builder, that same work drops to 5-10 minutes.",
    integracionAula:
      "designing a new AI-powered activity for your class can take 1 hour the first time; repeating it 2-3 times with adjustments, it drops to 15-20 minutes.",
    actitudCambio:
      "adjusting and re-asking the AI takes 2-3 extra minutes, but it can save you up to 20 minutes of manual work later.",
  },
};

/**
 * Descripción de la fase "Explorar", variando según el nivel asignado.
 */
const EXPLORAR_POR_NIVEL: Record<Idioma, Record<Nivel, (materia: string) => string>> = {
  es: {
    Iniciante: (materia) =>
      `Antes que nada, dedica 20-30 minutos a probar una herramienta de IA (como ChatGPT o Gemini) haciendo preguntas simples sobre ${materia} -- sin buscar un resultado perfecto, solo para perder el miedo inicial.`,
    "En desarrollo": (materia) =>
      `Prueba 2-3 herramientas de IA aplicadas a ${materia} y compara qué tan útiles te resultan para tareas puntuales: resumir, generar ejemplos, dar feedback.`,
    Avanzado: (materia) =>
      `Explora funciones más avanzadas de las herramientas que ya usas (plantillas, prompts guardados) para ${materia}, buscando ahorrar más tiempo del que ya ahorras hoy.`,
    Experto: (materia) =>
      `Explora casos de uso menos comunes de IA en ${materia} -- por ejemplo, generar escenarios de evaluación o simulaciones para tus estudiantes.`,
  },
  en: {
    Iniciante: (materia) =>
      `First of all, spend 20-30 minutes trying an AI tool (like ChatGPT or Gemini) asking simple questions about ${materia} -- not chasing a perfect result, just to lose the initial fear.`,
    "En desarrollo": (materia) =>
      `Try 2-3 AI tools applied to ${materia} and compare how useful they are for specific tasks: summarizing, generating examples, giving feedback.`,
    Avanzado: (materia) =>
      `Explore more advanced features of the tools you already use (templates, saved prompts) for ${materia}, aiming to save even more time than you already do today.`,
    Experto: (materia) =>
      `Explore less common AI use cases in ${materia} -- for example, generating assessment scenarios or simulations for your students.`,
  },
};

/**
 * Descripción del módulo "Evaluar", variando por nivel.
 */
const EVALUAR_POR_NIVEL: Record<Idioma, Record<Nivel, string>> = {
  es: {
    Iniciante:
      "Cuando ya tengas algo de práctica, usa IA para tu primera rúbrica o pauta de retroalimentación -- pide primero los criterios y después la evaluación en sí, nunca las dos cosas en un solo prompt.",
    "En desarrollo":
      "Diseña una rúbrica completa con ayuda de IA y pruébala calificando 3-5 trabajos reales -- compara si el criterio se sostiene o si necesitas ajustarlo.",
    Avanzado:
      "Sistematiza tus rúbricas y prompts de evaluación en plantillas reutilizables, y cruza la retroalimentación de la IA con tu propio criterio pedagógico para detectar dónde discrepan.",
    Experto:
      "Diseña un esquema de evaluación asistido por IA para un curso completo (no solo una tarea), documentando qué automatizar y qué siempre debe pasar por tu criterio humano.",
  },
  en: {
    Iniciante:
      "Once you have some practice, use AI for your first rubric or feedback guide -- ask for the criteria first and then for the assessment itself, never both in a single prompt.",
    "En desarrollo":
      "Design a full rubric with AI's help and test it by grading 3-5 real assignments -- check whether the criteria hold up or need adjusting.",
    Avanzado:
      "Systematize your rubrics and assessment prompts into reusable templates, and cross-check the AI's feedback against your own pedagogical judgment to spot where they disagree.",
    Experto:
      "Design an AI-assisted assessment scheme for a full course (not just one assignment), documenting what to automate and what must always go through your human judgment.",
  },
};

/**
 * Descripción del módulo "Fundamentos" -- solo para el nivel Iniciante.
 */
const FUNDAMENTOS_DESC: Record<Idioma, string> = {
  es: "Antes de escribir tu primer prompt, vale la pena entender qué es (y qué NO es) la IA generativa: no \"sabe\" nada con certeza, solo predice la palabra más probable a partir de tu instrucción -- por eso puede sonar muy segura y aun así estar equivocada. Dedica 15-20 minutos a algo introductorio sobre esto antes de seguir.",
  en: "Before writing your first prompt, it's worth understanding what generative AI is (and what it is NOT): it doesn't \"know\" anything with certainty, it only predicts the most likely word based on your instruction -- which is why it can sound very confident and still be wrong. Spend 15-20 minutes on something introductory about this before moving on.",
};

/**
 * Descripción del módulo "Integrar" -- aparece en todos los niveles.
 */
const INTEGRAR_DESC: Record<Idioma, (materia: string) => string> = {
  es: (materia) =>
    `No te quedes en una sola actividad: durante al menos una semana, usa IA de forma regular en 2-3 tareas distintas de tu rutina con ${materia} (planeación, retroalimentación, comunicación con estudiantes) y anota qué te ahorró tiempo de verdad y qué no.`,
  en: (materia) =>
    `Don't stop at a single activity: for at least one week, use AI regularly in 2-3 different tasks of your ${materia} routine (planning, feedback, communicating with students) and note what actually saved you time and what didn't.`,
};

/**
 * Descripción del módulo "Liderar" -- para Avanzado/Experto.
 */
const LIDERAR_DESC: Record<Idioma, string> = {
  es: "Ya tienes práctica real -- ahora ayuda a que no sea solo tuya. Comparte con un/a colega el prompt o la herramienta que más te ha servido, y ofrécele 15 minutos para mostrársela en persona. Sistematizar lo que sabes (plantillas propias, prompts guardados) también es parte de este paso.",
  en: "You already have real practice -- now help it not be yours alone. Share with a colleague the prompt or tool that has helped you the most, and offer 15 minutes to show it to them in person. Systematizing what you know (your own templates, saved prompts) is also part of this step.",
};

/**
 * Descripción del módulo "Innovar" -- exclusivo del nivel Experto.
 */
const INNOVAR_DESC: Record<Idioma, (materia: string) => string> = {
  es: (materia) =>
    `Explora usos menos comunes de IA en ${materia}: simulaciones de escenarios, generación dinámica de casos de evaluación, o IA como asistente de investigación para mantener actualizado tu propio contenido de clase.`,
  en: (materia) =>
    `Explore less common AI uses in ${materia}: scenario simulations, dynamic generation of assessment cases, or AI as a research assistant to keep your own class content up to date.`,
};

/**
 * Sugerencias de recursos complementarios por módulo -- 2 por módulo,
 * mezclando tipos (video/lectura/libro/consulta). Son sugerencias de tema,
 * nunca un link/título inventado.
 */
const RECURSOS_POR_MODULO: Record<
  Idioma,
  Record<string, ResultadoTmaid["rutaPersonalizada"][number]["recursos"]>
> = {
  es: {
    Fundamentos: [
      {
        tipo: "video",
        sugerencia:
          "Busca un video corto (5-10 min) que explique en términos simples qué es un modelo de lenguaje.",
      },
      {
        tipo: "lectura",
        sugerencia:
          "Busca un artículo introductorio sobre \"qué es una alucinación de IA\" -- es la primera trampa en la que caen la mayoría de los docentes nuevos en esto.",
      },
    ],
    Explorar: [
      {
        tipo: "consulta",
        sugerencia:
          "Pregúntale a un/a colega que ya use IA qué herramienta usa y para qué -- 10 minutos de conversación te pueden ahorrar horas de prueba y error.",
      },
      {
        tipo: "video",
        sugerencia:
          "Busca una demostración en video de la herramienta de IA que más te interese (ChatGPT, Gemini, Claude) usada para tareas docentes.",
      },
    ],
    Aplicar: [
      {
        tipo: "lectura",
        sugerencia:
          "Busca guías sobre \"diseño de prompts educativos\" -- ya existen bastantes enfocadas específicamente en docentes.",
      },
      {
        tipo: "libro",
        sugerencia:
          "Busca libros o guías cortas sobre IA generativa aplicada a la educación en tu materia específica.",
      },
    ],
    Integrar: [
      {
        tipo: "consulta",
        sugerencia:
          "Conversa con 2-3 estudiantes sobre cómo ELLOS ya usan IA fuera de clase -- te da pistas reales de qué permitir y qué no.",
      },
      {
        tipo: "lectura",
        sugerencia:
          "Busca casos de otros docentes de tu materia integrando IA en su rutina semanal (blogs o comunidades docentes).",
      },
    ],
    Evaluar: [
      {
        tipo: "video",
        sugerencia:
          "Busca un video sobre \"cómo diseñar una rúbrica con ayuda de IA\" -- hay bastante contenido reciente sobre el tema.",
      },
      {
        tipo: "libro",
        sugerencia:
          "Busca material sobre evaluación formativa asistida por IA -- es un área con publicaciones nuevas cada pocos meses.",
      },
    ],
    Liderar: [
      {
        tipo: "consulta",
        sugerencia:
          "Ofrécete a mostrarle a un/a colega, en 15 minutos, el prompt o la herramienta que más te ha servido.",
      },
      {
        tipo: "lectura",
        sugerencia:
          "Busca marcos de adopción de tecnología en instituciones educativas -- dan lenguaje útil para proponer esto a nivel institucional, no solo en tu aula.",
      },
    ],
    Innovar: [
      {
        tipo: "libro",
        sugerencia:
          "Busca literatura reciente (2025-2026) sobre IA generativa e innovación curricular -- es un área que cambia rápido.",
      },
      {
        tipo: "video",
        sugerencia:
          "Busca charlas o conferencias recientes sobre usos experimentales de IA en educación secundaria o superior.",
      },
    ],
  },
  en: {
    Fundamentos: [
      {
        tipo: "video",
        sugerencia:
          "Look for a short video (5-10 min) that explains in simple terms what a language model is.",
      },
      {
        tipo: "lectura",
        sugerencia:
          "Look for an introductory article on \"what an AI hallucination is\" -- it's the first trap most educators new to this fall into.",
      },
    ],
    Explorar: [
      {
        tipo: "consulta",
        sugerencia:
          "Ask a colleague who already uses AI which tool they use and what for -- a 10-minute conversation can save you hours of trial and error.",
      },
      {
        tipo: "video",
        sugerencia:
          "Look for a video demo of the AI tool that interests you most (ChatGPT, Gemini, Claude) used for teaching tasks.",
      },
    ],
    Aplicar: [
      {
        tipo: "lectura",
        sugerencia:
          "Look for guides on \"educational prompt design\" -- there are already quite a few focused specifically on educators.",
      },
      {
        tipo: "libro",
        sugerencia:
          "Look for books or short guides on generative AI applied to education in your specific subject.",
      },
    ],
    Integrar: [
      {
        tipo: "consulta",
        sugerencia:
          "Talk with 2-3 students about how THEY already use AI outside class -- it gives you real clues about what to allow and what not to.",
      },
      {
        tipo: "lectura",
        sugerencia:
          "Look for cases of other educators in your subject integrating AI into their weekly routine (blogs or teaching communities).",
      },
    ],
    Evaluar: [
      {
        tipo: "video",
        sugerencia:
          "Look for a video on \"how to design a rubric with AI's help\" -- there is plenty of recent content on the topic.",
      },
      {
        tipo: "libro",
        sugerencia:
          "Look for material on AI-assisted formative assessment -- it's an area with new publications every few months.",
      },
    ],
    Liderar: [
      {
        tipo: "consulta",
        sugerencia:
          "Offer to show a colleague, in 15 minutes, the prompt or tool that has helped you the most.",
      },
      {
        tipo: "lectura",
        sugerencia:
          "Look for technology adoption frameworks for educational institutions -- they give you useful language to propose this at the institutional level, not just in your classroom.",
      },
    ],
    Innovar: [
      {
        tipo: "libro",
        sugerencia:
          "Look for recent literature (2025-2026) on generative AI and curricular innovation -- it's a fast-changing area.",
      },
      {
        tipo: "video",
        sugerencia:
          "Look for recent talks or conferences on experimental AI uses in secondary or higher education.",
      },
    ],
  },
};

/**
 * Qué módulos recibe cada nivel, y en qué orden. Los ids de módulo se
 * conservan en español (claves canónicas de progresoRutas y badges).
 */
const MODULOS_POR_NIVEL: Record<Nivel, string[]> = {
  Iniciante: ["Fundamentos", "Explorar", "Aplicar", "Integrar", "Evaluar"],
  "En desarrollo": ["Explorar", "Aplicar", "Integrar", "Evaluar"],
  Avanzado: ["Aplicar", "Integrar", "Evaluar", "Liderar"],
  Experto: ["Integrar", "Evaluar", "Liderar", "Innovar"],
};

const MATERIA_FALLBACK: Record<Idioma, string> = {
  es: "tu materia",
  en: "your subject",
};

const DESAFIO_FALLBACK: Record<Idioma, string> = {
  es: "tu mayor desafío actual",
  en: "your biggest current challenge",
};

function promedioPorDimension(
  respuestas: Record<string, number>,
  dimension: Dimension
): number {
  const preguntas = PREGUNTAS_LIKERT.filter((p) => p.dimension === dimension);
  const suma = preguntas.reduce((acc, p) => acc + (respuestas[p.id] ?? 3), 0);
  return suma / preguntas.length;
}

/**
 * Umbrales centrados en cada valor de la escala Likert (1-5), con
 * fronteras a ±0.5 de cada entero: 1-2 -> Iniciante, 3 -> En desarrollo,
 * 4 -> Avanzado, 5 -> Experto.
 */
function nivelDesdePromedio(promedio: number): Nivel {
  if (promedio < 2.5) return "Iniciante";
  if (promedio < 3.5) return "En desarrollo";
  if (promedio < 4.5) return "Avanzado";
  return "Experto";
}

/**
 * Genera los campos de TEXTO del resultado (perfil pedagógico, mapa de
 * brechas y ruta) en el idioma pedido, a partir de los datos numéricos.
 * Compartido entre calcularResultadoTmaid (diagnóstico nuevo) y
 * localizarResultadoTmaid (re-render de un resultado guardado en el otro
 * idioma). `fases` permite respetar la lista de fases ya guardada de un
 * resultado viejo (ej. con "Dominar"); si una fase no tiene generador
 * conocido se conserva el texto original vía `descripcionesPrevias`.
 */
function generarTextosResultado(
  nivelAsignado: Nivel,
  dimensiones: ResultadoTmaid["dimensiones"],
  perfil: PerfilDocente,
  miedos: string | undefined,
  idioma: Idioma,
  fases: string[],
  descripcionesPrevias?: Record<string, string>,
  recursosPrevios?: Record<string, ResultadoTmaid["rutaPersonalizada"][number]["recursos"]>
): Pick<ResultadoTmaid, "perfilPedagogicoIA" | "mapaBrechas" | "rutaPersonalizada"> {
  // Ordena las 4 dimensiones de la mas debil a la mas fuerte. Array.sort es
  // estable, asi que en caso de empate se conserva el orden original de
  // DIMENSIONES.
  const dimsPorNivel = [...DIMENSIONES].sort((a, b) => dimensiones[a] - dimensiones[b]);
  const masDebil = dimsPorNivel[0];
  const masFuerte = dimsPorNivel[dimsPorNivel.length - 1];

  const etiquetas = ETIQUETA_DIMENSION_I18N[idioma];

  const mapaBrechas = dimsPorNivel.map(
    (d) => `${etiquetas[d]}: ${DIMENSION_TIP[idioma][d]}`
  );

  const materia =
    (perfil.materia && localizarValorPerfil(perfil.materia, idioma)) ||
    MATERIA_FALLBACK[idioma];
  const desafio =
    (perfil.mayorDesafio && localizarValorPerfil(perfil.mayorDesafio, idioma)) ||
    DESAFIO_FALLBACK[idioma];

  const miedosTexto = miedos?.trim();
  const notaMiedos = miedosTexto
    ? idioma === "es"
      ? ` Además, nos contaste esto: "${miedosTexto}" -- vale la pena tenerlo presente en tu ruta.`
      : ` Also, you shared this with us: "${miedosTexto}" -- it's worth keeping in mind along your pathway.`
    : "";

  const fuerteAlta = dimensiones[masFuerte] >= 4;
  const perfilPedagogicoIA =
    idioma === "es"
      ? `Eres un/a docente de ${materia} con ${
          fuerteAlta ? "muy buena" : "cierta"
        } base en ${etiquetas[masFuerte].toLowerCase()}. Tu mayor oportunidad está en fortalecer ${etiquetas[
          masDebil
        ].toLowerCase()}, especialmente pensando en resolver ${desafio}. Si sigues tu ruta personalizada, en las próximas semanas deberías notar menos tiempo invertido en tareas repetitivas (armar materiales, dar retroalimentación) y más margen para lo pedagógico.${notaMiedos}`
      : `You are a ${materia} educator with ${
          fuerteAlta ? "a very solid" : "some"
        } foundation in ${etiquetas[masFuerte].toLowerCase()}. Your biggest opportunity is strengthening ${etiquetas[
          masDebil
        ].toLowerCase()}, especially with an eye on solving ${desafio.toLowerCase()}. If you follow your personalized pathway, over the next few weeks you should notice less time spent on repetitive tasks (building materials, giving feedback) and more room for the pedagogical side.${notaMiedos}`;

  const rutaPersonalizada: ResultadoTmaid["rutaPersonalizada"] = fases.map((fase) => {
    let descripcion: string | null = null;
    switch (fase) {
      case "Fundamentos":
        descripcion = FUNDAMENTOS_DESC[idioma];
        break;
      case "Explorar":
        descripcion = EXPLORAR_POR_NIVEL[idioma][nivelAsignado](materia);
        break;
      case "Aplicar":
        descripcion =
          idioma === "es"
            ? `Lleva una primera actividad con IA a tu aula enfocada en ${desafio}. Un ejemplo concreto: ${EJEMPLO_DIMENSION.es[masDebil]}`
            : `Bring a first AI activity into your classroom focused on ${desafio.toLowerCase()}. A concrete example: ${EJEMPLO_DIMENSION.en[masDebil]}`;
        break;
      case "Integrar":
        descripcion = INTEGRAR_DESC[idioma](materia);
        break;
      case "Evaluar":
        descripcion = EVALUAR_POR_NIVEL[idioma][nivelAsignado];
        break;
      case "Liderar":
        descripcion = LIDERAR_DESC[idioma];
        break;
      case "Innovar":
        descripcion = INNOVAR_DESC[idioma](materia);
        break;
      default:
        descripcion = null;
    }
    return {
      fase,
      descripcion: descripcion ?? descripcionesPrevias?.[fase] ?? "",
      recursos:
        RECURSOS_POR_MODULO[idioma][fase] ?? recursosPrevios?.[fase] ?? [],
    };
  });

  return { perfilPedagogicoIA, mapaBrechas, rutaPersonalizada };
}

export function calcularResultadoTmaid(
  respuestas: Record<string, number>,
  perfil: PerfilDocente,
  miedos?: string,
  idioma: Idioma = "es"
): ResultadoTmaid {
  const dimensiones = {
    conocimientoIA: promedioPorDimension(respuestas, "conocimientoIA"),
    usoHerramientas: promedioPorDimension(respuestas, "usoHerramientas"),
    integracionAula: promedioPorDimension(respuestas, "integracionAula"),
    actitudCambio: promedioPorDimension(respuestas, "actitudCambio"),
  };

  const puntajePromedio =
    Object.values(dimensiones).reduce((a, b) => a + b, 0) / DIMENSIONES.length;

  const nivelAsignado = nivelDesdePromedio(puntajePromedio);

  const textos = generarTextosResultado(
    nivelAsignado,
    dimensiones,
    perfil,
    miedos,
    idioma,
    MODULOS_POR_NIVEL[nivelAsignado]
  );

  const miedosTexto = miedos?.trim();

  return {
    nivelAsignado,
    puntajePromedio,
    dimensiones,
    ...textos,
    // Metadatos i18n (opcionales, ver ResultadoTmaid en session.tsx):
    // permiten re-generar los textos en el otro idioma después, sin
    // perder la cita textual de la pregunta abierta.
    idioma,
    ...(miedosTexto ? { miedos: miedosTexto } : {}),
  };
}

/**
 * Re-genera los campos de texto de un resultado YA guardado en el idioma
 * pedido, conservando ids de fase, dimensiones y nivel (claves canónicas).
 * Si el resultado ya está en ese idioma (o es un registro viejo sin
 * metadato de idioma y se pide español), se devuelve tal cual -- así un
 * resultado antiguo conserva su texto original, incluida la cita de la
 * pregunta abierta aunque no tenga el campo `miedos` guardado.
 */
export function localizarResultadoTmaid(
  resultado: ResultadoTmaid,
  perfil: PerfilDocente,
  idioma: Idioma
): ResultadoTmaid {
  const idiomaOriginal = resultado.idioma ?? "es";
  if (idiomaOriginal === idioma) return resultado;

  const descripcionesPrevias: Record<string, string> = {};
  const recursosPrevios: Record<
    string,
    ResultadoTmaid["rutaPersonalizada"][number]["recursos"]
  > = {};
  resultado.rutaPersonalizada.forEach((f) => {
    descripcionesPrevias[f.fase] = f.descripcion;
    recursosPrevios[f.fase] = f.recursos;
  });

  const textos = generarTextosResultado(
    resultado.nivelAsignado,
    resultado.dimensiones,
    perfil,
    resultado.miedos,
    idioma,
    resultado.rutaPersonalizada.map((f) => f.fase),
    descripcionesPrevias,
    recursosPrevios
  );

  return { ...resultado, ...textos };
}

export { ETIQUETA_DIMENSION, ETIQUETA_DIMENSION_I18N, MODULOS_POR_NIVEL };
