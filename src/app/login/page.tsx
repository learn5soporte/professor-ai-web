"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { useIdioma } from "@/lib/i18n";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";
import { LanguageToggle } from "@/components/LanguageToggle";

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
  const { t } = useIdioma();
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
    setReenvioMensaje(errorReenvio ?? t.login.reenvioOk);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    entrar();
  }

  return (
    <DarkScreen>
      <div className="fixed right-4 top-4 z-50">
        <LanguageToggle variante="oscuro" />
      </div>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline text-lg font-bold text-white">P</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-white">
            {t.login.titulo}
          </h2>
          <p className="mt-2 text-center text-sm text-white/40">
            {usarSupabase ? t.login.subtituloReal : t.login.subtituloDemo}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-6 rounded-xl p-8">
          <div className="space-y-2">
            <label className="font-label text-sm font-semibold text-white/60">
              {t.login.email}
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
            <label className="font-label text-sm font-semibold text-white/60">
              {t.login.password}
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
              <p className="text-right text-sm">
                <Link href="/recuperar" className="text-white/40 underline hover:text-white/70">
                  {t.login.olvidaste}
                </Link>
              </p>
            )}
          </div>
          {error && (
            <div className="space-y-2 rounded-lg bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
              {requiereConfirmacion && (
                <button
                  type="button"
                  onClick={reenviarCorreo}
                  disabled={reenviando || !email}
                  className="text-sm font-bold text-tertiary-fixed-dim underline disabled:opacity-60"
                >
                  {reenviando ? t.login.reenviando : t.login.reenviar}
                </button>
              )}
            </div>
          )}
          {reenvioMensaje && (
            <p className="text-sm rounded-lg bg-white/5 px-4 py-3 text-white/70">
              {reenvioMensaje}
            </p>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
          >
            {cargando ? t.login.entrando : t.login.entrar} <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          {!usarSupabase && (
            <>
              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-tertiary-fixed-dim/20" />
                <span className="text-sm font-bold uppercase tracking-widest text-tertiary-fixed-dim">
                  {t.login.o}
                </span>
                <div className="h-px flex-1 bg-tertiary-fixed-dim/20" />
              </div>
              <button type="button" onClick={entrar} className="btn-outline-dark flex w-full items-center justify-center gap-2">
                <Icon name="account_circle" />
                {t.login.continuarGoogle}
              </button>
            </>
          )}
          <p className="text-center text-sm text-white/40">
            {t.login.noTienesCuenta}{" "}
            <Link href="/registro" className="font-bold text-tertiary-fixed-dim">
              {t.login.registrarse}
            </Link>
          </p>
        </form>
      </section>
    </DarkScreen>
  );
}
