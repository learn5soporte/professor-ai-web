"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";

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
  const { usarSupabase, registrar } = useSession();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aceptaTerminos) return;
    setError(null);
    setYaExiste(false);
    setCargando(true);
    const { error: errorAuth, yaExiste: cuentaExistente } = await registrar(
      email,
      password,
      nombre.trim() || email.split("@")[0] || "Docente"
    );
    setCargando(false);
    if (errorAuth) {
      setError(errorAuth);
      setYaExiste(Boolean(cuentaExistente));
      return;
    }
    router.push("/onboarding");
  }

  return (
    <DarkScreen>
      <section className="flex w-full max-w-md flex-col px-margin-mobile">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="font-headline-md font-bold text-white">P</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-white">
            Crea tu cuenta
          </h2>
          {usarSupabase && (
            <p className="mt-2 text-center text-body-sm text-white/40">
              Usa un email y contraseña reales -- vas a necesitarlos para volver a entrar.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-xl p-8">
          <div className="space-y-2">
            <label className="text-label-lg font-label-lg text-white/60">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Dr. Julian Casablancas"
              className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white focus:ring-2 focus:ring-secondary-container"
            />
          </div>
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
              className="w-full rounded-xl border-none bg-white/5 px-4 py-4 text-white focus:ring-2 focus:ring-secondary-container"
            />
          </div>
          <div className="space-y-2">
            <label className="text-label-lg font-label-lg text-white/60">
              Contraseña
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
            <span className="text-body-sm text-white/60 transition-colors group-hover:text-white">
              Acepto los términos y condiciones
            </span>
          </label>
          {error && (
            <div className="space-y-2 rounded-lg bg-red-500/10 px-4 py-3">
              <p className="text-body-sm text-red-300">{error}</p>
              {yaExiste && (
                <Link href="/login" className="text-body-sm font-bold text-tertiary-fixed-dim underline">
                  Ir a iniciar sesión
                </Link>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="btn-accent flex w-full items-center justify-center gap-2 disabled:opacity-60"
          >
            {cargando ? "Creando..." : "Crear mi cuenta"} <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </form>
      </section>
    </DarkScreen>
  );
}
