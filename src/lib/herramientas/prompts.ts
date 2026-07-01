export type PromptPedagogico = {
  titulo: string;
  categoria: string;
  prompt: string;
  paraQueSirve: string;
};

// Banco de Prompts Pedagógicos (Módulo 3, Herramienta 3) — catálogo inicial
// curado para el MVP. En Fase 3 esto se vuelve dinámico/personalizable.
export const PROMPTS: PromptPedagogico[] = [
  {
    titulo: "Planeación exprés",
    categoria: "Planeación",
    prompt:
      "Actúa como asesor pedagógico. Diseña una planeación de clase de 45 minutos sobre [TEMA] para estudiantes de [NIVEL], con objetivo de aprendizaje, actividad inicial, desarrollo, cierre y una forma sencilla de evaluar.",
    paraQueSirve: "Armar una clase completa en minutos cuando el tiempo apremia.",
  },
  {
    titulo: "Diferenciación por nivel",
    categoria: "Diferenciación",
    prompt:
      "Toma esta actividad: [PEGA TU ACTIVIDAD]. Genera 3 versiones adaptadas: una más sencilla, una estándar y una avanzada, manteniendo el mismo objetivo de aprendizaje.",
    paraQueSirve: "Atender distintos niveles en un mismo grupo sin rehacer todo desde cero.",
  },
  {
    titulo: "Rúbrica en 1 minuto",
    categoria: "Evaluación",
    prompt:
      "Crea una rúbrica de evaluación para [ACTIVIDAD] con 4 criterios relevantes y 3 niveles de desempeño (bajo, medio, alto) con descripciones claras para cada celda.",
    paraQueSirve: "Tener criterios de evaluación claros y defendibles ante estudiantes y familias.",
  },
  {
    titulo: "Feedback personalizado",
    categoria: "Evaluación",
    prompt:
      "Redacta retroalimentación constructiva para un estudiante que entregó lo siguiente: [PEGA EL TRABAJO]. Sé específico, empático y sugiere un siguiente paso concreto.",
    paraQueSirve: "Dar feedback de calidad sin que tome media hora por estudiante.",
  },
  {
    titulo: "Comunicación con familias",
    categoria: "Comunicación",
    prompt:
      "Redacta un mensaje breve y profesional para enviar a la familia de un estudiante sobre [SITUACIÓN]. Tono: [informativo / motivacional / urgente].",
    paraQueSirve: "Comunicarte con familias de forma clara y profesional en segundos.",
  },
  {
    titulo: "Quiz rápido",
    categoria: "Evaluación",
    prompt:
      "Genera un quiz de 5 preguntas de opción múltiple sobre [TEMA] para nivel [NIVEL], incluyendo la respuesta correcta y una breve justificación de cada una.",
    paraQueSirve: "Verificar comprensión al cierre de una clase sin preparación previa.",
  },
];
