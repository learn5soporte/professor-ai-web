/**
 * Deteccion de fallos de RED (logica pura, sin dependencias).
 *
 * Motivo: `supabase.auth.getUser()` descartaba su error y devolvia null ante
 * un fallo de red. Los guards de las pantallas leen eso como "no hay usuario"
 * y mandan a /login... donde el login tambien falla por la misma red caida.
 * Al docente le parece que perdio la cuenta y todo su avance.
 *
 * Un error de red NUNCA debe interpretarse como "no autenticado": significa
 * "no sabemos", y ahi lo correcto es seguir con el token local y avisar que
 * estamos sin conexion.
 */

const SEÑALES_DE_RED = [
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "network error",
  "network request failed",
  "load failed", // Safari
  "err_internet_disconnected",
  "err_network_changed",
  "err_name_not_resolved",
  "connection",
  "timeout",
  "timed out",
  "socket hang up",
];

const NOMBRES_DE_RED = [
  "authretryablefetcherror", // supabase-js: fetch fallido / 5xx reintentable
  "typeerror", // lo que lanza fetch() en el navegador cuando no hay red
  "aborterror",
  "networkerror",
];

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.toLowerCase() : "";
}

/**
 * true si el error parece un problema de conectividad (y no una respuesta
 * legitima del servidor tipo credenciales invalidas o RLS).
 */
export function esErrorDeRed(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "string") {
    return SEÑALES_DE_RED.some((s) => error.toLowerCase().includes(s));
  }

  if (typeof error !== "object") return false;

  const e = error as {
    message?: unknown;
    name?: unknown;
    status?: unknown;
    code?: unknown;
    cause?: unknown;
    __isAuthError?: unknown;
  };

  // supabase-js marca con status 0 (o sin status) lo que ni siquiera llego al
  // servidor. Un 4xx/5xx real SI llego: eso no es un fallo de red.
  if (typeof e.status === "number" && e.status > 0) {
    // 504/522/523/524 son cortes de red intermedios (gateway/CDN), no
    // respuestas de negocio del backend.
    if (![504, 522, 523, 524].includes(e.status)) return false;
    return true;
  }

  if (NOMBRES_DE_RED.includes(texto(e.name))) return true;

  const codigo = texto(e.code);
  if (codigo && SEÑALES_DE_RED.some((s) => codigo.includes(s))) return true;
  if (codigo === "econnreset" || codigo === "enotfound" || codigo === "etimedout") {
    return true;
  }

  const mensaje = texto(e.message);
  if (mensaje && SEÑALES_DE_RED.some((s) => mensaje.includes(s))) return true;

  if (e.cause && e.cause !== error) return esErrorDeRed(e.cause);

  return false;
}

/**
 * Señal complementaria del navegador. `navigator.onLine === false` es
 * confiable en negativo (si el SO dice que no hay red, no la hay); en
 * positivo no dice nada, por eso solo se usa para reforzar el mensaje al
 * docente, nunca para decidir si esta autenticado.
 */
export function navegadorSinConexion(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
