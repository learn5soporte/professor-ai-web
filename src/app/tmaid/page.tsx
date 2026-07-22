"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import {
  PREGUNTAS_LIKERT,
  PREGUNTA_ABIERTA,
  ESCALA_LIKERT,
  type Dimension,
} from "@/lib/tmaid/preguntas";
import { calcularResultadoTmaid, ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";

/**
 * Diagnostico TMAID -- base literal: code.html real de Stitch
 * (bloque_3_diagn_stico_tmaid): SCREEN 9 (intro oscura), SCREEN 10 (Likert,
 * header fijo tipo glass-card), SCREEN 11 (pregunta abierta) y SCREEN 12
 * (procesando). El resultado (SCREEN 13) vive en /tmaid/resultado.
 */

const TOTAL_LIKERT = PREGUNTAS_LIKERT.length;
const TOTAL_PASOS = TOTAL_LIKERT + 1; // + pregunta abierta

const ICONOS_PROCESANDO = ["insights", "school", "precision_manufacturing"];

type Paso = "intro" | number | "procesando";

export default function TmaidPage() {
  const router = useRouter();
  const { perfil, guardarResultadoTmaid, otorgarBadge, cargando } = useSession();
  const [paso, setPaso] = useState<Paso>("intro");
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [miedos, setMiedos] = useState("");
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );
  const [iconoIdx, setIconoIdx] = useState(0);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  useEffect(() => {
    if (paso !== "procesando") return;
    const rotacion = setInterval(() => {
      setIconoIdx((i) => (i + 1) % ICONOS_PROCESANDO.length);
    }, 800);
    const salida = setTimeout(() => {
      if (!perfil) {
        router.push("/onboarding");
        return;
      }
      const resultado = calcularResultadoTmaid(respuestas, perfil);
      guardarResultadoTmaid(resultado);
      const gano = otorgarBadge("diagnostico-completo");
      if (gano) setBadgeGanado(BADGES["diagnostico-completo"]);
      setTimeout(() => router.push("/tmaid/resultado"), gano ? 900 : 0);
    }, 3500);
    return () => {
      clearInterval(rotacion);
      clearTimeout(salida);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  if (cargando || !perfil || !perfilCompleto(perfil)) return null;

  const esIntro = paso === "intro";
  const esProcesando = paso === "procesando";
  const idx = typeof paso === "number" ? paso : 0;
  const esPreguntaAbierta = typeof paso === "number" && paso === TOTAL_LIKERT;
  const pregunta = typeof paso === "number" && !esPreguntaAbierta ? PREGUNTAS_LIKERT[idx] : null;

  const puedeContinuar = esPreguntaAbierta
    ? true
    : pregunta
    ? respuestas[pregunta.id] !== undefined
    : false;

  function seleccionar(valor: number) {
    if (!pregunta) return;
    setRespuestas((r) => ({ ...r, [pregunta.id]: valor }));
  }

  function siguiente() {
    if (esIntro) {
      setPaso(0);
      return;
    }
    if (!puedeContinuar) return;
    if (esPreguntaAbierta) {
      setPaso("procesando");
      return;
    }
    setPaso(idx + 1);
  }

  function atras() {
    if (typeof paso !== "number") return;
    if (paso === 0) {
      setPaso("intro");
      return;
    }
    setPaso(paso - 1);
  }

  // SCREEN 9: INTRO
  if (esIntro) {
    return (
      <DarkScreen>
        <section className="relative z-10 max-w-2xl px-margin-mobile text-center">
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-secondary-container/30 blur-xl" />
            <Icon name="psychology" filled className="text-[64px] text-tertiary-fixed-dim" />
          </div>
          <h1 className="font-headline-lg mb-6 text-headline-lg-mobile text-white md:text-headline-lg">
            Tu Diagnóstico Docente IA
          </h1>
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {["CONOCIMIENTO", "HERRAMIENTAS", "INTEGRACIÓN", "ACTITUD"].map((d) => (
              <span
                key={d}
                className="text-label-lg font-label-lg rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-white"
              >
                {d}
              </span>
            ))}
          </div>
          <button
            onClick={siguiente}
            className="group inline-flex items-center gap-4 rounded-full bg-secondary px-8 py-4 font-headline-md text-body-lg text-on-secondary transition-all hover:bg-secondary-container"
          >
            Comenzar Diagnóstico
            <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
          </button>
        </section>
      </DarkScreen>
    );
  }

  // SCREEN 12: PROCESSING
  if (esProcesando) {
    return (
      <DarkScreen>
        <div className="relative z-10 mb-12 h-48 w-48">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-secondary border-t-tertiary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              name={ICONOS_PROCESANDO[iconoIdx]}
              filled
              className="text-4xl text-on-secondary"
            />
          </div>
        </div>
        <div className="relative z-10 text-center">
          <h3 className="font-headline-md mb-4 text-white">Procesando tu perfil...</h3>
          <p className="font-body-md animate-pulse text-white/60">
            Nuestra IA está analizando tus respuestas para generar tu ruta personalizada.
          </p>
        </div>
      </DarkScreen>
    );
  }

  // SCREEN 11: OPEN QUESTION
  if (esPreguntaAbierta) {
    return (
      <div className="min-h-screen bg-surface pb-12 pt-24">
        <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
        <HeaderProgreso dimensionLabel="Integración Curricular" paso={TOTAL_PASOS} total={TOTAL_PASOS} />
        <div className="mx-auto flex w-full max-w-3xl flex-col px-margin-mobile">
          <h2 className="font-headline-md mb-8 text-headline-md text-primary">
            {PREGUNTA_ABIERTA.texto}
          </h2>
          <div className="relative">
            <textarea
              value={miedos}
              onChange={(e) => setMiedos(e.target.value.slice(0, 500))}
              maxLength={500}
              placeholder={PREGUNTA_ABIERTA.placeholder}
              className="atmospheric-shadow h-64 w-full rounded-xl border-none bg-white/40 p-8 text-body-lg backdrop-blur-md transition-all placeholder:text-outline focus:bg-white/60 focus:ring-2 focus:ring-secondary/20"
            />
            <div className="font-label-lg absolute bottom-6 right-8 font-bold text-tertiary">
              {miedos.length} / 500
            </div>
          </div>
          <div className="mt-12 flex justify-between">
            <button onClick={atras} className="rounded-full px-5 py-2 text-sm font-semibold text-on-surface-variant">
              Atrás
            </button>
            <button
              onClick={siguiente}
              className="font-label-lg inline-flex items-center gap-4 rounded-full bg-primary px-10 py-4 text-on-primary transition-all hover:bg-on-primary-fixed-variant"
            >
              Finalizar Diagnóstico
              <Icon name="auto_awesome" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 10: LIKERT QUESTION
  return (
    <div className="min-h-screen bg-surface pb-12 pt-24">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <HeaderProgreso
        dimensionLabel={pregunta ? ETIQUETA_DIMENSION[pregunta.dimension] : ""}
        paso={idx + 1}
        total={TOTAL_PASOS}
      />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-margin-mobile">
        <h2 className="font-headline-md mb-16 px-4 text-center text-headline-md text-primary">
          {pregunta?.texto}
        </h2>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-5">
          {ESCALA_LIKERT.map((opcion) => {
            const selected = pregunta ? respuestas[pregunta.id] === opcion.valor : false;
            return (
              <button
                key={opcion.valor}
                onClick={() => seleccionar(opcion.valor)}
                className={`atmospheric-shadow group flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-center transition-all active:scale-95 ${
                  selected ? "border-secondary bg-secondary-fixed" : "border-transparent bg-white hover:bg-secondary-fixed"
                }`}
              >
                <span className="font-body-sm text-on-surface-variant">{opcion.etiqueta}</span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                    selected ? "border-secondary" : "border-outline-variant group-hover:border-secondary"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full transition-colors ${
                      selected ? "bg-secondary" : "bg-transparent group-hover:bg-secondary"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-12 flex w-full justify-between">
          <button onClick={atras} className="rounded-full px-5 py-2 text-sm font-semibold text-on-surface-variant">
            Atrás
          </button>
          <button
            onClick={siguiente}
            disabled={!puedeContinuar}
            className="btn-primary disabled:opacity-40"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

function HeaderProgreso({
  dimensionLabel,
  paso,
  total,
}: {
  dimensionLabel: string;
  paso: number;
  total: number;
}) {
  return (
    <header className="glass-card fixed left-0 top-0 z-50 flex w-full flex-col gap-2 px-margin-mobile py-4">
      <div className="font-label-lg text-label-lg flex items-center justify-between text-on-surface-variant">
        <span>
          DIMENSIÓN:{" "}
          <span className="font-bold uppercase tracking-wider text-tertiary">
            {dimensionLabel}
          </span>
        </span>
        <span>
          {paso} / {total}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className="h-full rounded-full bg-tertiary-container transition-all duration-700"
          style={{ width: `${(paso / total) * 100}%` }}
        />
      </div>
    </header>
  );
}
