"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BADGES } from "@/lib/gamification/badges";
import {
  supabaseConfigurado,
  registrarUsuario as registrarUsuarioSupabase,
  iniciarSesion as iniciarSesionSupabase,
  cerrarSesion as cerrarSesionSupabase,
  obtenerUsuarioActual,
  cargarSesionCompleta,
  guardarPerfilDocente as guardarPerfilDocenteSupabase,
  guardarResultadoTmaid as guardarResultadoTmaidSupabase,
  actualizarProgresoFase as actualizarProgresoFaseSupabase,
  otorgarBadge as otorgarBadgeSupabase,
  registrarActividadDiaria as registrarActividadDiariaSupabase,
  reenviarConfirmacion as reenviarConfirmacionSupabase,
} from "@/lib/supabase/datos";

/**
 * Sesion del docente -- Fase 1.1.
 *
 * Dos backends posibles, decididos en tiempo de build por
 * supabaseConfigurado() (ver src/lib/supabase/datos.ts):
 *  - Sin NEXT_PUBLIC_SUPABASE_URL/ANON_KEY (como en cada deploy hasta ahora):
 *    todo sigue exactamente igual que en Fase 0 -- Context + localStorage,
 *    mismo comportamiento byte-a-byte que antes de esta migracion.
 *  - Con esas variables presentes (secrets de GitHub Actions): el
 *    registro/login/lectura/escritura pasan a ser llamadas reales a
 *    Supabase, con Row Level Security protegiendo los datos de cada
 *    docente. El shape de SessionState es identico en ambos casos, asi que
 *    ninguna otra pantalla de la app necesito cambios para este soporte
 *    dual -- solo login/page.tsx y registro/page.tsx (que ahora piden
 *    email+password reales en vez de simular la sesion con solo el email).
 *
 * Patron usado para los mutadores (guardarPerfil, otorgarBadge, etc.):
 * actualizacion local optimista SINCRONA (identica a la de antes) + una
 * escritura a Supabase en segundo plano ("fire and forget", con
 * console.error si falla) cuando usarSupabase es true. Esto evita tener que
 * tocar cada pantalla que llama a estos mutadores -- todas siguen
 * llamandolos exactamente igual, de forma sincrona.
 */

