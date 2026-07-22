"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, mensajeError } from "@/lib/store/session";
import { solicitarRecuperacion } from "@/lib/supabase/datos";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";

/**
 * Pantalla "Olvidé mi contraseña" -- Fase 1.1. Pide el email y dispara el
 * correo de recuperación real de Supabase Auth (ver solicitarRecuperacion
 * en datos.ts). En modo Fase 0 (sin Supabase configurado) no tiene sentido
 * -- se muestra un aviso y un link de vuelta a /login, ya que cualquier
 * email/contraseña ya deja entrar en ese modo.
 */
export default function RecuperarPage() {
  const { usarSupabase } = useSession();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await solicitarRecuperacion(email);
      setEnviado(true);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <DarkScreen>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline-md font-bold text-white">P</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-white">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-body-sm text-white/40">
            {usarSupabase
              ? "Escribe tu email y te enviamos un enlace para poner una contraseña nueva."
              : "Prototipo Fase 0 -- sin cuentas reales todavía, no hay contraseña que recuperar."}
          </p>
        </div>

        {!usarSupabase ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-body-sm text-white/60">
              En este modo de demostración cualquier email / contraseña te deja entrar -- no hace falta recuperar nada.
            </p>
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : enviado ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-body-sm text-white/70">
              Si existe una cuenta con ese email, te llegará un correo con el enlace para poner una contraseña nueva. Revisa también spam.
            </p>
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-6 rounded-xl p-8">
            <div className="space-y-2">
              <label className="text-label-lg font-label-lg text-white/60">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesor@academia.edu"
                className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-secondary-container"
              />
            </div>
            {error && (
              <p className="text-body-sm rounded-lg bg-red-500/10 px-4 py-3 text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar enlace de recuperación"} <Icon name="arrow_forward" className="text-[18px]" />
            </button>
            <p className="text-center text-body-sm text-white/40">
              <Link href="/login" className="font-bold text-tertiary-fixed-dim">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </section>
    </DarkScreen>
  );
}
