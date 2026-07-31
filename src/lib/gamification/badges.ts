import type { Idioma } from "@/lib/i18n/traducciones";

export type Badge = {
  id: string;
  /** Nombre visible en español (fuente de verdad original). */
  nombre: string;
  /** Descripción visible en español (fuente de verdad original). */
  descripcion: string;
  /** Traducción EN -- resolver con textoBadge(badge, idioma). */
  nombreEn: string;
  descripcionEn: string;
  emoji: string;
  puntos: number;
};

/**
 * Resuelve nombre/descripción del badge según el idioma activo. Los ids y
 * puntos son canónicos (se guardan en Supabase/localStorage) y no cambian
 * con el idioma; `nombre`/`descripcion` en español se mantienen como
 * campos base para no romper el contrato de los tests ni registros
 * existentes.
 */
export function textoBadge(
  badge: Badge,
  idioma: Idioma
): { nombre: string; descripcion: string } {
  return idioma === "en"
    ? { nombre: badge.nombreEn, descripcion: badge.descripcionEn }
    : { nombre: badge.nombre, descripcion: badge.descripcion };
}

/**
 * Catálogo de badges — Módulo 4 (Seguimiento y Evolución) del documento
 * técnico. En Fase 4 esto se persiste en Supabase (tabla `badges`); por ahora
 * vive en la sesión simulada (localStorage) para demostrar la mecánica.
 */
export const BADGES: Record<string, Badge> = {
  "primeros-pasos": {
    id: "primeros-pasos",
    nombre: "Primeros pasos",
    descripcion: "Completaste tu onboarding docente.",
    nombreEn: "First steps",
    descripcionEn: "You completed your educator onboarding.",
    emoji: "🚀",
    puntos: 10,
  },
  "diagnostico-completo": {
    id: "diagnostico-completo",
    nombre: "Autoconocimiento IA",
    descripcion: "Completaste tu diagnóstico TMAID.",
    nombreEn: "AI Self-Knowledge",
    descripcionEn: "You completed your TMAID diagnosis.",
    emoji: "🧭",
    puntos: 25,
  },
  "fase-explorar": {
    id: "fase-explorar",
    nombre: "Explorador/a",
    descripcion: "Completaste la fase Explorar de tu ruta.",
    nombreEn: "Explorer",
    descripcionEn: "You completed the Explore phase of your pathway.",
    emoji: "🔍",
    puntos: 20,
  },
  "fase-aplicar": {
    id: "fase-aplicar",
    nombre: "En acción",
    descripcion: "Completaste la fase Aplicar de tu ruta.",
    nombreEn: "In action",
    descripcionEn: "You completed the Apply phase of your pathway.",
    emoji: "⚡",
    puntos: 30,
  },
  "fase-dominar": {
    id: "fase-dominar",
    nombre: "Referente IA",
    descripcion: "Completaste la fase Dominar de tu ruta.",
    nombreEn: "AI Leader",
    descripcionEn: "You completed the Master phase of your pathway.",
    emoji: "🏆",
    puntos: 50,
  },
  // Los 5 badges siguientes son nuevos (ruta formativa ampliada, jul 2026):
  // la ruta paso de tener siempre 3 fases fijas (Explorar/Aplicar/Dominar)
  // a 4-5 modulos segun el nivel real del docente (ver MODULOS_POR_NIVEL en
  // scoring.ts). "fase-dominar" se deja intacto arriba para los docentes
  // que ya lo ganaron con la ruta vieja, pero deja de otorgarse a partir de
  // ahora -- su contenido se reparte entre Evaluar/Liderar/Innovar.
  "fase-fundamentos": {
    id: "fase-fundamentos",
    nombre: "Sin miedo",
    descripcion: "Completaste el módulo Fundamentos de tu ruta.",
    nombreEn: "Fearless",
    descripcionEn: "You completed the Foundations module of your pathway.",
    emoji: "🌱",
    puntos: 15,
  },
  "fase-integrar": {
    id: "fase-integrar",
    nombre: "Rutina con IA",
    descripcion: "Completaste el módulo Integrar de tu ruta.",
    nombreEn: "AI Routine",
    descripcionEn: "You completed the Integrate module of your pathway.",
    emoji: "🔄",
    puntos: 25,
  },
  "fase-evaluar": {
    id: "fase-evaluar",
    nombre: "Evaluador/a IA",
    descripcion: "Completaste el módulo Evaluar de tu ruta.",
    nombreEn: "AI Assessor",
    descripcionEn: "You completed the Assess module of your pathway.",
    emoji: "📋",
    puntos: 35,
  },
  "fase-liderar": {
    id: "fase-liderar",
    nombre: "Líder IA",
    descripcion: "Completaste el módulo Liderar de tu ruta.",
    nombreEn: "AI Lead",
    descripcionEn: "You completed the Lead module of your pathway.",
    emoji: "🤝",
    puntos: 40,
  },
  "fase-innovar": {
    id: "fase-innovar",
    nombre: "Innovador/a IA",
    descripcion: "Completaste el módulo Innovar de tu ruta.",
    nombreEn: "AI Innovator",
    descripcionEn: "You completed the Innovate module of your pathway.",
    emoji: "🧪",
    puntos: 55,
  },
  "primer-prompt": {
    id: "primer-prompt",
    nombre: "Primer prompt copiado",
    descripcion: "Usaste el Banco de Prompts por primera vez.",
    nombreEn: "First prompt copied",
    descripcionEn: "You used the Prompt Bank for the first time.",
    emoji: "✨",
    puntos: 10,
  },
  "primera-adaptacion": {
    id: "primera-adaptacion",
    nombre: "Contenido para todos",
    descripcion: "Usaste el Adaptador de Contenido por primera vez.",
    nombreEn: "Content for everyone",
    descripcionEn: "You used the Content Adapter for the first time.",
    emoji: "🧩",
    puntos: 10,
  },
};

export function calcularNivel(puntos: number) {
  if (puntos < 20) return { nivel: 1, siguienteEn: 20 };
  if (puntos < 50) return { nivel: 2, siguienteEn: 50 };
  if (puntos < 90) return { nivel: 3, siguienteEn: 90 };
  if (puntos < 150) return { nivel: 4, siguienteEn: 150 };
  return { nivel: 5, siguienteEn: null };
}
