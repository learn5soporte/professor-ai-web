"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";

/**
 * SCREEN 2: LOGIN -- base literal: code.html real de Stitch
 * (bloque_1_y_2_acceso_y_onboarding).
 *
 * Fase 1.1: si el deploy tiene credenciales de Supabase (usarSupabase),
 * este formulario hace un login real (email/password verificados de
 * verdad). Si no (como en todo deploy hasta ahora), sigue funcionando
 * exactamente igual que en Fase 0: cualquier email/password te deja entrar
 * -- comportamiento sin cambios para no romper la demo actual.
 */
export default function LoginPage() {
  const router = useRouter();
  const { usarSupabase, iniciarSesion, reenviarConfirmacion } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [requiereConfirmacion, setRequiereConfirmacion] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenvioMensaje, setReenvioMensaje] = useState<string | null>(null);

  async function entrar() {
    setError(null);
    setRequiereConfirmacion(false);
    setReenvioMensaje(null);
    setCargando(true);
    const { error: errorAuth, tienePerfil, requiereConfirmacion: pideConfirmacion } = await iniciarSesion(email, password);
    setCargando(false);
    if (errorAuth) {
      setError(errorAuth);
      setRequiereConfirmacion(Boolean(pideConfirmacion));
      return;
    }
    router.push(tienePerfil ? "/dashboard" : "/onboarding");
  }

  async function reenviarCorreo() {
    setReenviando(true);
    setReenvioMensaje(null);
    const { error: errorReenvio } = await reenviarConfirmacion(email);
    setReenviando(false);
    setReenvioMensaje(errorReenvio ?? "Correo reenviado -- revisa tu bandeja de entrada (o spam).");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    entrar();
  }

  return (
    <DarkScreen>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline-md font-bold text-white">P</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-body-sm text-white/40">
            {usarSupabase
              ? "Ingresa con el email y contraseña de tu cuenta."
              : "Prototipo Fase 0 -- sin cuenta real todavía. Cualquier email / contraseña te lleva al flujo completo."}
          </p>
        </div>

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
          <div className="space-y-2">
            <label className="text-label-lg font-label-lg text-white/60">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-secondary-container"
            />
            {usarSupabase && (
              <p className="text-right text-body-sm">
                <Link href="/recuperar" className="text-white/40 underline hover:text-white/70">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            )}
          </div>
          {error && (
            <div className="space-y-2 rounded-lg bg-red-500/10 px-4 py-3">
              <p className="text-body-sm text-red-300">{error}</p>
              {requiereConfirmacion && (
                <button
                  type="button"
                  onClick={reenviarCorreo}
                  disabled={reenviando || !email}
                  className="text-body-sm font-bold text-tertiary-fixed-dim underline disabled:opacity-60"
                >
                  {reenviando ? "Reenviando..." : "Reenviar correo de confirmación"}
                </button>
              )}
            </div>
          )}
          {reenvioMensaje && (
            <p className="text-body-sm rounded-lg bg-white/5 px-4 py-3 text-white/70">
              {reenvioMensaje}
            </p>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
          >
            {cargando ? "Entrando..." : "Entrar"} <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          {!usarSupabase && (
            <>
              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-tertiary-fixed-dim/20" />
                <span className="text-body-sm font-bold uppercase tracking-widest text-tertiary-fixed-dim">
                  o
                </span>
                <div className="h-px flex-1 bg-tertiary-fixed-dim/20" />
              </div>
              <button type="button" onClick={entrar} className="btn-outline-dark flex w-full items-center justify-center gap-2">
                <Icon name="account_circle" />
                Continuar con Google
              </button>
            </>
          )}
          <p className="text-center text-body-sm text-white/40">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-bold text-tertiary-fixed-dim">
              Registrarse
            </Link>
          </p>
        </form>
      </section>
    </DarkScreen>
  );
}
