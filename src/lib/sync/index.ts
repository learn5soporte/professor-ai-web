import { ColaSync } from "./cola";
import { almacenLocal, CLAVE_COLA } from "./almacenamiento";
import { ejecutarOperacion } from "./ejecutor";

export { ColaSync, claveDe, RETARDOS_MS, MAX_INTENTOS } from "./cola";
export type {
  EntradaCola,
  EstadoSync,
  OperacionSync,
  Almacen,
  Reloj,
} from "./cola";
export { esErrorDeRed, navegadorSinConexion } from "./red";
export {
  limpiarDatosLocalesDocente,
  CLAVE_COLA,
  CLAVE_CACHE_SESION,
  CLAVE_IDIOMA,
} from "./almacenamiento";

let instancia: ColaSync | null = null;

/**
 * Cola unica del navegador. Se crea perezosamente (nunca durante el
 * prerender del export estatico, donde no hay window) y se reusa: si hubiera
 * dos instancias leyendo el mismo localStorage se pisarian entre si.
 */
export function obtenerCola(): ColaSync {
  if (!instancia) {
    instancia = new ColaSync({
      almacen: almacenLocal(CLAVE_COLA),
      ejecutar: ejecutarOperacion,
    });
  }
  return instancia;
}
