"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mensajeError } from "@/lib/store/session";
import { supabaseConfigurado, actualizarContrasena } from "@/lib/supabase/datos";
import { createClient } from "@/lib/supabase/client";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";
import { useIdioma } from "@/lib/i18n";

/**
 * Pantalla a la que Supabase redirige desde el enlace del correo de
 * recuperación (ver solicitarRecuperacion en datos.ts). El SDK de
 * Supabase detecta el token de recuperación en el hash de la URL solo
 * (detectSessionInUrl) y crea una sesión temporal de tipo "recovery" --
 * esta pantalla espera a que esa sesión exista y deja poner una
 * contraseña nueva. No pasa por session.tsx/SessionProvider a propósito:
 * es un flujo de auth aislado, no depende del estado normal de la app.
 */
export default function RestablecerPasswordPage() {
  const { t } = useIdioma();
  const [listo, setListo] = useState(false);
  const [modoDemo, setModoDemo] = useState(false);
  const [sesionValida, setSesionValida] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState<null | "min" | "coinciden">(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!supabaseConfigurado()) {
      setModoDemo(true);
      setListo(true);
      return;
    }
    const supabase = createClient();

    // El SDK de Supabase detecta el token de recuperacion del hash de la
    // URL (detectSessionInUrl) de forma asincrona, en paralelo a este
    // efecto -- no hay garantia de que ya haya terminado cuando llamamos
    // getSession() aqui abajo. Si nos quedamos solo con esa llamada,
    // hay una carrera real: a veces getSession() devuelve null un
    // instante antes de que la sesion de recuperacion quede lista, y el
    // docente ve "enlace invalido" con un enlace que en realidad era
    // valido. Por eso tambien escuchamos el evento PASSWORD_RECOVERY (o
    // cualquier sesion) via onAuthStateChange, y solo si ninguno de los
    // dos caminos resuelve nada en un par de segundos asumimos que el
    // enlace de verdad es invalido o expiro.
    let resuelto = false;
    const resolver = (huboSesion: boolean) => {
      if (resuelto) return;
      resuelto = true;
      setSesionValida(huboSesion);
      setListo(true);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        resolver(Boolean(session));
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) resolver(true);
    });

    const timeout = setTimeout(() => resolver(false), 2500);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setErrorLocal("min");
      return;
    }
    if (password !== confirmacion) {
      setErrorLocal("coinciden");
      return;
    }
    setErrorLocal(null);
    setGuardando(true);
    try {
      await actualizarContrasena(password);
      setExito(true);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  }

  const mensajeErrorVisible =
    error ??
    (errorLocal === "min"
      ? t.recuperar.errorMin
      : errorLocal === "coinciden"
      ? t.recuperar.errorNoCoinciden
      : null);

  return (
    <DarkScreen>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline text-lg font-bold text-white">P</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-white">
            {t.recuperar.nuevaContrasena}
          </h2>
        </div>

        {modoDemo ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-sm text-white/60">{t.recuperar.demoAviso2}</p>
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              {t.recuperar.volverLogin}
            </Link>
          </div>
        ) : !listo ? (
          <p className="text-center text-sm text-white/40">{t.recuperar.verificando}</p>
        ) : exito ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-sm text-white/70">{t.recuperar.exitoTexto}</p>
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              {t.recuperar.irLogin}
            </Link>
          </div>
        ) : !sesionValida ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-sm text-red-300">{t.recuperar.enlaceInvalido}</p>
            <Link href="/recuperar" className="font-bold text-tertiary-fixed-dim">
              {t.recuperar.pedirNuevo}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-6 rounded-xl p-8">
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-white/60">
                {t.recuperar.passNueva}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-secondary-container"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-white/60">
                {t.recuperar.confirmarPass}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-secondary-container"
              />
            </div>
            {mensajeErrorVisible && (
              <p className="text-sm rounded-lg bg-red-500/10 px-4 py-3 text-red-300">
                {mensajeErrorVisible}
              </p>
            )}
            <button
              type="submit"
              disabled={guardando}
              className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {guardando ? t.recuperar.guardando : t.recuperar.guardarPass}{" "}
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </form>
        )}
      </section>
    </DarkScreen>
  );
}
