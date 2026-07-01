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
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="card w-full max-w-md">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Professor AI · Learn5
        </p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">
          Bienvenido, docente.
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Prototipo Fase 0 — sin cuenta real todavía. Escribe tu nombre para
          simular tu entrada y recorrer el flujo completo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-label text-xs font-semibold text-on-surface-variant">
              Nombre
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Marcela Rojas"
              className="rounded-lg bg-surface-container-low px-4 py-3 text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
            />
          </label>

          <button type="submit" className="btn-primary">
            Comenzar →
          </button>
        </form>

        <p className="mt-6 text-xs text-on-surface-variant">
          En Fase 1 esto se reemplaza por Supabase Auth (email/contraseña +
          Google OAuth) manteniendo esta misma pantalla.
        </p>
      </div>
    </main>
  );
}
