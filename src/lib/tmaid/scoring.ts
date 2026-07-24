import type { PerfilDocente, ResultadoTmaid } from "@/lib/store/session";
import { PREGUNTAS_LIKERT, type Dimension } from "./preguntas";

/**
 * Scoring TMAID — Fase 0/1: reglas simples client-side.
 * Fase 2 (según roadmap): este cálculo se conecta a un prompt estructurado
 * a GPT-4o para generar el perfil pedagógico-IA y la ruta con lenguaje
 * natural más rico; la lógica de dimensiones/nivel se mantiene igual.
 */

const DIMENSIONES: Dimension[] = [
  "conocimientoIA",
  "usoHerramientas",
  "integracionAula",
  "actitudCambio",
];

const ETIQUETA_DIMENSION: Record<Dimension, string> = {
  conocimientoIA: "Conocimiento de IA",
  usoHerramientas: "Uso de herramientas",
  integracionAula: "Integración al aula",
  actitudCambio: "Actitud ante el cambio",
};

/**
 * Consejo concreto por dimensión -- feedback de un docente probando el
 * prototipo (jul 2026): el resultado se sentía corto y genérico ("oportunidad
 * clara de refuerzo" no dice nada accionable). Cada tip aquí da algo
 * concreto que hacer: un término que aprender, cómo acotar un prompt, por
 * dónde empezar. Se usa en mapaBrechas, en las 4 dimensiones siempre (no
 * solo las que están por debajo de 3), ordenadas de la más débil a la más
 * fuerte -- así el resultado siempre trae contenido sustancial, no solo
 * cuando el docente respondió mal.
 */
const DIMENSION_TIP: Record<Dimension, string> = {
  conocimientoIA:
    "aprende términos clave como \"prompt\", \"alucinación\" y \"temperatura\": te ayudan a saber cuándo confiar en una respuesta de IA y cuándo conviene verificarla.",
  usoHerramientas:
    "acota tus prompts con contexto (tema, nivel del curso, cantidad, formato) en vez de pedir algo genérico -- así obtienes resultados usables a la primera.",
  integracionAula:
    "empieza con una sola actividad piloto (por ejemplo, dar retroalimentación a un ensayo) antes de llevar IA a toda la materia.",
  actitudCambio:
    "dale 2-3 vueltas al mismo prompt antes de descartarlo -- la primera respuesta de la IA casi nunca es la definitiva.",
};

/**
 * Ejemplo concreto en cifras por dimensión, usado en la fase "Aplicar" de
 * la ruta personalizada. Pedido explícito de feedback: "en cifras, en
 * lugar de demorar 30 minutos en una rúbrica se puede hacer en 5".
 */
const EJEMPLO_DIMENSION: Record<Dimension, string> = {
  conocimientoIA:
    "revisar 30 respuestas de un examen a mano puede tomarte 45 minutos; usando IA como primer filtro (y revisando tú después), baja a unos 15.",
  usoHerramientas:
    "armar una rúbrica desde cero puede tomarte 30 minutos; con el Banco de Prompts y el Creador de Rúbricas de Professor AI, ese mismo trabajo baja a 5-10 minutos.",
  integracionAula:
    "diseñar una actividad nueva con IA para tu clase puede tomarte 1 hora la primera vez; repitiéndola 2-3 veces con ajustes, baja a 15-20 minutos.",
  actitudCambio:
    "ajustar y volver a pedirle algo a la IA toma 2-3 minutos extra, pero te puede ahorrar hasta 20 minutos de trabajo manual después.",
};

/**
 * Descripción de la fase "Explorar", variando según el nivel asignado --
 * antes era el mismo texto para un Iniciante que para un Experto, lo que
 * contribuía a que el resultado se sintiera genérico/repetido entre
 * intentos distintos.
 */
const EXPLORAR_POR_NIVEL: Record<ResultadoTmaid["nivelAsignado"], (materia: string) => string> = {
  Iniciante: (materia) =>
    `Antes que nada, dedica 20-30 minutos a probar una herramienta de IA (como ChatGPT o Gemini) haciendo preguntas simples sobre ${materia} -- sin buscar un resultado perfecto, solo para perder el miedo inicial.`,
  "En desarrollo": (materia) =>
    `Prueba 2-3 herramientas de IA aplicadas a ${materia} y compara qué tan útiles te resultan para tareas puntuales: resumir, generar ejemplos, dar feedback.`,
  Avanzado: (materia) =>
    `Explora funciones más avanzadas de las herramientas que ya usas (plantillas, prompts guardados) para ${materia}, buscando ahorrar más tiempo del que ya ahorras hoy.`,
  Experto: (materia) =>
    `Explora casos de uso menos comunes de IA en ${materia} -- por ejemplo, generar escenarios de evaluación o simulaciones para tus estudiantes.`,
};

