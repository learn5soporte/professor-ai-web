export type Dimension =
  | "conocimientoIA"
  | "usoHerramientas"
  | "integracionAula"
  | "actitudCambio";

export type PreguntaLikert = {
  id: string;
  dimension: Dimension;
  texto: string;
};

// 3 preguntas por dimensión x 4 dimensiones = 12 preguntas (escala Likert 1-5),
// según Módulo 1 del documento técnico v2.0.
export const PREGUNTAS_LIKERT: PreguntaLikert[] = [
  { id: "c1", dimension: "conocimientoIA", texto: "Entiendo, en términos generales, cómo funciona una IA generativa (como ChatGPT o Claude)." },
  { id: "c2", dimension: "conocimientoIA", texto: "Puedo explicarle a un colega qué es un prompt y por qué importa cómo se escribe." },
  { id: "c3", dimension: "conocimientoIA", texto: "Sigo de cerca (o al menos escucho sobre) las novedades de IA aplicadas a educación." },

  { id: "u1", dimension: "usoHerramientas", texto: "Uso herramientas de IA de forma habitual para preparar mi trabajo docente." },
  { id: "u2", dimension: "usoHerramientas", texto: "Me siento cómodo probando una herramienta de IA nueva sin tutorial previo." },
  { id: "u3", dimension: "usoHerramientas", texto: "Sé ajustar un prompt cuando el resultado que obtengo no es el que esperaba." },

  { id: "i1", dimension: "integracionAula", texto: "Ya he llevado alguna actividad con IA directamente a mis estudiantes." },
  { id: "i2", dimension: "integracionAula", texto: "Tengo claridad sobre cómo evaluar trabajos donde los estudiantes pudieron usar IA." },
  { id: "i3", dimension: "integracionAula", texto: "Mi institución tiene (o está construyendo) lineamientos claros sobre el uso de IA." },

  { id: "a1", dimension: "actitudCambio", texto: "Veo la IA más como una oportunidad para mi práctica docente que como una amenaza." },
  { id: "a2", dimension: "actitudCambio", texto: "Estoy dispuesto/a a dedicar tiempo regular a aprender e integrar IA este semestre." },
  { id: "a3", dimension: "actitudCambio", texto: "Me siento seguro/a hablando de IA con mis colegas o directivos." },
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
