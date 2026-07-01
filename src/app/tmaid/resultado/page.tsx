"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";

export default function ResultadoTmaidPage() {
  const router = useRouter();
  const { perfil, resultadoTmaid } = useSession();

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

  const dimensionesEntries = Object.entries(resultadoTmaid.dimensiones) as [
    keyof typeof resultadoTmaid.dimensiones,
    number
  ][];

  return (
    <main className="min-h-screen bg-surface px-6 pb-24 pt-16">
      <div className="mx-auto max-w-2xl">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Tu perfil docente
        </p>
        <h1 className="mt-2 text-4xl font-black text-on-surface">
          Nivel: {resultadoTmaid.nivelAsignado}
        </h1>

        <div className="card mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Perfil pedagógico-IA
          </h2>
          <p className="mt-2 text-lg text-on-surface">
            {resultadoTmaid.perfilPedagogicoIA}
          </p>
        </div>

        <div className="card mt-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Tus 4 dimensiones
          </h2>
          <div className="flex flex-col gap-3">
            {dimensionesEntries.map(([dim, valor]) => (
              <div key={dim}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-on-surface">
                    {ETIQUETA_DIMENSION[dim]}
                  </span>
                  <span className="text-on-surface-variant">
                    {valor.toFixed(1)} / 5
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(valor / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Mapa de brechas
          </h2>
          <ul className="list-inside list-disc text-on-surface">
            {resultadoTmaid.mapaBrechas.map((brecha) => (
              <li key={brecha}>{brecha}</li>
            ))}
          </ul>
        </div>

        <div className="card mt-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-on-surface-variant">
            Tu ruta personalizada
          </h2>
          <div className="flex flex-col gap-4">
            {resultadoTmaid.rutaPersonalizada.map((fase, i) => (
              <div key={fase.fase} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-on-secondary-container">
                    {i + 1}
                  </span>
                  {i < resultadoTmaid.rutaPersonalizada.length - 1 && (
                    <span className="mt-1 h-full w-px flex-1 bg-outline-variant/40" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-bold text-on-surface">{fase.fase}</p>
                  <p className="text-sm text-on-surface-variant">
                    {fase.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="btn-primary mt-6 w-full"
        >
          Ir a mi escritorio →
        </button>
      </div>
    </main>
  );
}
