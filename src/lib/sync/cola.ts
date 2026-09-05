import type { EstadoFase, PerfilDocente, ResultadoTmaid } from "@/lib/store/session";

/**
 * Motor de la cola de sincronizacion -- LOGICA PURA.
 *
 * Este archivo no importa React, ni Supabase, ni toca `window`: recibe por
 * inyeccion su almacen (localStorage en la app, un objeto en memoria en los
 * tests), su ejecutor (las escrituras reales de src/lib/supabase/datos.ts) y
 * su reloj (setTimeout real o un reloj falso en los tests). Asi la parte
 * critica -- la que decide si el avance de un docente se pierde o no -- se
 * puede probar entera sin navegador ni red (ver __tests__/cola.test.ts).
 *
 * El problema que resuelve: antes, cada mutador de session.tsx actualizaba
 * el estado local y lanzaba la escritura a Supabase sin await y sin manejo de
 * fallo. Si la red fallaba, el docente veia confeti y XP y al dia siguiente
 * no habia nada guardado. Ahora toda escritura se ENCOLA PRIMERO (persistida
 * de forma sincrona en localStorage) y se EJECUTA DESPUES; si el navegador se
 * cierra a mitad del request, la operacion sigue en la cola al volver.
 *
 * Como todas las operaciones pueden re-ejecutarse (al reintentar, o tras un
 * cierre del navegador a mitad de camino), TODAS deben ser idempotentes:
 * perfil/tmaid/progreso son upserts, y `badge` se apoya en el unique
 * (usuario_id, badge_key) -- el 23505 del servidor es exito silencioso, no
 * doble XP (ver otorgarBadge en datos.ts).
 */

export type OperacionSync =
  | { tipo: "perfil"; perfil: PerfilDocente }
  | { tipo: "tmaid"; resultado: ResultadoTmaid }
  | { tipo: "progreso"; fase: string; estado: EstadoFase }
  | { tipo: "badge"; badgeId: string; puntos: number }
  | { tipo: "puntos"; cantidad: number }
  | { tipo: "actividad"; racha: number; ultimaFechaActiva: string | null };

export type EntradaCola = {
  id: string;
  /** Clave de deduplicacion -- ver claveDe(). */
  clave: string;
  /** Dueño de la operacion. Permite descartar lo de otro docente en tablets compartidas. */
  usuarioId: string;
  operacion: OperacionSync;
  intentos: number;
  creadoEn: number;
  /** Timestamp a partir del cual se puede volver a intentar (backoff). */
  proximoIntento: number;
};

export type EstadoSync = "ok" | "pendiente" | "error";

/** Backoff exponencial: 2s, 4s, 8s, 16s, 32s, 60s. */
export const RETARDOS_MS = [2000, 4000, 8000, 16000, 32000, 60000];

export const MAX_INTENTOS = RETARDOS_MS.length;

export const VERSION_COLA = 1;

export type Almacen = {
  leer(): string | null;
  escribir(valor: string): void;
  borrar(): void;
};

export type Reloj = {
  ahora(): number;
  programar(fn: () => void, ms: number): unknown;
  cancelar(handle: unknown): void;
};

