"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mensajeError } from "@/lib/store/session";
import { supabaseConfigurado, actualizarContrasena } from "@/lib/supabase/datos";
import { createClient } from "@/lib/supabase/client";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";

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
  const [listo, setListo] = useState(false);
  const [modoDemo, setModoDemo] = useState(false);
  const [sesionValida, setSesionValida] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!supabaseConfigurado()) {
      setModoDemo(true);
      setListo(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSesionValida(Boolean(data.session));
      setListo(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
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

  return (
    <DarkScreen>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline-md font-bold text-white">P</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-white">
            Nueva contraseña
          </h2>
        </div>

        {modoDemo ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-body-sm text-white/60">
              Prototipo Fase 0 -- sin cuentas reales todavía, no hay contraseña que restablecer.
            </p>
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : !listo ? (
          <p className="text-center text-body-sm text-white/40">Verificando enlace...</p>
        ) : exito ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-body-sm text-white/70">
              Tu contraseña se actualizó. Ya puedes iniciar sesión con la nueva.
            </p>
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : !sesionValida ? (
          <div className="glass-card space-y-4 rounded-xl p-8 text-center">
            <p className="text-body-sm text-red-300">
              Este enlace no es válido o ya expiró. Pide uno nuevo desde &quot;¿Olvidaste tu contraseña?&quot; en el login.
            </p>
            <Link href="/recuperar" className="font-bold text-tertiary-fixed-dim">
              Pedir un enlace nuevo
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-6 rounded-xl p-8">
            <div className="space-y-2">
              <label className="text-label-lg font-label-lg text-white/60">
                Contraseña nueva
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
              <label className="text-label-lg font-label-lg text-white/60">
                Confirmar contraseña
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
            {error && (
              <p className="text-body-sm rounded-lg bg-red-500/10 px-4 py-3 text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={guardando}
              className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar contraseña"} <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </form>
        )}
      </section>
    </DarkScreen>
  );
}
