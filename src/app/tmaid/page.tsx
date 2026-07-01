"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import {
  PREGUNTAS_LIKERT,
  PREGUNTA_ABIERTA,
  ESCALA_LIKERT,
} from "@/lib/tmaid/preguntas";
import { calcularResultadoTmaid } from "@/lib/tmaid/scoring";

const TOTAL_PASOS = PREGUNTAS_LIKERT.length + 1; // + pregunta abierta

export default function TmaidPage() {
  const router = useRouter();
  const { perfil, guardarResultadoTmaid } = useSession();
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [miedos, setMiedos] = useState("");

  const esPreguntaAbierta = paso === PREGUNTAS_LIKERT.length;
  const pregunta = !esPreguntaAbierta ? PREGUNTAS_LIKERT[paso] : null;

  const puedeContinuar = esPreguntaAbierta
    ? true
    : respuestas[pregunta!.id] !== undefined;

  function seleccionar(valor: number) {
    if (!pregunta) return;
    setRespuestas((r) => ({ ...r, [pregunta.id]: valor }));
  }

  function siguiente() {
    if (!puedeContinuar) return;

    if (esPreguntaAbierta) {
      if (!perfil) {
        router.push("/onboarding");
        return;
      }
      const resultado = calcularResultadoTmaid(respuestas, perfil);
      guardarResultadoTmaid(resultado);
      router.push("/tmaid/resultado");
      return;
    }

    setPaso((p) => p + 1);
  }

  function atras() {
    if (paso > 0) setPaso((p) => p - 1);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="card w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
            Diagnóstico TMAID · {paso + 1} de {TOTAL_PASOS}
          </p>
          <span className="text-xs text-on-surface-variant">
            ~5 minutos
          </span>
        </div>

        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((paso + 1) / TOTAL_PASOS) * 100}%` }}
          />
        </div>

        {!esPreguntaAbierta && pregunta && (
          <>
            <h1 className="mb-6 text-xl font-black text-on-surface">
              {pregunta.texto}
            </h1>
            <div className="flex flex-col gap-2">
              {ESCALA_LIKERT.map((opcion) => (
                <button
                  key={opcion.valor}
                  onClick={() => seleccionar(opcion.valor)}
                  className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    respuestas[pregunta.id] === opcion.valor
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
          </>
        )}

        {esPreguntaAbierta && (
          <>
            <h1 className="mb-6 text-xl font-black text-on-surface">
              {PREGUNTA_ABIERTA.texto}
            </h1>
            <textarea
              value={miedos}
              onChange={(e) => setMiedos(e.target.value)}
              placeholder={PREGUNTA_ABIERTA.placeholder}
              rows={4}
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
            />
            <p className="mt-2 text-xs text-on-surface-variant">
              Opcional — no afecta tu resultado, pero ayuda al tutor de IA a
              acompañarte mejor.
            </p>
          </>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={atras}
            disabled={paso === 0}
            className="rounded-full px-5 py-2 text-sm font-semibold text-on-surface-variant disabled:opacity-0"
          >
            Atrás
          </button>
          <button
            onClick={siguiente}
            disabled={!puedeContinuar}
            className="btn-primary disabled:opacity-40"
          >
            {esPreguntaAbierta ? "Ver mi perfil →" : "Continuar →"}
          </button>
        </div>
      </div>
    </main>
  );
}
