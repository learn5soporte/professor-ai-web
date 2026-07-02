"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";

/**
 * SCREEN 2: LOGIN -- base literal: code.html real de Stitch
 * (bloque_1_y_2_acceso_y_onboarding). Fase 0: no hay Supabase Auth todavia,
 * el email ingresado simula la sesion (cualquier password es aceptada).
 */
export default function LoginPage() {
  const router = useRouter();
  const { perfil, iniciarSesionMock } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function entrar() {
    const nombre = email.split("@")[0] || "Docente";
    iniciarSesionMock(nombre);
    router.push(perfil ? "/dashboard" : "/onboarding");
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
            Prototipo Fase 0 -- sin cuenta real todavía. Cualquier email /
            contraseña te lleva al flujo completo.
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
          </div>
          <button type="submit" className="btn-accent flex w-full items-center justify-center gap-2">
            Entrar <Icon name="arrow_forward" className="text-[18px]" />
          </button>
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
