export type Badge = {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  puntos: number;
};

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
    emoji: "🚀",
    puntos: 10,
  },
  "diagnostico-completo": {
    id: "diagnostico-completo",
    nombre: "Autoconocimiento IA",
    descripcion: "Completaste tu diagnóstico TMAID.",
    emoji: "🧭",
    puntos: 25,
  },
  "fase-explorar": {
    id: "fase-explorar",
    nombre: "Explorador/a",
    descripcion: "Completaste la fase Explorar de tu ruta.",
    emoji: "🔍",
    puntos: 20,
  },
  "fase-aplicar": {
    id: "fase-aplicar",
    nombre: "En acción",
    descripcion: "Completaste la fase Aplicar de tu ruta.",
    emoji: "⚡",
    puntos: 30,
  },
  "fase-dominar": {
    id: "fase-dominar",
    nombre: "Referente IA",
    descripcion: "Completaste la fase Dominar de tu ruta.",
    emoji: "🏆",
    puntos: 50,
  },
  "primer-prompt": {
    id: "primer-prompt",
    nombre: "Primer prompt copiado",
    descripcion: "Usaste el Banco de Prompts por primera vez.",
    emoji: "✨",
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
