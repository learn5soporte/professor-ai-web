import type { Idioma } from "@/lib/i18n/traducciones";

export type Dimension =
  | "conocimientoIA"
  | "usoHerramientas"
  | "integracionAula"
  | "actitudCambio";

/**
 * Fase i18n (jul 2026): los textos visibles de las preguntas pasan a ser
 * bilingües ({es, en}); el id, la dimensión y el flag `ejemplo` (los datos
 * que usa el scoring y los tests) no cambian. La UI resuelve el idioma
 * activo con `pregunta.texto[idioma]`.
 */
export type PreguntaLikert = {
  id: string;
  dimension: Dimension;
  texto: Record<Idioma, string>;
  /**
   * true si la pregunta presenta un escenario concreto ("la semana
   * pasada te pasó X, ¿podrías...?") en vez de una afirmación abstracta
   * sobre uno mismo. Feedback real de un docente probando el prototipo
   * (2026-07-23): pidió "más ejemplos con autoevaluación" en el
   * diagnóstico -- las 12 preguntas originales son todas afirmaciones
   * abstractas tipo "estoy de acuerdo en que..."; estas 4 nuevas (una por
   * dimensión) se autoevalúan sobre un ejemplo concreto en vez de un
   * rasgo abstracto. La UI (tmaid/page.tsx) usa este flag solo para
   * mostrar una etiqueta "ESCENARIO" -- la escala y el scoring (scoring.ts)
   * son exactamente los mismos 1-5 de siempre, así que no hace falta
   * tocar la lógica de cálculo.
   */
  ejemplo?: boolean;
};