export type PerfilDocente = {
  nombre: string;
  nivelEducativo: string;
  materia: string;
  pais: string;
  usoPrevioIA: string;
  mayorDesafio: string;
  /** Paso 4 del onboarding real de Stitch: "¿Qué quieres lograr?" */
  objetivoPrincipal: string;
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

type ResultadoAuth = {
  error: string | null;
  tienePerfil: boolean;
  /** true si el error es específicamente "el email todavía no está confirmado" -- permite mostrar un botón de reenvío en vez de solo el mensaje. */
  requiereConfirmacion?: boolean;
  /** true si el error es específicamente "ya existe una cuenta con este email" -- permite ofrecer un link directo a /login. */
  yaExiste?: boolean;
};

type SessionContextValue = SessionState & {
  cargando: boolean;
  /** true si el deploy actual tiene credenciales reales de Supabase. */
  usarSupabase: boolean;
  iniciarSesionMock: (nombre: string) => void;
  /** Alta real (o mock, segun usarSupabase) -- usado por /registro. */
  registrar: (email: string, password: string, nombre: string) => Promise<ResultadoAuth>;
  /** Login real (o mock, segun usarSupabase) -- usado por /login. */
  iniciarSesion: (email: string, password: string) => Promise<ResultadoAuth>;
  /** Reenvía el correo de confirmación de cuenta. No-op (sin error) si usarSupabase es false. */
  reenviarConfirmacion: (email: string) => Promise<{ error: string | null }>;
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

/**
 * Traduce los mensajes de error crudos de Supabase Auth (siempre en
 * inglés) a texto claro en español para el docente. Usa coincidencia de
 * substring porque Supabase no expone códigos de error estables para todos
 * los casos -- solo el texto del mensaje.
 */
function mensajeCrudo(e: unknown): string | null {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return null;
}

/**
 * Un objeto PerfilDocente puede existir pero estar "vacío" -- tanto
 * cargarSesionCompleta() (cuando solo hay fila en `usuarios` pero nunca se
 * llenó `perfil_docente`) como iniciarSesionMockInterno() crean un
 * placeholder con nivelEducativo/materia/etc en "" apenas se inicia
 * sesión, antes de pasar por /onboarding. Usar Boolean(perfil) a secas
 * para decidir si ya completó el onboarding manda a un docente nuevo
 * directo a /dashboard con un perfil en blanco. nivelEducativo es el
 * primer campo requerido del onboarding, así que su presencia es una
 * señal confiable de que el flujo se completó.
 */
export function perfilCompleto(perfil: PerfilDocente | null): boolean {
  return Boolean(perfil && perfil.nivelEducativo.trim().length > 0);
}

function traducirErrorSupabase(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("email rate limit exceeded")) {
    return "Supabase limitó el envío de correos de confirmación por ahora (pasa cuando se registran muchas cuentas seguidas en poco tiempo con el plan gratuito). Espera unos minutos e intenta de nuevo, o pide que desactiven \"Confirm email\" en Supabase mientras se prueba.";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "Ya existe una cuenta con este email. Intenta iniciar sesión en vez de registrarte.";
  }
  if (m.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (m.includes("email not confirmed")) {
    return "Todavía no confirmaste tu email. Revisa tu bandeja de entrada (o la carpeta de spam) y haz clic en el enlace de confirmación antes de iniciar sesión.";
  }
  if (m.includes("password") && m.includes("6 characters")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (m.includes("invalid format") || m.includes("unable to validate email")) {
    return "El email no tiene un formato válido.";
  }
  if (m.includes("failed to fetch") || m.includes("networkerror")) {
    return "No se pudo conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.";
  }
  return mensaje;
}

export function mensajeError(e: unknown): string {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
    return traducirErrorSupabase((e as { message: string }).message);
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const usarSupabase = supabaseConfigurado();
  const [state, setState] = useState<SessionState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const usuarioIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    if (usarSupabase) {
      obtenerUsuarioActual()
        .then(async (usuario) => {
          if (cancelado) return;
          if (!usuario) {
            setHydrated(true);
            return;
          }
          usuarioIdRef.current = usuario.id;
          const sesion = await cargarSesionCompleta();
          if (cancelado) return;
          if (sesion) setState((prev) => ({ ...prev, ...sesion }));
          setHydrated(true);
        })
        .catch(() => {
          if (!cancelado) setHydrated(true);
        });
      return () => {
        cancelado = true;
      };
    }

    // Fallback localStorage -- identico al comportamiento de Fase 0.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState({ ...defaultState, ...JSON.parse(raw) });
      } catch {
        // localStorage corrupto o de otra version: ignorar y empezar de cero
      }
    }
    setHydrated(true);
  }, [usarSupabase]);

  useEffect(() => {
    if (hydrated && !usarSupabase) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated, usarSupabase]);

  function iniciarSesionMockInterno(nombre: string) {
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
        objetivoPrincipal: "",
      },
    }));
  }

  const value: SessionContextValue = {
    ...state,
    cargando: !hydrated,
    usarSupabase,

    iniciarSesionMock: iniciarSesionMockInterno,

    registrar: async (email, password, nombre) => {
      if (!usarSupabase) {
        iniciarSesionMockInterno(nombre);
        return { error: null, tienePerfil: false };
      }
      try {
        const { usuario, sesionActiva } = await registrarUsuarioSupabase(email, password, nombre);
        if (!usuario) {
          return { error: "No se pudo crear la cuenta. Intenta de nuevo.", tienePerfil: false };
        }
        if (!sesionActiva) {
          // "Confirm email" esta activo en el proyecto: la cuenta se creo
          // pero todavia no hay sesion -- el docente tiene que confirmar el
          // correo antes de poder usar la app. No hay perfil ni dashboard
          // que mostrar todavia, asi que no tratamos esto como un login.
          return { error: null, tienePerfil: false, requiereConfirmacion: true };
        }
        usuarioIdRef.current = usuario.id;
        setState((prev) => ({ ...prev, autenticado: true }));
        return { error: null, tienePerfil: false };
      } catch (e) {
        const crudo = mensajeCrudo(e);
        const yaExiste = Boolean(crudo && crudo.toLowerCase().includes("already registered"));
        return { error: mensajeError(e), tienePerfil: false, yaExiste };
      }
    },

    iniciarSesion: async (email, password) => {
      if (!usarSupabase) {
        const nombre = email.split("@")[0] || "Docente";
        iniciarSesionMockInterno(nombre);
        return { error: null, tienePerfil: perfilCompleto(state.perfil) };
      }
      try {
        await iniciarSesionSupabase(email, password);
        const usuario = await obtenerUsuarioActual();
        usuarioIdRef.current = usuario?.id ?? null;
        const sesion = await cargarSesionCompleta();
        if (sesion) {
          setState((prev) => ({ ...prev, ...sesion }));
          return { error: null, tienePerfil: perfilCompleto(sesion.perfil) };
        }
        return { error: null, tienePerfil: false };
      } catch (e) {
        const crudo = mensajeCrudo(e);
        const requiereConfirmacion = Boolean(crudo && crudo.toLowerCase().includes("email not confirmed"));
        return { error: mensajeError(e), tienePerfil: false, requiereConfirmacion };
      }
    },

    reenviarConfirmacion: async (email: string) => {
      if (!usarSupabase) return { error: null };
      try {
        await reenviarConfirmacionSupabase(email);
        return { error: null };
      } catch (e) {
        return { error: mensajeError(e) };
      }
    },

    guardarPerfil: (perfil: PerfilDocente) => {
      setState((prev) => ({ ...prev, perfil }));
      if (usarSupabase && usuarioIdRef.current) {
        guardarPerfilDocenteSupabase(usuarioIdRef.current, perfil).catch((e) =>
          console.error("guardarPerfilDocente", e)
        );
      }
    },

    guardarResultadoTmaid: (resultado: ResultadoTmaid) => {
      setState((prev) => ({ ...prev, resultadoTmaid: resultado }));
      if (usarSupabase && usuarioIdRef.current) {
        guardarResultadoTmaidSupabase(usuarioIdRef.current, resultado).catch((e) =>
          console.error("guardarResultadoTmaid", e)
        );
      }
    },

    actualizarProgresoFase: (fase: string, estado: EstadoFase) => {
      setState((prev) => ({
        ...prev,
        progresoRutas: { ...prev.progresoRutas, [fase]: estado },
      }));
      if (usarSupabase && usuarioIdRef.current) {
        actualizarProgresoFaseSupabase(usuarioIdRef.current, fase, estado).catch((e) =>
          console.error("actualizarProgresoFase", e)
        );
      }
    },

    otorgarBadge: (badgeId: string) => {
      const yaLoTiene = state.badges.includes(badgeId);
      if (yaLoTiene) return false;
      const badge = BADGES[badgeId];
      setState((prev) => ({
        ...prev,
        badges: [...prev.badges, badgeId],
        puntos: prev.puntos + (badge?.puntos ?? 0),
      }));
      if (usarSupabase && usuarioIdRef.current) {
        otorgarBadgeSupabase(usuarioIdRef.current, badgeId, badge?.puntos ?? 0).catch((e) =>
          console.error("otorgarBadge", e)
        );
      }
      return true;
    },

    registrarActividadDiaria: () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const racha0 = state.racha;
      const ultimaFechaActiva0 = state.ultimaFechaActiva;
      setState((prev) => {
        if (prev.ultimaFechaActiva === hoy) return prev;
        const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const nuevaRacha = prev.ultimaFechaActiva === ayer ? prev.racha + 1 : 1;
        return { ...prev, ultimaFechaActiva: hoy, racha: nuevaRacha };
      });
      if (usarSupabase && usuarioIdRef.current && ultimaFechaActiva0 !== hoy) {
        registrarActividadDiariaSupabase(usuarioIdRef.current, racha0, ultimaFechaActiva0).catch((e) =>
          console.error("registrarActividadDiaria", e)
        );
      }
    },

    reiniciar: () => {
      if (usarSupabase) {
        cerrarSesionSupabase().catch((e) => console.error("cerrarSesion", e));
        usuarioIdRef.current = null;
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
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
