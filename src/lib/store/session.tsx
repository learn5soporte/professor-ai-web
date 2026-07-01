"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BADGES } from "@/lib/gamification/badges";

/**
 * Sesión simulada (Fase 0 — prototipo visual).
 *
 * No hay backend real todavía: esto guarda el estado del docente en
 * localStorage para poder navegar login -> onboarding -> TMAID -> dashboard
 * como un flujo completo. Cuando conectemos Supabase (Fase 1), este mismo
 * shape de datos migra a las tablas `perfil_docente` / `resultado_tmaid`.
 */

export type PerfilDocente = {
  nombre: string;
  nivelEducativo: string;
  materia: string;
  pais: string;
  usoPrevioIA: string;
  mayorDesafio: string;
};

export type ResultadoTmaid = {
  nivelAsignado: "Iniciante" | "En desarrollo" | "Avanzado" | "Experto";
  puntajePromedio: number;
  dimensiones: {
    conocimientoIA: number;
    usoHerramientas: number;
    integracionAula: number;
    actitudCambio: number;
  };
  perfilPedagogicoIA: string;
  mapaBrechas: string[];
  rutaPersonalizada: {
    fase: "Explorar" | "Aplicar" | "Dominar";
    descripcion: string;
  }[];
};

export type EstadoFase = "pendiente" | "en_progreso" | "completado";

type SessionState = {
  autenticado: boolean;
  perfil: PerfilDocente | null;
  resultadoTmaid: ResultadoTmaid | null;
  progresoRutas: Record<string, EstadoFase>;
  badges: string[];
  puntos: number;
  racha: number;
  ultimaFechaActiva: string | null;
};

type SessionContextValue = SessionState & {
  iniciarSesionMock: (nombre: string) => void;
  guardarPerfil: (perfil: PerfilDocente) => void;
  guardarResultadoTmaid: (resultado: ResultadoTmaid) => void;
  actualizarProgresoFase: (fase: string, estado: EstadoFase) => void;
  otorgarBadge: (badgeId: string) => boolean;
  registrarActividadDiaria: () => void;
  reiniciar: () => void;
};

const STORAGE_KEY = "professor-ai:sesion-mock";

const defaultState: SessionState = {
  autenticado: false,
  perfil: null,
  resultadoTmaid: null,
  progresoRutas: {},
  badges: [],
  puntos: 0,
  racha: 0,
  ultimaFechaActiva: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState({ ...defaultState, ...JSON.parse(raw) });
      } catch {
        // localStorage corrupto o de otra versión: ignorar y empezar de cero
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated]);

  const value: SessionContextValue = {
    ...state,
    iniciarSesionMock: (nombre: string) =>
      setState((prev) => ({
        ...prev,
        autenticado: true,
        perfil: prev.perfil ?? {
          nombre,
          nivelEducativo: "",
          materia: "",
          pais: "",
          usoPrevioIA: "",
          mayorDesafio: "",
        },
      })),
    guardarPerfil: (perfil: PerfilDocente) =>
      setState((prev) => ({ ...prev, perfil })),
    guardarResultadoTmaid: (resultado: ResultadoTmaid) =>
      setState((prev) => ({ ...prev, resultadoTmaid: resultado })),
    actualizarProgresoFase: (fase: string, estado: EstadoFase) =>
      setState((prev) => ({
        ...prev,
        progresoRutas: { ...prev.progresoRutas, [fase]: estado },
      })),
    otorgarBadge: (badgeId: string) => {
      const yaLoTiene = state.badges.includes(badgeId);
      if (yaLoTiene) return false;
      const badge = BADGES[badgeId];
      setState((prev) => ({
        ...prev,
        badges: [...prev.badges, badgeId],
        puntos: prev.puntos + (badge?.puntos ?? 0),
      }));
      return true;
    },
    registrarActividadDiaria: () => {
      const hoy = new Date().toISOString().slice(0, 10);
      setState((prev) => {
        if (prev.ultimaFechaActiva === hoy) return prev;
        const ayer = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        const nuevaRacha =
          prev.ultimaFechaActiva === ayer ? prev.racha + 1 : 1;
        return { ...prev, ultimaFechaActiva: hoy, racha: nuevaRacha };
      });
    },
    reiniciar: () => {
      window.localStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
    },
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
