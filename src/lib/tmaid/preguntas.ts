export type Dimension =
  | "conocimientoIA"
  | "usoHerramientas"
  | "integracionAula"
  | "actitudCambio";

export type PreguntaLikert = {
  id: string;
  dimension: Dimension;
  texto: string;
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
  { id: "c1", dimension: "conocimientoIA", texto: "Entiendo, en términos generales, cómo funciona una IA generativa (como ChatGPT o Claude)." },
  { id: "c2", dimension: "conocimientoIA", texto: "Puedo explicarle a un colega qué es un prompt y por qué importa cómo se escribe." },
  { id: "c3", dimension: "conocimientoIA", texto: "Sigo de cerca (o al menos escucho sobre) las novedades de IA aplicadas a educación." },
  { id: "c4", dimension: "conocimientoIA", ejemplo: true, texto: "Un colega te pregunta por qué a veces una IA \"inventa\" datos que suenan reales pero son falsos. Podrías explicarle qué es una alucinación de IA y por qué pasa." },

  { id: "u1", dimension: "usoHerramientas", texto: "Uso herramientas de IA de forma habitual para preparar mi trabajo docente." },
  { id: "u2", dimension: "usoHerramientas", texto: "Me siento cómodo probando una herramienta de IA nueva sin tutorial previo." },
  { id: "u3", dimension: "usoHerramientas", texto: "Sé ajustar un prompt cuando el resultado que obtengo no es el que esperaba." },
  { id: "u4", dimension: "usoHerramientas", ejemplo: true, texto: "La semana pasada le pediste a una IA un quiz de 5 preguntas y el resultado no sirvió (muy fácil, mal formato). Sabrías reescribir el prompt ahí mismo para arreglarlo, sin empezar de cero." },

  { id: "i1", dimension: "integracionAula", texto: "Ya he llevado alguna actividad con IA directamente a mis estudiantes." },
  { id: "i2", dimension: "integracionAula", texto: "Tengo claridad sobre cómo evaluar trabajos donde los estudiantes pudieron usar IA." },
  { id: "i3", dimension: "integracionAula", texto: "Mi institución tiene (o está construyendo) lineamientos claros sobre el uso de IA." },
  { id: "i4", dimension: "integracionAula", ejemplo: true, texto: "Un estudiante te entrega un trabajo y sospechas que lo escribió con IA sin decírtelo. Tienes una forma clara de abordar esa conversación con él o ella, no solo sospechar en silencio." },

  { id: "a1", dimension: "actitudCambio", texto: "Veo la IA más como una oportunidad para mi práctica docente que como una amenaza." },
  { id: "a2", dimension: "actitudCambio", texto: "Estoy dispuesto/a a dedicar tiempo regular a aprender e integrar IA este semestre." },
  { id: "a3", dimension: "actitudCambio", texto: "Me siento seguro/a hablando de IA con mis colegas o directivos." },
  { id: "a4", dimension: "actitudCambio", ejemplo: true, texto: "Se anunció una capacitación completa sobre IA en tu institución el próximo semestre. Te emociona más la idea de ir que sentirla como una obligación más." },
];

export const PREGUNTA_ABIERTA = {
  id: "miedos",
  texto: "¿Qué miedos o dudas tienes sobre usar IA en tu práctica docente?",
  placeholder: "Ej. Que los estudiantes hagan trampa, no saber por dónde empezar...",
};

export const ESCALA_LIKERT = [
  { valor: 1, etiqueta: "Muy en desacuerdo" },
  { valor: 2, etiqueta: "En desacuerdo" },
  { valor: 3, etiqueta: "Neutral" },
  { valor: 4, etiqueta: "De acuerdo" },
  { valor: 5, etiqueta: "Muy de acuerdo" },
];