/**
 * Descripción de la fase "Dominar", con la misma lógica de variación por
 * nivel que EXPLORAR_POR_NIVEL.
 */
const DOMINAR_POR_NIVEL: Record<ResultadoTmaid["nivelAsignado"], string> = {
  Iniciante:
    "Cuando te sientas cómodo/a con lo básico, usa IA de forma regular en una sola tarea (por ejemplo, planeación de clases) antes de expandir a más.",
  "En desarrollo":
    "Integra IA de forma regular en planeación y evaluación, y comparte tu experiencia con colegas.",
  Avanzado:
    "Sistematiza tu uso de IA (plantillas propias, prompts reutilizables) y empieza a orientar a otros docentes que están empezando.",
  Experto:
    "Lidera la adopción de IA en tu institución: documenta tus prompts y resultados para que otros docentes los repliquen.",
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
 * fronteras a ±0.5 de cada entero -- no en los enteros mismos. Antes los
 * cortes estaban en 2/3/4, lo que en la practica significaba que
 * responder "Neutral" (3) en todo daba "Avanzado" y "De acuerdo" (4) ya
 * daba el nivel maximo "Experto": el resultado terminaba pareciendo
 * positivo casi sin importar lo que el docente respondiera. Con los
 * cortes en 2.5/3.5/4.5, cada respuesta entera cae en el nivel que le
 * corresponde de verdad: 1-2 -> Iniciante, 3 -> En desarrollo, 4 ->
 * Avanzado, 5 -> Experto.
 */
function nivelDesdePromedio(promedio: number): ResultadoTmaid["nivelAsignado"] {
  if (promedio < 2.5) return "Iniciante";
  if (promedio < 3.5) return "En desarrollo";
  if (promedio < 4.5) return "Avanzado";
  return "Experto";
}

export function calcularResultadoTmaid(
  respuestas: Record<string, number>,
  perfil: PerfilDocente
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

  // Ordena las 4 dimensiones de la mas debil a la mas fuerte. Array.sort es
  // estable, asi que en caso de empate se conserva el orden original de
  // DIMENSIONES -- masFuerte y masDebil nunca colisionan salvo que las 4
  // dimensiones sean identicas, y en ese caso quedan en extremos distintos
  // de la lista (primera vs. ultima), no en la misma.
  const dimsPorNivel = [...DIMENSIONES].sort((a, b) => dimensiones[a] - dimensiones[b]);
  const masDebil = dimsPorNivel[0];
  const masFuerte = dimsPorNivel[dimsPorNivel.length - 1];

  // Antes solo se listaban las dimensiones por debajo de 3, con un mensaje
  // generico ("oportunidad clara de refuerzo") y un fallback cuando ninguna
  // calificaba. Feedback de un docente probando el prototipo: el resultado
  // se sentia corto y decia lo mismo en cada intento. Ahora siempre se
  // listan las 4, de la mas debil a la mas fuerte, cada una con un consejo
  // especifico y accionable -- el contenido varia con las respuestas reales
  // del docente, no solo con el promedio general.
  const mapaBrechas = dimsPorNivel.map(
    (d) => `${ETIQUETA_DIMENSION[d]}: ${DIMENSION_TIP[d]}`
  );

  const materia = perfil.materia || "tu materia";
  const desafio = perfil.mayorDesafio || "tu mayor desafío actual";

  const perfilPedagogicoIA = `Eres un/a docente de ${materia} con ${
    dimensiones[masFuerte] >= 4 ? "muy buena" : "cierta"
  } base en ${ETIQUETA_DIMENSION[masFuerte].toLowerCase()}. Tu mayor oportunidad está en fortalecer ${ETIQUETA_DIMENSION[
    masDebil
  ].toLowerCase()}, especialmente pensando en resolver ${desafio}. Si sigues tu ruta personalizada, en las próximas semanas deberías notar menos tiempo invertido en tareas repetitivas (armar materiales, dar retroalimentación) y más margen para lo pedagógico.`;

  const rutaPersonalizada: ResultadoTmaid["rutaPersonalizada"] = [
    {
      fase: "Explorar",
      descripcion: EXPLORAR_POR_NIVEL[nivelAsignado](materia),
    },
    {
      fase: "Aplicar",
      descripcion: `Lleva una primera actividad con IA a tu aula enfocada en ${desafio}. Un ejemplo concreto: ${EJEMPLO_DIMENSION[masDebil]}`,
    },
    {
      fase: "Dominar",
      descripcion: DOMINAR_POR_NIVEL[nivelAsignado],
    },
  ];

  return {
    nivelAsignado,
    puntajePromedio,
    dimensiones,
    perfilPedagogicoIA,
    mapaBrechas,
    rutaPersonalizada,
  };
}

export { ETIQUETA_DIMENSION };
