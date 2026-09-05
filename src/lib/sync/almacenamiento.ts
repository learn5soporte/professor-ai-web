import type { Almacen } from "./cola";

/**
 * Claves de localStorage de la app y helpers para leerlas/borrarlas sin que
 * un localStorage bloqueado (modo privado estricto de Safari, o un navegador
 * con cookies de terceros deshabilitadas) tumbe la app.
 */

export const PREFIJO_APP = "professor-ai:";

/** Cola de escrituras pendientes hacia Supabase. */
export const CLAVE_COLA = "professor-ai:cola-sync";

/** Ultimo estado bueno de la sesion, para poder arrancar sin red. */
export const CLAVE_CACHE_SESION = "professor-ai:sesion-cache";

/**
 * Preferencia de idioma. Es la UNICA clave `professor-ai:*` que sobrevive a
 * un cierre de sesion: no es dato del docente, es una preferencia del
 * dispositivo (la tablet de la sala de profesores en un campus bilingüe
 * deberia quedarse en el idioma que dejo configurado la facultad).
 */
export const CLAVE_IDIOMA = "professor-ai:idioma";

function almacenamientoDisponible(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Adaptador Almacen (ver cola.ts) sobre una clave concreta de localStorage. */
export function almacenLocal(clave: string): Almacen {
  return {
    leer() {
      try {
        return almacenamientoDisponible()?.getItem(clave) ?? null;
      } catch {
        return null;
      }
    },
    escribir(valor: string) {
      try {
        almacenamientoDisponible()?.setItem(clave, valor);
      } catch {
        // sin espacio o sin permiso: seguimos solo en memoria
      }
    },
    borrar() {
      try {
        almacenamientoDisponible()?.removeItem(clave);
      } catch {
        // ignorar
      }
    },
  };
}

/**
 * Borra TODO rastro del docente que se va (cola de sync, cache de sesion,
 * sesion mock, reflexiones de los retos, prompts guardados, borrador de
 * rubrica, aviso de demo...) menos la preferencia de idioma.
 *
 * Antes `reiniciar()` solo borraba `professor-ai:sesion-mock`, asi que en una
 * tablet compartida el siguiente docente entraba y veia las reflexiones y los
 * prompts del anterior. Se borra por PREFIJO en vez de por lista para que
 * cualquier clave nueva que agregue la app quede cubierta por defecto.
 */
export function limpiarDatosLocalesDocente(): void {
  const storage = almacenamientoDisponible();
  if (!storage) return;
  try {
    const aBorrar: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const clave = storage.key(i);
      if (!clave) continue;
      if (!clave.startsWith(PREFIJO_APP)) continue;
      if (clave === CLAVE_IDIOMA) continue;
      aBorrar.push(clave);
    }
    aBorrar.forEach((clave) => storage.removeItem(clave));
  } catch {
    // ignorar
  }
}