// 3 preguntas abstractas + 1 pregunta de escenario por dimensión x 4
// dimensiones = 16 preguntas (escala Likert 1-5). Las 12 abstractas vienen
// del Módulo 1 del documento técnico v2.0; las 4 de escenario se sumaron
// el 2026-07-23 a pedido de un docente probando el prototipo.
export const PREGUNTAS_LIKERT: PreguntaLikert[] = [
  {
    id: "c1",
    dimension: "conocimientoIA",
    texto: {
      es: "Entiendo, en términos generales, cómo funciona una IA generativa (como ChatGPT o Claude).",
      en: "I understand, in general terms, how a generative AI (like ChatGPT or Claude) works.",
    },
  },
  {
    id: "c2",
    dimension: "conocimientoIA",
    texto: {
      es: "Puedo explicarle a un colega qué es un prompt y por qué importa cómo se escribe.",
      en: "I can explain to a colleague what a prompt is and why the way it's written matters.",
    },
  },
  {
    id: "c3",
    dimension: "conocimientoIA",
    texto: {
      es: "Sigo de cerca (o al menos escucho sobre) las novedades de IA aplicadas a educación.",
      en: "I closely follow (or at least hear about) AI developments applied to education.",
    },
  },
  {
    id: "c4",
    dimension: "conocimientoIA",
    ejemplo: true,
    texto: {
      es: "Un colega te pregunta por qué a veces una IA \"inventa\" datos que suenan reales pero son falsos. Podrías explicarle qué es una alucinación de IA y por qué pasa.",
      en: "A colleague asks you why an AI sometimes \"makes up\" facts that sound real but are false. You could explain what an AI hallucination is and why it happens.",
    },
  },

  {
    id: "u1",
    dimension: "usoHerramientas",
    texto: {
      es: "Uso herramientas de IA de forma habitual para preparar mi trabajo docente.",
      en: "I regularly use AI tools to prepare my teaching work.",
    },
  },
  {
    id: "u2",
    dimension: "usoHerramientas",
    texto: {
      es: "Me siento cómodo probando una herramienta de IA nueva sin tutorial previo.",
      en: "I feel comfortable trying a new AI tool without a tutorial first.",
    },
  },
  {
    id: "u3",
    dimension: "usoHerramientas",
    texto: {
      es: "Sé ajustar un prompt cuando el resultado que obtengo no es el que esperaba.",
      en: "I know how to adjust a prompt when the result I get isn't what I expected.",
    },
  },
  {
    id: "u4",
    dimension: "usoHerramientas",
    ejemplo: true,
    texto: {
      es: "La semana pasada le pediste a una IA un quiz de 5 preguntas y el resultado no sirvió (muy fácil, mal formato). Sabrías reescribir el prompt ahí mismo para arreglarlo, sin empezar de cero.",
      en: "Last week you asked an AI for a 5-question quiz and the result was useless (too easy, wrong format). You would know how to rewrite the prompt right there to fix it, without starting from scratch.",
    },
  },

  {
    id: "i1",
    dimension: "integracionAula",
    texto: {
      es: "Ya he llevado alguna actividad con IA directamente a mis estudiantes.",
      en: "I have already brought an AI activity directly to my students.",
    },
  },
  {
    id: "i2",
    dimension: "integracionAula",
    texto: {
      es: "Tengo claridad sobre cómo evaluar trabajos donde los estudiantes pudieron usar IA.",
      en: "I'm clear on how to grade assignments where students may have used AI.",
    },
  },
  {
    id: "i3",
    dimension: "integracionAula",
    texto: {
      es: "Mi institución tiene (o está construyendo) lineamientos claros sobre el uso de IA.",
      en: "My institution has (or is building) clear guidelines on AI use.",
    },
  },
  {
    id: "i4",
    dimension: "integracionAula",
    ejemplo: true,
    texto: {
      es: "Un estudiante te entrega un trabajo y sospechas que lo escribió con IA sin decírtelo. Tienes una forma clara de abordar esa conversación con él o ella, no solo sospechar en silencio.",
      en: "A student hands in an assignment and you suspect they wrote it with AI without telling you. You have a clear way to approach that conversation with them, not just suspect in silence.",
    },
  },

  {
    id: "a1",
    dimension: "actitudCambio",
    texto: {
      es: "Veo la IA más como una oportunidad para mi práctica docente que como una amenaza.",
      en: "I see AI more as an opportunity for my teaching practice than as a threat.",
    },
  },
  {
    id: "a2",
    dimension: "actitudCambio",
    texto: {
      es: "Estoy dispuesto/a a dedicar tiempo regular a aprender e integrar IA este semestre.",
      en: "I'm willing to dedicate regular time to learning and integrating AI this semester.",
    },
  },
  {
    id: "a3",
    dimension: "actitudCambio",
    texto: {
      es: "Me siento seguro/a hablando de IA con mis colegas o directivos.",
      en: "I feel confident talking about AI with my colleagues or school leaders.",
    },
  },
  {
    id: "a4",
    dimension: "actitudCambio",
    ejemplo: true,
    texto: {
      es: "Se anunció una capacitación completa sobre IA en tu institución el próximo semestre. Te emociona más la idea de ir que sentirla como una obligación más.",
      en: "A full AI training program was announced at your institution for next semester. You're more excited about attending than seeing it as just another obligation.",
    },
  },
];

export const PREGUNTA_ABIERTA = {
  id: "miedos",
  texto: {
    es: "¿Qué miedos o dudas tienes sobre usar IA en tu práctica docente?",
    en: "What fears or doubts do you have about using AI in your teaching practice?",
  } as Record<Idioma, string>,
  placeholder: {
    es: "Ej. Que los estudiantes hagan trampa, no saber por dónde empezar...",
    en: "E.g. Students cheating, not knowing where to start...",
  } as Record<Idioma, string>,
};

export const ESCALA_LIKERT: { valor: number; etiqueta: Record<Idioma, string> }[] = [
  { valor: 1, etiqueta: { es: "Muy en desacuerdo", en: "Strongly disagree" } },
  { valor: 2, etiqueta: { es: "En desacuerdo", en: "Disagree" } },
  { valor: 3, etiqueta: { es: "Neutral", en: "Neutral" } },
  { valor: 4, etiqueta: { es: "De acuerdo", en: "Agree" } },
  { valor: 5, etiqueta: { es: "Muy de acuerdo", en: "Strongly agree" } },
];