export const relojReal: Reloj = {
  ahora: () => Date.now(),
  programar: (fn, ms) => setTimeout(fn, ms),
  cancelar: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export const almacenMemoria = (): Almacen => {
  let valor: string | null = null;
  return {
    leer: () => valor,
    escribir: (v) => {
      valor = v;
    },
    borrar: () => {
      valor = null;
    },
  };
};

export type OpcionesCola = {
  almacen: Almacen;
  /** Escritura real. Debe RECHAZAR (throw) si no se pudo persistir en el servidor. */
  ejecutar: (entrada: EntradaCola) => Promise<void>;
  reloj?: Reloj;
  retardos?: number[];
  generarId?: () => string;
};

/**
 * Deduplicacion. La regla: si una operacion nueva deja obsoleta a una vieja
 * todavia pendiente, comparten clave y la nueva REEMPLAZA a la vieja (no
 * tiene sentido mandar dos veces el mismo perfil, ni el estado viejo de una
 * fase). Las que NO se pueden deduplicar son las acumulativas: `puntos` suma
 * un delta, asi que cada una lleva clave unica y se manda entera.
 */
export function claveDe(operacion: OperacionSync, id: string): string {
  switch (operacion.tipo) {
    case "perfil":
      return "perfil";
    case "tmaid":
      return "tmaid";
    case "progreso":
      return `progreso:${operacion.fase}`;
    case "badge":
      // El badge se deduplica por id: pedirlo dos veces no debe dar doble XP.
      // La segunda linea de defensa es el unique del servidor (23505).
      return `badge:${operacion.badgeId}`;
    case "actividad":
      // `racha` es un valor absoluto recalculado en cada llamada, no un
      // delta: la version mas nueva ya contiene lo que decia la vieja.
      return "actividad";
    case "puntos":
      return `puntos:${id}`;
  }
}

type Persistido = { v: number; operaciones: EntradaCola[] };

function esEntradaValida(x: unknown): x is EntradaCola {
  if (!x || typeof x !== "object") return false;
  const e = x as Partial<EntradaCola>;
  return (
    typeof e.id === "string" &&
    typeof e.clave === "string" &&
    typeof e.usuarioId === "string" &&
    typeof e.intentos === "number" &&
    typeof e.creadoEn === "number" &&
    typeof e.proximoIntento === "number" &&
    Boolean(e.operacion) &&
    typeof (e.operacion as OperacionSync).tipo === "string"
  );
}

export class ColaSync {
  private entradas: EntradaCola[] = [];
  private readonly almacen: Almacen;
  private readonly ejecutar: (entrada: EntradaCola) => Promise<void>;
  private readonly reloj: Reloj;
  private readonly retardos: number[];
  private readonly generarId: () => string;
  private readonly suscriptores = new Set<(estado: EstadoSync) => void>();
  private enCurso: Promise<void> | null = null;
  private temporizador: unknown = null;
  private contador = 0;

  constructor(opciones: OpcionesCola) {
    this.almacen = opciones.almacen;
    this.ejecutar = opciones.ejecutar;
    this.reloj = opciones.reloj ?? relojReal;
    this.retardos = opciones.retardos ?? RETARDOS_MS;
    this.generarId =
      opciones.generarId ??
      (() => `${this.reloj.ahora().toString(36)}-${(this.contador += 1).toString(36)}`);
    this.entradas = this.cargar();
  }

  // -------------------------------------------------------------------------
  // Persistencia
  // -------------------------------------------------------------------------

  private cargar(): EntradaCola[] {
    let crudo: string | null = null;
    try {
      crudo = this.almacen.leer();
    } catch {
      return [];
    }
    if (!crudo) return [];
    try {
      const datos = JSON.parse(crudo) as Partial<Persistido>;
      if (!datos || !Array.isArray(datos.operaciones)) return [];
      return datos.operaciones.filter(esEntradaValida);
    } catch {
      // Cola corrupta o de otra version: preferimos empezar limpio antes que
      // romper el arranque de la app.
      return [];
    }
  }

  private persistir(): void {
    try {
      if (this.entradas.length === 0) {
        this.almacen.borrar();
        return;
      }
      const datos: Persistido = { v: VERSION_COLA, operaciones: this.entradas };
      this.almacen.escribir(JSON.stringify(datos));
    } catch {
      // localStorage lleno o bloqueado (modo privado estricto): la cola sigue
      // viva en memoria para esta sesion, que es lo mejor que podemos hacer.
    }
  }

  // -------------------------------------------------------------------------
  // Estado observable
  // -------------------------------------------------------------------------

  estado(): EstadoSync {
    if (this.entradas.some((e) => e.intentos >= this.retardos.length)) return "error";
    if (this.entradas.length > 0) return "pendiente";
    return "ok";
  }

  pendientes(): number {
    return this.entradas.length;
  }

  /** Copia defensiva -- solo para tests y diagnostico. */
  instantanea(): EntradaCola[] {
    return this.entradas.map((e) => ({ ...e }));
  }

  suscribir(fn: (estado: EstadoSync) => void): () => void {
    this.suscriptores.add(fn);
    fn(this.estado());
    return () => {
      this.suscriptores.delete(fn);
    };
  }

  private notificar(): void {
    const estado = this.estado();
    this.suscriptores.forEach((fn) => fn(estado));
  }

  // -------------------------------------------------------------------------
  // API principal
  // -------------------------------------------------------------------------

  /**
   * Encola y persiste de forma SINCRONA, y recien despues dispara el
   * procesamiento. Ese orden es lo que hace que un cierre del navegador a
   * mitad del request no pierda el avance.
   */
  encolar(usuarioId: string, operacion: OperacionSync): EntradaCola {
    const id = this.generarId();
    const clave = claveDe(operacion, id);
    const entrada: EntradaCola = {
      id,
      clave,
      usuarioId,
      operacion,
      intentos: 0,
      creadoEn: this.reloj.ahora(),
      proximoIntento: 0,
    };

    const idx = this.entradas.findIndex(
      (e) => e.clave === clave && e.usuarioId === usuarioId
    );
    if (idx >= 0) {
      // Reemplazo en el MISMO lugar de la fila (se respeta el orden de
      // llegada original) y con id nuevo: si la vieja estaba justo
      // ejecutandose, al terminar se auto-elimina por su id viejo y no se
      // lleva por delante este dato mas fresco.
      this.entradas[idx] = entrada;
    } else {
      this.entradas.push(entrada);
    }

    this.persistir();
    this.notificar();
    void this.procesar();
    return entrada;
  }

  /**
   * Tablets compartidas de sala de profesores: al iniciar sesion otro
   * docente, lo que quedo encolado del anterior no debe escribirse (ni podria
   * -- las policies RLS lo rechazarian) ni contarse como "pendiente" suyo.
   */
  descartarDeOtroUsuario(usuarioId: string): number {
    const antes = this.entradas.length;
    this.entradas = this.entradas.filter((e) => e.usuarioId === usuarioId);
    const descartadas = antes - this.entradas.length;
    if (descartadas > 0) {
      this.persistir();
      this.notificar();
    }
    return descartadas;
  }

  limpiar(): void {
    this.cancelarTemporizador();
    this.entradas = [];
    try {
      this.almacen.borrar();
    } catch {
      // ignorar
    }
    this.notificar();
  }

  /** Reintento manual (boton del SyncIndicator): borra el backoff y reintenta ya. */
  reintentar(): Promise<void> {
    this.entradas.forEach((e) => {
      e.intentos = 0;
      e.proximoIntento = 0;
    });
    this.persistir();
    this.notificar();
    return this.procesar();
  }

  /**
   * Intenta vaciar la cola antes de un logout, sin colgar la UI: reintenta
   * ignorando el backoff y se rinde a los `timeoutMs`. Devuelve true si quedo
   * vacia. Lo que no se pudo mandar se pierde al limpiar el localStorage del
   * docente saliente -- es el precio de no filtrarle sus datos al siguiente.
   */
  async esperarVacia(timeoutMs: number): Promise<boolean> {
    if (this.entradas.length === 0) return true;
    this.entradas.forEach((e) => {
      e.proximoIntento = 0;
    });
    let vencido = false;
    const t = this.reloj.programar(() => {
      vencido = true;
    }, timeoutMs);
    try {
      await Promise.race([
        (async () => {
          let antes = -1;
          while (this.entradas.length > 0 && this.entradas.length !== antes && !vencido) {
            antes = this.entradas.length;
            await this.procesar();
          }
        })(),
        new Promise<void>((resolver) => {
          this.reloj.programar(resolver, timeoutMs);
        }),
      ]);
    } finally {
      this.reloj.cancelar(t);
    }
    return this.entradas.length === 0;
  }

  // -------------------------------------------------------------------------
  // Procesamiento
  // -------------------------------------------------------------------------

  /**
   * Procesa la cola en orden de llegada, de a una operacion por vez. Si una
   * falla, se detiene ahi y reprograma (asi no se adelanta una escritura que
   * dependia de otra anterior). La unica excepcion son las entradas que ya
   * agotaron sus reintentos: esas se saltan -- quedan en la cola marcando el
   * estado "error" para el reintento manual, pero no bloquean para siempre
   * todo lo que venga despues.
   *
   * Llamadas concurrentes devuelven la misma promesa en curso.
   */
  procesar(): Promise<void> {
    if (this.enCurso) return this.enCurso;
    this.enCurso = this.bucle().finally(() => {
      this.enCurso = null;
      this.notificar();
      if (this.hayListas()) {
        this.temporizador = this.reloj.programar(() => {
          this.temporizador = null;
          void this.procesar();
        }, 0);
      }
    });
    return this.enCurso;
  }

  /**
   * ¿Quedo algo que `bucle()` podria procesar YA? Mira exactamente la misma
   * entrada que elegiria el bucle (la primera no agotada) y no "alguna": si
   * mirara cualquiera, una entrada en backoff al frente de la fila + otra
   * lista detras se convertirian en un re-agendado infinito cada 0ms.
   */
  private hayListas(): boolean {
    const entrada = this.entradas.find((e) => e.intentos < this.retardos.length);
    return Boolean(entrada && entrada.proximoIntento <= this.reloj.ahora());
  }

  private async bucle(): Promise<void> {
    for (;;) {
      const ahora = this.reloj.ahora();
      const entrada = this.entradas.find((e) => e.intentos < this.retardos.length);
      if (!entrada) return;
      if (entrada.proximoIntento > ahora) {
        this.programarReintento(entrada.proximoIntento - ahora);
        return;
      }
      try {
        await this.ejecutar(entrada);
        this.quitar(entrada.id);
      } catch {
        entrada.intentos += 1;
        const espera = this.retardoPara(entrada.intentos);
        entrada.proximoIntento = this.reloj.ahora() + espera;
        this.persistir();
        if (entrada.intentos < this.retardos.length) {
          this.programarReintento(espera);
        }
        // Se corta el barrido: la siguiente operacion espera su turno.
        return;
      }
    }
  }

  private retardoPara(intentos: number): number {
    const idx = Math.min(Math.max(intentos, 1), this.retardos.length) - 1;
    return this.retardos[idx];
  }

  private quitar(id: string): void {
    const antes = this.entradas.length;
    this.entradas = this.entradas.filter((e) => e.id !== id);
    if (this.entradas.length !== antes) this.persistir();
  }

  private cancelarTemporizador(): void {
    if (this.temporizador !== null) {
      this.reloj.cancelar(this.temporizador);
      this.temporizador = null;
    }
  }

  private programarReintento(ms: number): void {
    this.cancelarTemporizador();
    this.temporizador = this.reloj.programar(() => {
      this.temporizador = null;
      void this.procesar();
    }, ms);
  }
}
