"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";

export default function LoginPage() {
  const router = useRouter();
  const { iniciarSesionMock } = useSession();
  const [nombre, setNombre] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    iniciarSesionMock(nombre.trim() || "Docente");
    router.push("/onboarding");
  }

  return (
    <main className="dark-screen flex items-center justify-center px-6">
      <div className="dark-screen-glow-blue -right-10 -top-10 h-72 w-72" />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white/5 p-8 backdrop-blur-md">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-tertiary-fixed">
          Professor AI · Learn5
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Iniciar Sesion
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Prototipo Fase 0 — sin cuenta real todavia. Escribe tu nombre para
          simular tu entrada y recorrer el flujo completo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-label text-xs font-semibold text-white/50">
              Nombre
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Marcela Rojas"
              className="dark-input"
            />
          </label>

          <button type="submit" className="btn-accent">
            Comenzar →
          </button>
        </form>

        <p className="mt-6 text-xs text-white/40">
          En Fase 1 esto se reemplaza por Supabase Auth (email/contrasena +
          Google OAuth) manteniendo esta misma pantalla.
        </p>
      </div>
    </main>
  );
}
