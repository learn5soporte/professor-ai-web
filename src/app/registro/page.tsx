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
 * SCREEN 3: REGISTRO -- base literal: code.html real de Stitch
 * (bloque_1_y_2_acceso_y_onboarding).
 *
 * Fase 1.1: si el deploy tiene credenciales de Supabase (usarSupabase),
 * este formulario crea una cuenta real (Supabase Auth). Si no (como en
 * todo deploy hasta ahora), sigue funcionando exactamente igual que en
 * Fase 0: crea la sesión mock directamente, sin cambios de comportamiento.
 */
export default function RegistroPage() {
  const router = useRouter();
  const { t } = useIdioma();
  const { usarSupabase, registrar } = useSession();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aceptaTerminos) return;
    setError(null);
    setYaExiste(false);
    setCargando(true);
    const { error: errorAuth, yaExiste: cuentaExistente, requiereConfirmacion } = await registrar(
      email,
      password,
      nombre.trim() || email.split("@")[0] || t.registro.docenteFallback
    );
    setCargando(false);
    if (errorAuth) {
      setError(errorAuth);
      setYaExiste(Boolean(cuentaExistente));
      return;
    }
    if (requiereConfirmacion) {
      // La cuenta se creo pero todavia no hay sesion activa -- el proyecto
      // tiene "Confirm email" activo. No hay perfil que llenar todavia, asi
      // que no lo mandamos a /onboarding: le pedimos que confirme el correo.
      setConfirmacionPendiente(true);
      return;
    }
    router.push("/onboarding");
  }

  if (confirmacionPendiente) {
    return (
      <DarkScreen>
        <div className="fixed right-4 top-4 z-50">
          <LanguageToggle variante="oscuro" />
        </div>
        <section className="flex w-full max-w-md flex-col px-margin-mobile">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
              <Icon name="mail" className="text-[28px] text-white" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-white">
              {t.registro.confirmaTitulo}
            </h2>
            <p className="mt-3 text-base text-white/60">
              {t.registro.confirmaTexto1}{" "}
              <span className="font-bold text-white">{email}</span>{" "}
              {t.registro.confirmaTexto2}
            </p>
          </div>
          <Link href="/login" className="btn-accent flex w-full items-center justify-center gap-2">
            {t.registro.irLogin}
          </Link>
        </section>
      </DarkScreen>
    );
  }

  return (
    <DarkScreen>
      <div className="fixed right-4 top-4 z-50">
        <LanguageToggle variante="oscuro" />
      </div>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline text-lg font-bold text-white">P</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-white">
            {t.registro.titulo}
          </h2>
          {usarSupabase && (
            <p className="mt-2 text-center text-sm text-white/40">
              {t.registro.subtituloReal}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-xl p-8">
          <div className="space-y-2">
            <label className="font-label text-sm font-semibold text-white/60">
              {t.registro.nombre}
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t.registro.nombrePlaceholder}
              className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white focus:ring-2 focus:ring-secondary-container"
            />
          </div>
          <div className="space-y-2">
            <label className="font-label text-sm font-semibold text-white/60">
              {t.registro.email}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="profesor@academia.edu"
              className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white focus:ring-2 focus:ring-secondary-container"
            />
          </div>
          <div className="space-y-2">
            <label className="font-label text-sm font-semibold text-white/60">
              {t.registro.password}
            </label>
            <input
              type="password"
              required
              minLength={usarSupabase ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white focus:ring-2 focus:ring-secondary-container"
            />
          </div>
          <label className="group flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              required
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-transparent text-tertiary focus:ring-0"
            />
            <span className="text-sm text-white/60 transition-colors group-hover:text-white">
              {t.registro.terminos}
            </span>
          </label>
          {error && (
            <div className="space-y-2 rounded-lg bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
              {yaExiste && (
                <Link href="/login" className="text-sm font-bold text-tertiary-fixed-dim underline">
                  {t.registro.irLogin}
                </Link>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
          >
            {cargando ? t.registro.creando : t.registro.crear} <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <p className="text-center text-sm text-white/40">
            {t.registro.yaTienes}{" "}
            <Link href="/login" className="font-bold text-tertiary-fixed-dim">
              {t.registro.iniciaSesion}
            </Link>
          </p>
        </form>
      </section>
    </DarkScreen>
  );
}
