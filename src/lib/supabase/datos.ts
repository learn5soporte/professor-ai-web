import { createClient } from "@/lib/supabase/client";
import type { EstadoFase, PerfilDocente, ResultadoTmaid } from "@/lib/store/session";

/**
 * Capa de datos real de Supabase — Fase 1.1.
 *
 * Conectada desde `session.tsx`: cuando `supabaseConfigurado()` es true
 * (credenciales reales presentes en el build vía secrets de GitHub
 * Actions), el SessionProvider delega auth/lectura/escritura a las
 * funciones de aqui en vez de a localStorage. Si no hay credenciales
 * (deploys sin los secrets configurados), nada de este archivo se
 * ejecuta y la app se comporta igual que en Fase 0.
 *
 * Esquema de referencia: supabase/migrations/0001_init.sql +
 * 0002_professor_ai_schema.sql.
 */

export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ---------------------------------------------------------------------------
// Autenticacion
// ---------------------------------------------------------------------------

export async function registrarUsuario(email: string, password: string, nombre: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) throw error;
  return data.user;
}

export async function iniciarSesion(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function cerrarSesion() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Reenvía el correo de confirmación de cuenta (Supabase Auth). Útil cuando
 * el login falla con "Email not confirmed" -- el docente puede pedir que
 * se lo manden de nuevo sin tener que registrarse otra vez. Sujeto al
 * mismo límite de envíos por hora del plan gratuito de Supabase que
 * "email rate limit exceeded" ya cubre en session.tsx.
 */
export async function reenviarConfirmacion(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

export async function obtenerUsuarioActual() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ---------------------------------------------------------------------------
// Lectura combinada — reconstruye el mismo shape que SessionState
// (session.tsx) a partir de usuarios + perfil_docente + resultado_tmaid +
// progreso + badges, para que conectar esto a session.tsx sea un cambio
// mecanico (mismo shape de salida) en vez de tener que re-derivar tipos.
// ---------------------------------------------------------------------------

export type SesionSupabase = {
  autenticado: boolean;
  perfil: PerfilDocente | null;
  resultadoTmaid: ResultadoTmaid | null;
  progresoRutas: Record<string, EstadoFase>;
  badges: string[];
  puntos: number;
  racha: number;
  ultimaFechaActiva: string | null;
};

export async function cargarSesionCompleta(): Promise<SesionSupabase | null> {
  const supabase = createClient();
  const { data: userData, error: errorUsuario } = await supabase.auth.getUser();
  if (errorUsuario) throw errorUsuario;
  const usuario = userData.user;
  if (!usuario) return null;

  const [usuariosRes, perfilRes, resultadoRes, progresoRes, badgesRes] = await Promise.all([
    supabase
      .from("usuarios")
      .select("nombre, puntos, racha, ultima_fecha_activa")
      .eq("id", usuario.id)
      .maybeSingle(),
    supabase.from("perfil_docente").select("*").eq("usuario_id", usuario.id).maybeSingle(),
    supabase.from("resultado_tmaid").select("*").eq("usuario_id", usuario.id).maybeSingle(),
    supabase.from("progreso").select("fase, estado").eq("usuario_id", usuario.id),
    supabase.from("badges").select("badge_key").eq("usuario_id", usuario.id),
  ]);

  for (const res of [usuariosRes, perfilRes, resultadoRes, progresoRes, badgesRes]) {
    if (res.error) throw res.error;
  }

  const nombreCuenta = usuariosRes.data?.nombre ?? "";

  const perfil: PerfilDocente | null = perfilRes.data
    ? {
        nombre: nombreCuenta,
        nivelEducativo: perfilRes.data.nivel_educativo ?? "",
        materia: perfilRes.data.materia ?? "",
        pais: perfilRes.data.pais ?? "",
        usoPrevioIA: perfilRes.data.uso_previo_ia ?? "",
        mayorDesafio: perfilRes.data.mayor_desafio ?? "",
        objetivoPrincipal: perfilRes.data.objetivo_principal ?? "",
      }
    : usuariosRes.data
      ? {
          nombre: nombreCuenta,
          nivelEducativo: "",
          materia: "",
          pais: "",
          usoPrevioIA: "",
          mayorDesafio: "",
          objetivoPrincipal: "",
        }
      : null;

  const resultadoTmaid: ResultadoTmaid | null = resultadoRes.data
    ? {
        nivelAsignado: resultadoRes.data.nivel_asignado,
        puntajePromedio: Number(resultadoRes.data.puntaje_promedio ?? 0),
        dimensiones: {
          conocimientoIA: Number(resultadoRes.data.dimension_conocimiento_ia ?? 0),
          usoHerramientas: Number(resultadoRes.data.dimension_uso_herramientas ?? 0),
          integracionAula: Number(resultadoRes.data.dimension_integracion_aula ?? 0),
          actitudCambio: Number(resultadoRes.data.dimension_actitud_cambio ?? 0),
        },
        perfilPedagogicoIA: resultadoRes.data.perfil_pedagogico_ia ?? "",
        mapaBrechas: resultadoRes.data.mapa_brechas ?? [],
        rutaPersonalizada: resultadoRes.data.ruta_personalizada ?? [],
      }
    : null;

  const progresoRutas: Record<string, EstadoFase> = {};
  (progresoRes.data ?? []).forEach((fila: { fase: string; estado: EstadoFase }) => {
    progresoRutas[fila.fase] = fila.estado;
  });

  const badges = (badgesRes.data ?? []).map((fila: { badge_key: string }) => fila.badge_key);

  return {
    autenticado: true,
    perfil,
    resultadoTmaid,
    progresoRutas,
    badges,
    puntos: usuariosRes.data?.puntos ?? 0,
    racha: usuariosRes.data?.racha ?? 0,
    ultimaFechaActiva: usuariosRes.data?.ultima_fecha_activa ?? null,
  };
}

// ---------------------------------------------------------------------------
// Escrituras — un espejo async de cada mutador de SessionContextValue
// ---------------------------------------------------------------------------

export async function guardarPerfilDocente(usuarioId: string, perfil: PerfilDocente) {
  const supabase = createClient();

  const { error: errorUsuario } = await supabase
    .from("usuarios")
    .update({ nombre: perfil.nombre })
    .eq("id", usuarioId);
  if (errorUsuario) throw errorUsuario;

  const { error } = await supabase.from("perfil_docente").upsert(
    {
      usuario_id: usuarioId,
      nivel_educativo: perfil.nivelEducativo,
      materia: perfil.materia,
      pais: perfil.pais,
      uso_previo_ia: perfil.usoPrevioIA,
      mayor_desafio: perfil.mayorDesafio,
      objetivo_principal: perfil.objetivoPrincipal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "usuario_id" }
  );
  if (error) throw error;
}

export async function guardarResultadoTmaid(usuarioId: string, resultado: ResultadoTmaid) {
  const supabase = createClient();
  const { error } = await supabase.from("resultado_tmaid").upsert(
    {
      usuario_id: usuarioId,
      nivel_asignado: resultado.nivelAsignado,
      puntaje_promedio: resultado.puntajePromedio,
      dimension_conocimiento_ia: resultado.dimensiones.conocimientoIA,
      dimension_uso_herramientas: resultado.dimensiones.usoHerramientas,
      dimension_integracion_aula: resultado.dimensiones.integracionAula,
      dimension_actitud_cambio: resultado.dimensiones.actitudCambio,
      perfil_pedagogico_ia: resultado.perfilPedagogicoIA,
      mapa_brechas: resultado.mapaBrechas,
      ruta_personalizada: resultado.rutaPersonalizada,
    },
    { onConflict: "usuario_id" }
  );
  if (error) throw error;
}

export async function actualizarProgresoFase(
  usuarioId: string,
  fase: string,
  estado: EstadoFase
) {
  const supabase = createClient();
  const { error } = await supabase.from("progreso").upsert(
    { usuario_id: usuarioId, fase, estado, updated_at: new Date().toISOString() },
    { onConflict: "usuario_id,fase" }
  );
  if (error) throw error;
}

/**
 * Otorga un badge y suma sus puntos de forma atomica (ver funcion SQL
 * incrementar_puntos en 0002_professor_ai_schema.sql). Devuelve false si el
 * usuario ya tenia el badge (igual que otorgarBadge en session.tsx hoy).
 */
export async function otorgarBadge(
  usuarioId: string,
  badgeId: string,
  puntosBadge: number
): Promise<boolean> {
  const supabase = createClient();
  const { error: errorInsert, data } = await supabase
    .from("badges")
    .insert({ usuario_id: usuarioId, badge_key: badgeId })
    .select();

  if (errorInsert) {
    // 23505 = unique_violation (usuario_id, badge_key) -> ya lo tenia, no
    // es un error real.
    if ((errorInsert as { code?: string }).code === "23505") return false;
    throw errorInsert;
  }
  if (!data || data.length === 0) return false;

  const { error: errorPuntos } = await supabase.rpc("incrementar_puntos", {
    p_usuario_id: usuarioId,
    p_delta: puntosBadge,
  });
  if (errorPuntos) throw errorPuntos;
  return true;
}

/**
 * Espejo de registrarActividadDiaria en session.tsx, pero escribiendo la
 * racha en `usuarios` en vez de en localStorage. Devuelve el nuevo valor
 * para que quien llame pueda actualizar el estado local sin releer.
 */
export async function registrarActividadDiaria(
  usuarioId: string,
  racha: number,
  ultimaFechaActiva: string | null
): Promise<{ racha: number; ultimaFechaActiva: string }> {
  const hoy = new Date().toISOString().slice(0, 10);
  if (ultimaFechaActiva === hoy) {
    return { racha, ultimaFechaActiva: hoy };
  }

  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nuevaRacha = ultimaFechaActiva === ayer ? racha + 1 : 1;

  const supabase = createClient();
  const { error } = await supabase
    .from("usuarios")
    .update({ racha: nuevaRacha, ultima_fecha_activa: hoy })
    .eq("id", usuarioId);
  if (error) throw error;

  return { racha: nuevaRacha, ultimaFechaActiva: hoy };
}
