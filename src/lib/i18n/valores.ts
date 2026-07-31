import type { Idioma } from "./traducciones";

/**
 * Localización de VALORES canónicos de datos (no de UI).
 *
 * Decisión de diseño de la fase i18n: los valores que se guardan en la
 * sesión/Supabase (perfil.nivelEducativo, materia sugerida, usoPrevioIA,
 * mayorDesafio, objetivoPrincipal, y los ids de fase de la ruta) se
 * mantienen SIEMPRE en español -- son la clave canónica con la que ya hay
 * registros guardados y con la que se indexa progresoRutas/scoring. Al
 * mostrar, estas funciones traducen la etiqueta visible según el idioma
 * activo; un valor desconocido (ej. una materia escrita a mano por el
 * docente) se muestra tal cual, porque es contenido del usuario.
 */

const VALOR_PERFIL_EN: Record<string, string> = {
  // Niveles educativos (onboarding paso 1)
  "Educación Inicial": "Early Childhood Education",
  Primaria: "Primary School",
  Secundaria: "Secondary School",
  "Educación Superior": "Higher Education",
  "Formación Corporativa": "Corporate Training",
  "Independiente / Cursos propios": "Independent / Own courses",
  // Materias sugeridas (onboarding paso 2)
  Matemáticas: "Mathematics",
  Historia: "History",
  "Lengua y Literatura": "Language & Literature",
  Física: "Physics",
  Arte: "Art",
  Programación: "Programming",
  // Relación con la IA (onboarding paso 3)
  Explorador: "Explorer",
  Curioso: "Curious",
  Aplicador: "Applier",
  // Desafíos (onboarding paso 3)
  "Falta de tiempo": "Lack of time",
  "Engagement alumnos": "Student engagement",
  "Evaluación rápida": "Fast assessment",
  // Objetivos (onboarding paso 4)
  "Ahorrar tiempo": "Save time",
  "Aprender IA": "Learn AI",
  "Evaluar mejor": "Assess better",
  "Ser referente": "Become a leader",
};

export function localizarValorPerfil(valor: string, idioma: Idioma): string {
  if (idioma === "es") return valor;
  return VALOR_PERFIL_EN[valor] ?? valor;
}

/**
 * Etiqueta visible de un módulo/fase de la ruta formativa. El id de fase
 * guardado ("Fundamentos", "Explorar", ...) se conserva en español (clave
 * canónica de progresoRutas y de los badges por fase).
 */
const FASE_EN: Record<string, string> = {
  Fundamentos: "Foundations",
  Explorar: "Explore",
  Aplicar: "Apply",
  Integrar: "Integrate",
  Evaluar: "Assess",
  Liderar: "Lead",
  Innovar: "Innovate",
  Dominar: "Master",
};

export function etiquetaFase(fase: string, idioma: Idioma): string {
  if (idioma === "es") return fase;
  return FASE_EN[fase] ?? fase;
}
