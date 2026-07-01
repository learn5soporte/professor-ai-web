"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/store/session";

const HERRAMIENTAS = [
  { nombre: "Generador de Planeaciones", href: "#", disponible: false },
  { nombre: "Creador de Rúbricas", href: "#", disponible: false },
  { nombre: "Banco de Prompts Pedagógicos", href: "/herramientas/prompts", disponible: true },
];

export default function DashboardPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid, reiniciar } = useSession();

  useEffect(() => {
    if (!perfil) {
      router.replace("/login");
    } else if (!resultadoTmaid) {
      router.replace("/tmaid");
    }
  }, [perfil, resultadoTmaid, router]);

  if (!perfil || !resultadoTmaid) {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface">
      <header className="glass-nav fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4">
        <span className="font-headline text-xl font-black tracking-tighter text-primary">
          Professor AI
        </span>
        <button
          onClick={() => {
            reiniciar();
            router.push("/login");
          }}
          className="text-xs font-semibold text-on-surface-variant hover:text-primary"
        >
          Reiniciar sesión de prueba
        </button>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Hola, {perfil.nombre}
        </p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">
          {perfil.materia} · {perfil.nivelEducativo}
        </h1>

        <div className="card mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-on-surface-variant">
              Tu nivel IA
            </p>
            <p className="text-2xl font-black text-primary">
              {resultadoTmaid.nivelAsignado}
            </p>
          </div>
          <Link
            href="/tmaid/resultado"
            className="text-sm font-semibold text-secondary hover:underline"
          >
            Ver mi perfil completo →
          </Link>
        </div>

        <div className="card mt-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Tu plan de ruta
          </h2>
          <div className="flex flex-col gap-3">
            {resultadoTmaid.rutaPersonalizada.map((fase) => (
              <div
                key={fase.fase}
                className="rounded-lg bg-surface-container-low p-4"
              >
                <p className="font-bold text-on-surface">{fase.fase}</p>
                <p className="text-sm text-on-surface-variant">
                  {fase.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Herramientas rápidas
          </h2>
          <div className="flex flex-col gap-2">
            {HERRAMIENTAS.map((h) =>
              h.disponible ? (
                <Link
                  key={h.nombre}
                  href={h.href}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  {h.nombre}
                  <span className="text-primary">→</span>
                </Link>
              ) : (
                <div
                  key={h.nombre}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant opacity-60"
                >
                  {h.nombre}
                  <span className="font-label text-xs uppercase">
                    Próximamente
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
