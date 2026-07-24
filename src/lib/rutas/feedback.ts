/**
 * Feedback simulado de "Retroalimentación IA" en el Espacio del Reto --
 * Fase 0/1: sin GPT-4o real todavía (ver nota en rutas/reto/page.tsx),
 * pero el texto SÍ debe reaccionar a lo que el docente escribió, no ser
 * un elogio fijo sin importar el contenido.
 *
 * Bug real encontrado por el usuario (2026-07-23): escribió
 * "xczvgzdfsbgzdfgdf" en el área de trabajo y la retroalimentación
 * respondió "Excelente enfoque. Tu prompt considera el contexto de tus
 * estudiantes..." -- un texto fijo, igual para cualquier input. Esta
 * función reemplaza ese texto fijo por una heurística simple (sin NLP
 * real) que sí distingue entre: texto que no parece un prompt de verdad,
 * un prompt real pero muy corto, uno de buena extensión sin los
 * elementos clave de la fase, y uno que sí los tiene.
 */

const PALABRAS_CLAVE_PROMPT = [
  "actúa",
  "actua",
  "rol",
  "contexto",
  "nivel",
  "estudiante",
  "estudiantes",
  "grado",
  "curso",
  "objetivo",
  "formato",
  "ejemplo",
  "tono",
  "materia",
  "explica",
  "genera",
  "crea",
  "adapta",
  "evalúa",
  "evalua",
  "rúbrica",
  "rubrica",
];

/**
 * Heurística mínima para distinguir un intento real de escribir un
 * prompt de "ruido de teclado" (ej. "xczvgzdfsbgzdfgdf"): exige al menos
 * 3 "palabras" separadas por espacio, y que al menos la mitad de ellas
 * tengan una vocal. No es análisis semántico real -- es honesto sobre
 * eso en los comentarios -- pero atrapa el caso concreto reportado.
 */
export function parecePromptReal(texto: string): boolean {
  const limpio = texto.trim();
  if (limpio.length < 8) return false;
  const palabras = limpio.split(/\s+/).filter(Boolean);
  if (palabras.length < 3) return false;
  const conVocal = palabras.filter((p) => /[aeiouáéíóú]/i.test(p));
  return conVocal.length / palabras.length >= 0.5;
}

export function generarFeedbackIA(prompt: string, fase: string, tips: string[]): string {
  const texto = prompt.trim();
  const palabras = texto.split(/\s+/).filter(Boolean);
  const primerTip = tips[0] ?? "define el rol de la IA y el contexto de tu aula";

  if (!parecePromptReal(texto)) {
    return `Esto todavía no parece un prompt completo -- no alcanzo a identificar una instrucción clara ahí. Prueba algo como: ${primerTip} Vuelve a intentarlo con una frase real.`;
  }

  if (palabras.length < 8) {
    return `Es un punto de partida, pero está muy escueto (${palabras.length} palabras) para que una IA responda bien. Súmale más contexto: nivel del curso, el objetivo concreto y el formato que esperas. Ej.: ${primerTip}`;
  }

  const textoLower = texto.toLowerCase();
  const clavesEncontradas = PALABRAS_CLAVE_PROMPT.filter((k) => textoLower.includes(k));

  if (clavesEncontradas.length === 0) {
    return `El prompt tiene buena extensión, pero no veo elementos clave de la fase ${fase} (por ejemplo: rol, contexto de tus estudiantes, objetivo). Intenta incorporar alguno de estos: ${tips.join(" · ")}.`;
  }

  return `Buen enfoque -- mencionas ${clavesEncontradas
    .slice(0, 2)
    .join(
      " y "
    )}, justo lo que buscamos en la fase ${fase}. Para llevarlo más lejos, agrega el formato exacto de respuesta que esperas (lista, tabla, rúbrica, etc.) y pruébalo con un caso real de tu aula.`;
}
