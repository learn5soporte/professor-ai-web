"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { Icon } from "@/components/Icon";
import { Confetti } from "@/components/Confetti";

/**
 * Espacio del Reto + Celebracion -- base literal: code.html real de Stitch
 * (bloque_4_y_5_dashboard_y_ruta_formativa, Section 17: screen-challenge y
 * Section 19: screen-celebration). Fase 0: no hay GPT-4o real todavia, el
 * "preview de output IA" es una simulacion de la respuesta.
 */

const BADGE_POR_FASE: Record<string, string> = {
  Explorar: "fase-explorar",
  Aplicar: "fase-aplicar",
  Dominar: "fase-dominar",
};

const TEORIA_POR_FASE: Record<string, { titulo: string; parrafo: string; tips: string[] }> = {
  Explorar: {
    titulo: "Teoría esencial: Primeros prompts",
    parrafo:
      "Un buen prompt exploratorio define claramente el rol de la IA, el contexto de tu aula y el resultado que esperas.",
    tips: [
      'Define el rol: "Actúa como un especialista en didáctica..."',
      'Da contexto: nivel, materia, tamaño del grupo.',
    ],
  },
  Aplicar: {
    titulo: "Teoría esencial: Prompts de personalización",
    parrafo:
      "La personalización efectiva requiere tres elementos: contexto del estudiante, objetivo de aprendizaje y restricciones de formato.",
    tips: [
      'Define el rol: "Actúa como un psicopedagogo..."',
      'Sube o baja la dificultad: "Adapta este texto para un nivel..."',
    ],
  },
  Dominar: {
    titulo: "Teoría esencial: Prompts de evaluación",
    parrafo:
      "Para dominar la IA en evaluación, encadena instrucciones: primero pide criterios, luego pide retroalimentación específica por estudiante.",
    tips: [
      'Pide una rúbrica antes de pedir la evaluación en sí.',
      'Solicita siempre retroalimentación accionable, no solo una nota.',
    ],
  },
};

export default function RetoPage() {
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    progresoRutas,
    actualizarProgresoFase,
    otorgarBadge,
    cargando,
  } = useSession();
  const [prompt, setPrompt] = useState("");
  const [estado, setEstado] = useState<"editando" | "procesando" | "listo">("editando");
  const [celebracion, setCelebracion] = useState(false);
  const [puntosGanados, setPuntosGanados] = useState(0);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !resultadoTmaid) return null;

  const fases = resultadoTmaid.rutaPersonalizada;
  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const faseActual = fases[indiceActivo] ?? fases[fases.length - 1];
  const teoria = TEORIA_POR_FASE[faseActual.fase] ?? TEORIA_POR_FASE.Explorar;
  const hayMasFases = indiceActivo >= 0 && indiceActivo < fases.length - 1;

  function enviar() {
    if (!prompt.trim() || estado !== "editando") return;
    setEstado("procesando");
    setTimeout(() => {
      setEstado("listo");
      actualizarProgresoFase(faseActual.fase, "completado");
      const badgeId = BADGE_POR_FASE[faseActual.fase];
      const badge = badgeId ? BADGES[badgeId] : null;
      const gano = badgeId ? otorgarBadge(badgeId) : false;
      setPuntosGanados(gano && badge ? badge.puntos : 10);
      setTimeout(() => setCelebracion(true), 400);
    }, 1500);
  }

  if (celebracion) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-on-secondary-fixed px-6 text-center">
        <Confetti />
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-tertiary-container opacity-40 blur-[80px]" />
          <Icon
            name="emoji_events"
            filled
            className="relative z-10 text-[160px] text-tertiary-fixed-dim"
          />
        </div>
        <h2 className="font-display-lg text-display-lg mb-2 text-white">¡EXCELENTE TRABAJO!</h2>
        <p className="font-headline-md text-headline-md mb-8 text-tertiary-fixed-dim">
          +{puntosGanados} XP GANADOS
        </p>
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => router.push(hayMasFases ? "/rutas" : "/dashboard")}
            className="text-label-lg w-full rounded-full bg-tertiary-container py-4 font-bold text-on-tertiary-fixed transition-transform hover:scale-105"
          >
            {hayMasFases ? "PRÓXIMO RETO" : "IR AL INICIO"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full font-bold text-white/60 transition-colors hover:text-white"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16 pt-8">
      <div className="mx-auto max-w-4xl space-y-gap-xl px-margin-mobile">
        <div className="flex items-center justify-between rounded-xl bg-tertiary-container/10 p-4">
          <button
            onClick={() => router.push("/rutas")}
            className="flex items-center gap-2 font-bold text-on-primary-fixed"
          >
            <Icon name="arrow_back" /> Atrás
          </button>
          <span className="font-bold uppercase tracking-widest text-tertiary-container">
            Reto {indiceActivo + 1} de {fases.length}
          </span>
          <div className="w-10" />
        </div>

        <details className="group overflow-hidden rounded-xl bg-surface-container-low">
          <summary className="flex list-none cursor-pointer items-center justify-between p-6 font-bold text-on-primary-fixed">
            <span>📚 {teoria.titulo}</span>
            <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 px-6 pb-6 text-on-surface-variant">
            <p>{teoria.parrafo}</p>
            <ul className="list-disc space-y-2 pl-5">
              {teoria.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </details>

        <div className="atmospheric-shadow rounded-xl bg-tertiary-fixed p-6 text-on-tertiary-fixed">
          <h3 className="font-headline-md text-headline-md mb-2">TU DESAFÍO</h3>
          <p className="font-body-lg text-body-lg">{faseActual.descripcion}</p>
        </div>

        <div className="grid h-auto grid-cols-1 gap-lg lg:h-[500px] lg:grid-cols-2">
          <div className="atmospheric-shadow flex flex-col gap-md rounded-xl bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-secondary">Área de Trabajo</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={estado !== "editando"}
              placeholder="Escribe tu prompt aquí..."
              className="text-body-sm flex-grow rounded-xl border-none bg-surface-container-lowest p-4 font-mono focus:ring-2 focus:ring-secondary/20"
            />
            <button
              onClick={enviar}
              disabled={!prompt.trim() || estado !== "editando"}
              className="animate-pulse-subtle flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:animate-none disabled:opacity-50"
            >
              {estado === "procesando" ? (
                <>
                  <Icon name="autorenew" className="animate-spin" /> PROCESANDO...
                </>
              ) : (
                <>
                  ENVIAR Y COMPLETAR RETO <Icon name="send" />
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-md overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-on-secondary-fixed/5 p-6">
            <span className="flex items-center gap-2 font-bold text-on-surface-variant">
              <Icon name="preview" /> Preview de Output IA
            </span>
            <div className="flex-grow space-y-4 overflow-y-auto">
              {estado === "editando" && (
                <div className="flex h-full items-center justify-center italic text-on-surface-variant opacity-30">
                  Esperando tu prompt para generar el resultado...
                </div>
              )}
              {estado === "procesando" && (
                <>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-surface-container-highest" />
                </>
              )}
              {estado === "listo" && (
                <p className="text-body-sm text-on-surface">
                  Excelente enfoque. Tu prompt considera el contexto de tus estudiantes y un
                  objetivo claro -- justo lo que buscamos en la fase {faseActual.fase}. Sigue
                  documentando tus resultados en el aula.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
