"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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

type SessionState = {
  autenticado: boolean;
  perfil: PerfilDocente | null;
  resultadoTmaid: ResultadoTmaid | null;
};

type SessionContextValue = SessionState & {
  iniciarSesionMock: (nombre: string) => void;
  guardarPerfil: (perfil: PerfilDocente) => void;
  guardarResultadoTmaid: (resultado: ResultadoTmaid) => void;
  reiniciar: () => void;
};

const STORAGE_KEY = "professor-ai:sesion-mock";

const defaultState: SessionState = {
  autenticado: false,
  perfil: null,
  resultadoTmaid: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw));
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
