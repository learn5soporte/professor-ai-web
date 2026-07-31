import type { Idioma } from "@/lib/i18n/traducciones";

/**
 * Fase i18n (jul 2026): titulo/prompt/paraQueSirve pasan a ser bilingües
 * ({es, en}); `categoria` se mantiene como clave canónica en español (la
 * UI la traduce al mostrar, y los favoritos guardados en localStorage se
 * siguen indexando por `titulo.es` para no perder los ya guardados).
 */
export type PromptPedagogico = {
  titulo: Record<Idioma, string>;
  categoria: string;
  prompt: Record<Idioma, string>;
  paraQueSirve: Record<Idioma, string>;
};

// Banco de Prompts Pedagógicos (Módulo 3, Herramienta 3) — catálogo inicial
// curado para el MVP. En Fase 3 esto se vuelve dinámico/personalizable.
export const PROMPTS: PromptPedagogico[] = [
  {
    titulo: { es: "Planeación exprés", en: "Express lesson plan" },
    categoria: "Planeación",
    prompt: {
      es: "Actúa como asesor pedagógico. Diseña una planeación de clase de 45 minutos sobre [TEMA] para estudiantes de [NIVEL], con objetivo de aprendizaje, actividad inicial, desarrollo, cierre y una forma sencilla de evaluar.",
      en: "Act as a pedagogical advisor. Design a 45-minute lesson plan on [TOPIC] for [LEVEL] students, with a learning objective, opening activity, development, closure and a simple way to assess.",
    },
    paraQueSirve: {
      es: "Armar una clase completa en minutos cuando el tiempo apremia.",
      en: "Put together a complete lesson in minutes when time is short.",
    },
  },
  {
    titulo: { es: "Diferenciación por nivel", en: "Differentiation by level" },
    categoria: "Diferenciación",
    prompt: {
      es: "Toma esta actividad: [PEGA TU ACTIVIDAD]. Genera 3 versiones adaptadas: una más sencilla, una estándar y una avanzada, manteniendo el mismo objetivo de aprendizaje.",
      en: "Take this activity: [PASTE YOUR ACTIVITY]. Generate 3 adapted versions: a simpler one, a standard one and an advanced one, keeping the same learning objective.",
    },
    paraQueSirve: {
      es: "Atender distintos niveles en un mismo grupo sin rehacer todo desde cero.",
      en: "Serve different levels in the same group without redoing everything from scratch.",
    },
  },
  {
    titulo: { es: "Rúbrica en 1 minuto", en: "Rubric in 1 minute" },
    categoria: "Evaluación",
    prompt: {
      es: "Crea una rúbrica de evaluación para [ACTIVIDAD] con 4 criterios relevantes y 3 niveles de desempeño (bajo, medio, alto) con descripciones claras para cada celda.",
      en: "Create an assessment rubric for [ACTIVITY] with 4 relevant criteria and 3 performance levels (low, medium, high) with clear descriptions for each cell.",
    },
    paraQueSirve: {
      es: "Tener criterios de evaluación claros y defendibles ante estudiantes y familias.",
      en: "Have clear, defensible assessment criteria for students and families.",
    },
  },
  {
    titulo: { es: "Feedback personalizado", en: "Personalized feedback" },
    categoria: "Evaluación",
    prompt: {
      es: "Redacta retroalimentación constructiva para un estudiante que entregó lo siguiente: [PEGA EL TRABAJO]. Sé específico, empático y sugiere un siguiente paso concreto.",
      en: "Write constructive feedback for a student who submitted the following: [PASTE THE WORK]. Be specific, empathetic and suggest a concrete next step.",
    },
    paraQueSirve: {
      es: "Dar feedback de calidad sin que tome media hora por estudiante.",
      en: "Give quality feedback without spending half an hour per student.",
    },
  },
  {
    titulo: { es: "Comunicación con familias", en: "Family communication" },
    categoria: "Comunicación",
    prompt: {
      es: "Redacta un mensaje breve y profesional para enviar a la familia de un estudiante sobre [SITUACIÓN]. Tono: [informativo / motivacional / urgente].",
      en: "Write a short, professional message to send to a student's family about [SITUATION]. Tone: [informative / motivational / urgent].",
    },
    paraQueSirve: {
      es: "Comunicarte con familias de forma clara y profesional en segundos.",
      en: "Communicate with families clearly and professionally in seconds.",
    },
  },
  {
    titulo: { es: "Quiz rápido", en: "Quick quiz" },
    categoria: "Evaluación",
    prompt: {
      es: "Genera un quiz de 5 preguntas de opción múltiple sobre [TEMA] para nivel [NIVEL], incluyendo la respuesta correcta y una breve justificación de cada una.",
      en: "Generate a 5-question multiple-choice quiz on [TOPIC] for [LEVEL], including the correct answer and a brief justification for each one.",
    },
    paraQueSirve: {
      es: "Verificar comprensión al cierre de una clase sin preparación previa.",
      en: "Check understanding at the end of a lesson with no prior preparation.",
    },
  },
];
