import {
  guardarPerfilDocente,
  guardarResultadoTmaid,
  actualizarProgresoFase,
  otorgarBadge,
  sumarPuntos,
  registrarActividadDiaria,
} from "@/lib/supabase/datos";
import type { EntradaCola } from "./cola";

/**
 * Puente entre el motor de la cola (logica pura) y las escrituras reales de
 * Supabase. Vive aparte justamente para que cola.ts se pueda testear sin
 * Supabase ni red.
 *
 * Contrato: esta funcion debe RECHAZAR si la escritura no quedo confirmada en
 * el servidor. Todo lo que resuelva se considera guardado y se saca de la
 * cola. Cada operacion es idempotente (upserts + el unique de badges), asi
 * que un reintento de algo que si habia llegado no duplica nada.
 */
export async function ejecutarOperacion(entrada: EntradaCola): Promise<void> {
  const { usuarioId, operacion } = entrada;
  switch (operacion.tipo) {
    case "perfil":
      await guardarPerfilDocente(usuarioId, operacion.perfil);
      return;
    case "tmaid":
      await guardarResultadoTmaid(usuarioId, operacion.resultado);
      return;
    case "progreso":
      await actualizarProgresoFase(usuarioId, operacion.fase, operacion.estado);
      return;
    case "badge":
      // Devuelve false si el docente ya lo tenia (23505 del unique): eso es
      // exito, no error -- por eso se ignora el valor de retorno.
      await otorgarBadge(usuarioId, operacion.badgeId, operacion.puntos);
      return;
    case "puntos":
      await sumarPuntos(usuarioId, operacion.cantidad);
      return;
    case "actividad":
      await registrarActividadDiaria(
        usuarioId,
        operacion.racha,
        operacion.ultimaFechaActiva
      );
      return;
  }
}
